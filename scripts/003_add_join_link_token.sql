-- Add join_link_token column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS join_link_token TEXT UNIQUE;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_teams_join_link_token 
ON public.teams (join_link_token) 
WHERE join_link_token IS NOT NULL;

-- Update RLS policies to allow public access for join link verification
CREATE POLICY "teams_select_by_join_token" ON public.teams 
FOR SELECT 
USING (join_link_token IS NOT NULL);