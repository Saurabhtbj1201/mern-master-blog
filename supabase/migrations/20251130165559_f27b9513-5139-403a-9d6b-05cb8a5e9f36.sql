-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for topics
CREATE POLICY "Topics are viewable by everyone"
  ON public.topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert topics"
  ON public.topics FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update topics"
  ON public.topics FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete topics"
  ON public.topics FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tags
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'published', 'rejected')),
  views INT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for articles
CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own draft articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id AND status IN ('draft', 'rejected'));

CREATE POLICY "Admins can update any article"
  ON public.articles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any article"
  ON public.articles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own draft articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- Create article_tags junction table
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

-- Enable RLS on article_tags
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for article_tags
CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can manage tags for their own articles"
  ON public.article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.articles 
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all article tags"
  ON public.article_tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Create storage policies
CREATE POLICY "Anyone can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some default topics
INSERT INTO public.topics (name, slug, description) VALUES
  ('Technology', 'technology', 'Articles about technology and innovation'),
  ('Travel', 'travel', 'Travel guides and experiences'),
  ('Food', 'food', 'Recipes and food reviews'),
  ('Lifestyle', 'lifestyle', 'Lifestyle and personal development'),
  ('Business', 'business', 'Business and entrepreneurship');

-- Insert some default tags
INSERT INTO public.tags (name, slug) VALUES
  ('Tutorial', 'tutorial'),
  ('Guide', 'guide'),
  ('Review', 'review'),
  ('News', 'news'),
  ('Opinion', 'opinion'),
  ('How-to', 'how-to');