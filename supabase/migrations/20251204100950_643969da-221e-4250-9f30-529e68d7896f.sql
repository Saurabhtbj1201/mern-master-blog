-- Drop the view since we'll use a function approach
DROP VIEW IF EXISTS public.public_profiles;

-- Create a function to get public profile data (safer than view)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
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
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
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