-- Update followers table RLS to only allow authenticated users to view followers
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON public.followers;

CREATE POLICY "Followers are viewable by authenticated users only"
ON public.followers
FOR SELECT
TO authenticated
USING (true);

-- Update get_public_profile function to exclude mobile/phone numbers
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  avatar_url text, 
  bio text, 
  facebook_url text, 
  instagram_url text, 
  youtube_url text, 
  twitter_url text, 
  linkedin_url text, 
  github_url text, 
  website_url text, 
  medium_url text, 
  custom_link_url text, 
  custom_link_label text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.facebook_url,
    p.instagram_url,
    p.youtube_url,
    p.twitter_url,
    p.linkedin_url,
    p.github_url,
    p.website_url,
    p.medium_url,
    p.custom_link_url,
    p.custom_link_label,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Create a view for public profile data that excludes sensitive fields
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    username,
    avatar_url,
    bio,
    facebook_url,
    instagram_url,
    youtube_url,
    twitter_url,
    linkedin_url,
    github_url,
    website_url,
    medium_url,
    custom_link_url,
    custom_link_label,
    created_at
  FROM public.profiles;