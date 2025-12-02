-- Create followers table
CREATE TABLE public.followers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Anyone can see followers
CREATE POLICY "Followers are viewable by everyone"
ON public.followers
FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON public.followers
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON public.followers
FOR DELETE
USING (auth.uid() = follower_id);

-- Create function to get follower count
CREATE OR REPLACE FUNCTION public.get_follower_count(user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.followers WHERE following_id = user_id
$$;

-- Create function to get following count
CREATE OR REPLACE FUNCTION public.get_following_count(user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.followers WHERE follower_id = user_id
$$;