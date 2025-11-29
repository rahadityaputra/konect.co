-- Migration: Add Team Invitations Feature
-- Date: 2025-11-29
-- Description: Add team invitations table and related enums

-- Create invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create team invitations table
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT, -- For inviting non-registered users
    token TEXT UNIQUE NOT NULL, -- Unique token for invitation link
    message TEXT, -- Personal message from inviter
    status invitation_status DEFAULT 'pending',
    expires_at TIMESTAMPTZ, -- Expiration date for invitation
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT check_invitee_or_email CHECK (
        (invitee_id IS NOT NULL AND email IS NULL) OR 
        (invitee_id IS NULL AND email IS NOT NULL)
    ),
    CONSTRAINT unique_team_invitee UNIQUE (team_id, invitee_id),
    CONSTRAINT unique_team_email UNIQUE (team_id, email)
);

-- Add indexes for performance
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_inviter_id ON team_invitations(inviter_id);
CREATE INDEX idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_invitations_updated_at
    BEFORE UPDATE ON team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_team_invitations_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent" ON team_invitations
    FOR SELECT USING (auth.uid() = inviter_id);

-- Policy: Users can view invitations sent to them
CREATE POLICY "Users can view invitations sent to them" ON team_invitations
    FOR SELECT USING (auth.uid() = invitee_id);

-- Policy: Team leaders can create invitations for their teams
CREATE POLICY "Team leaders can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = team_id 
            AND teams.leader_id = auth.uid()
        )
    );

-- Policy: Invitees can update invitation status (accept/decline)
CREATE POLICY "Invitees can update invitation status" ON team_invitations
    FOR UPDATE USING (auth.uid() = invitee_id)
    WITH CHECK (auth.uid() = invitee_id);

-- Policy: Inviters can cancel their invitations
CREATE POLICY "Inviters can cancel invitations" ON team_invitations
    FOR UPDATE USING (auth.uid() = inviter_id)
    WITH CHECK (auth.uid() = inviter_id);

-- Policy: Inviters can delete their invitations
CREATE POLICY "Inviters can delete invitations" ON team_invitations
    FOR DELETE USING (auth.uid() = inviter_id);

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE team_invitations
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at IS NOT NULL 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if user can join team via invitation
CREATE OR REPLACE FUNCTION can_join_team_via_invitation(invitation_token TEXT)
RETURNS TABLE (
    can_join BOOLEAN,
    team_id UUID,
    team_name TEXT,
    inviter_name TEXT,
    message TEXT,
    error_message TEXT
) AS $$
DECLARE
    invitation RECORD;
    team RECORD;
    inviter RECORD;
    current_member_count INTEGER;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation
    FROM team_invitations ti
    WHERE ti.token = invitation_token;
    
    -- Check if invitation exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invitation not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if invitation is still pending
    IF invitation.status != 'pending' THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invitation is no longer valid'::TEXT;
        RETURN;
    END IF;
    
    -- Check if invitation has expired
    IF invitation.expires_at IS NOT NULL AND invitation.expires_at < now() THEN
        -- Update status to expired
        UPDATE team_invitations SET status = 'expired' WHERE id = invitation.id;
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invitation has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Get team details
    SELECT * INTO team FROM teams WHERE id = invitation.team_id;
    
    -- Check if team still exists and is open
    IF NOT FOUND OR team.status != 'open' THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Team is no longer available'::TEXT;
        RETURN;
    END IF;
    
    -- Check if team is full
    SELECT COUNT(*) INTO current_member_count
    FROM team_members WHERE team_id = team.id;
    
    IF current_member_count >= team.max_members THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Team is full'::TEXT;
        RETURN;
    END IF;
    
    -- Get inviter details
    SELECT * INTO inviter FROM profiles WHERE id = invitation.inviter_id;
    
    -- Return success with team details
    RETURN QUERY SELECT 
        true, 
        team.id, 
        team.name, 
        COALESCE(inviter.full_name, 'Unknown'),
        invitation.message,
        NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation and join team
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token TEXT, user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    invitation RECORD;
    team RECORD;
    current_member_count INTEGER;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation
    FROM team_invitations ti
    WHERE ti.token = invitation_token AND ti.status = 'pending';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Invalid or expired invitation'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is the intended recipient
    IF invitation.invitee_id IS NOT NULL AND invitation.invitee_id != user_id THEN
        RETURN QUERY SELECT false, 'This invitation is not for you'::TEXT;
        RETURN;
    END IF;
    
    -- Get team details and check if it's still valid
    SELECT * INTO team FROM teams WHERE id = invitation.team_id AND status = 'open';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Team is no longer available'::TEXT;
        RETURN;
    END IF;
    
    -- Check if team is full
    SELECT COUNT(*) INTO current_member_count
    FROM team_members WHERE team_id = team.id;
    
    IF current_member_count >= team.max_members THEN
        RETURN QUERY SELECT false, 'Team is full'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user is already a member
    IF EXISTS (SELECT 1 FROM team_members WHERE team_id = team.id AND user_id = accept_team_invitation.user_id) THEN
        -- Update invitation status to accepted anyway
        UPDATE team_invitations SET status = 'accepted', updated_at = now() WHERE id = invitation.id;
        RETURN QUERY SELECT true, 'You are already a member of this team'::TEXT;
        RETURN;
    END IF;
    
    -- Add user to team
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (team.id, user_id, 'member');
    
    -- Update invitation status
    UPDATE team_invitations 
    SET status = 'accepted', updated_at = now() 
    WHERE id = invitation.id;
    
    -- Create notification for team leader
    INSERT INTO notifications (user_id, type, title, message, related_id)
    VALUES (
        team.leader_id,
        'team_join',
        'New team member joined',
        (SELECT full_name FROM profiles WHERE id = user_id) || ' has joined your team "' || team.name || '"',
        team.id
    );
    
    RETURN QUERY SELECT true, 'Successfully joined the team!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;