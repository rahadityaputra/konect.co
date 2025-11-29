-- Additional helper queries for Team Invitations feature
-- Use these queries for common operations

-- ===== BASIC QUERIES =====

-- 1. Create a new team invitation
-- Example: Invite user by ID
INSERT INTO team_invitations (team_id, inviter_id, invitee_id, token, message, expires_at)
VALUES (
    'team_uuid_here',
    'inviter_uuid_here', 
    'invitee_uuid_here',
    'unique_token_here',
    'Join our amazing team!',
    NOW() + INTERVAL '7 days'
);

-- Example: Invite by email (for non-registered users)
INSERT INTO team_invitations (team_id, inviter_id, email, token, message, expires_at)
VALUES (
    'team_uuid_here',
    'inviter_uuid_here',
    'friend@example.com',
    'unique_token_here',
    'Join our team and let''s win this competition!',
    NOW() + INTERVAL '7 days'
);

-- 2. Get all pending invitations for a user
SELECT 
    ti.*,
    t.name as team_name,
    t.description as team_description,
    p.full_name as inviter_name,
    p.avatar_url as inviter_avatar
FROM team_invitations ti
JOIN teams t ON ti.team_id = t.id
JOIN profiles p ON ti.inviter_id = p.id
WHERE ti.invitee_id = 'user_uuid_here' 
AND ti.status = 'pending'
ORDER BY ti.created_at DESC;

-- 3. Get all invitations sent by a user
SELECT 
    ti.*,
    t.name as team_name,
    COALESCE(p.full_name, ti.email) as invitee_name
FROM team_invitations ti
JOIN teams t ON ti.team_id = t.id
LEFT JOIN profiles p ON ti.invitee_id = p.id
WHERE ti.inviter_id = 'user_uuid_here'
ORDER BY ti.created_at DESC;

-- 4. Get team invitation details by token
SELECT 
    ti.*,
    t.name as team_name,
    t.description as team_description,
    t.max_members,
    (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as current_members,
    p.full_name as inviter_name,
    p.avatar_url as inviter_avatar
FROM team_invitations ti
JOIN teams t ON ti.team_id = t.id
JOIN profiles p ON ti.inviter_id = p.id
WHERE ti.token = 'invitation_token_here';

-- ===== UPDATE QUERIES =====

-- 5. Accept invitation
UPDATE team_invitations 
SET status = 'accepted', updated_at = NOW()
WHERE token = 'invitation_token_here' AND status = 'pending';

-- 6. Decline invitation
UPDATE team_invitations 
SET status = 'declined', updated_at = NOW()
WHERE token = 'invitation_token_here' AND status = 'pending';

-- 7. Cancel invitation (by inviter)
UPDATE team_invitations 
SET status = 'expired', updated_at = NOW()
WHERE id = 'invitation_id_here' AND inviter_id = 'inviter_uuid_here';

-- ===== ANALYTICS QUERIES =====

-- 8. Get invitation statistics for a team
SELECT 
    t.name as team_name,
    COUNT(CASE WHEN ti.status = 'pending' THEN 1 END) as pending_invitations,
    COUNT(CASE WHEN ti.status = 'accepted' THEN 1 END) as accepted_invitations,
    COUNT(CASE WHEN ti.status = 'declined' THEN 1 END) as declined_invitations,
    COUNT(CASE WHEN ti.status = 'expired' THEN 1 END) as expired_invitations,
    COUNT(*) as total_invitations
FROM teams t
LEFT JOIN team_invitations ti ON t.id = ti.team_id
WHERE t.id = 'team_uuid_here'
GROUP BY t.id, t.name;

-- 9. Get user invitation statistics
SELECT 
    p.full_name,
    COUNT(CASE WHEN ti.status = 'pending' THEN 1 END) as pending_sent,
    COUNT(CASE WHEN ti.status = 'accepted' THEN 1 END) as accepted_sent,
    COUNT(CASE WHEN ti.status = 'declined' THEN 1 END) as declined_sent,
    COUNT(*) as total_sent
FROM profiles p
LEFT JOIN team_invitations ti ON p.id = ti.inviter_id
WHERE p.id = 'user_uuid_here'
GROUP BY p.id, p.full_name;

-- ===== CLEANUP QUERIES =====

-- 10. Expire old invitations (run this periodically)
UPDATE team_invitations 
SET status = 'expired', updated_at = NOW()
WHERE status = 'pending' 
AND expires_at IS NOT NULL 
AND expires_at < NOW();

-- 11. Delete old expired invitations (optional cleanup)
DELETE FROM team_invitations 
WHERE status = 'expired' 
AND updated_at < NOW() - INTERVAL '30 days';

-- ===== SEARCH QUERIES =====

-- 12. Search users who can be invited (not already in team)
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.bio,
    p.skills
FROM profiles p
WHERE p.id != 'team_leader_id'  -- Exclude team leader
AND p.id NOT IN (
    -- Exclude current team members
    SELECT user_id FROM team_members WHERE team_id = 'team_uuid_here'
)
AND p.id NOT IN (
    -- Exclude users with pending invitations
    SELECT invitee_id FROM team_invitations 
    WHERE team_id = 'team_uuid_here' 
    AND status = 'pending'
    AND invitee_id IS NOT NULL
)
AND (
    p.full_name ILIKE '%search_term%' 
    OR p.email ILIKE '%search_term%'
    OR 'search_term' = ANY(p.skills)
)
ORDER BY p.full_name;

-- ===== NOTIFICATION HELPERS =====

-- 13. Create notification when invitation is sent
INSERT INTO notifications (user_id, type, title, message, related_id)
SELECT 
    ti.invitee_id,
    'team_invite',
    'Undangan Tim Baru',
    p.full_name || ' mengundang Anda bergabung dengan tim "' || t.name || '"',
    t.id
FROM team_invitations ti
JOIN teams t ON ti.team_id = t.id
JOIN profiles p ON ti.inviter_id = p.id
WHERE ti.id = 'invitation_id_here'
AND ti.invitee_id IS NOT NULL;

-- 14. Get invitation link for sharing
SELECT 
    'https://yourapp.com/invite/' || token as invitation_link,
    expires_at
FROM team_invitations 
WHERE id = 'invitation_id_here';

-- ===== VALIDATION QUERIES =====

-- 15. Check if user can be invited to team
WITH team_info AS (
    SELECT 
        t.id,
        t.max_members,
        COUNT(tm.id) as current_members
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = 'team_uuid_here'
    GROUP BY t.id, t.max_members
),
user_status AS (
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM team_members 
                WHERE team_id = 'team_uuid_here' AND user_id = 'user_uuid_here'
            ) THEN 'already_member'
            WHEN EXISTS (
                SELECT 1 FROM team_invitations 
                WHERE team_id = 'team_uuid_here' 
                AND invitee_id = 'user_uuid_here' 
                AND status = 'pending'
            ) THEN 'already_invited'
            ELSE 'can_invite'
        END as status
)
SELECT 
    ti.current_members < ti.max_members as team_has_space,
    us.status as user_status,
    CASE 
        WHEN ti.current_members >= ti.max_members THEN 'Team is full'
        WHEN us.status = 'already_member' THEN 'User is already a team member'
        WHEN us.status = 'already_invited' THEN 'User already has a pending invitation'
        WHEN us.status = 'can_invite' THEN 'User can be invited'
    END as message
FROM team_info ti
CROSS JOIN user_status us;