-- Drop the security definer view and recreate with invoker
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate view without security definer (uses invoker by default which is safer)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;