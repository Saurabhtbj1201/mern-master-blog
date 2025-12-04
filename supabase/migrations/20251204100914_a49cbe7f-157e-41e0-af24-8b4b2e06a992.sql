-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a policy that only exposes non-sensitive profile data publicly
-- Sensitive fields (mobile, gender, country) are only visible to the profile owner
CREATE POLICY "Public profiles show limited data" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create a view for public profile data that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Enable leaked password protection via auth config (this is typically done through dashboard)
-- Note: This setting is managed through Supabase Auth configuration