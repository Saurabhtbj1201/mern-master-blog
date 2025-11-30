import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  topic_id: z.string().uuid('Please select a topic'),
});

const EditArticle = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    topic_id: '',
    thumbnail_url: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user && id) {
      fetchArticle();
      fetchTopics();
      fetchTags();
    }
  }, [user, loading, id, navigate]);

  const fetchArticle = async () => {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('author_id', user?.id)
      .single();

    if (error || !article) {
      toast.error('Article not found or access denied');
      navigate('/dashboard');
      return;
    }

    setFormData({
      title: article.title,
      description: article.description || '',
      content: article.content,
      topic_id: article.topic_id || '',
      thumbnail_url: article.thumbnail_url || '',
    });

    const { data: tagData } = await supabase
      .from('article_tags')
      .select('tag_id')
      .eq('article_id', id);
    
    if (tagData) {
      setSelectedTags(tagData.map(t => t.tag_id));
    }
    
    setLoadingArticle(false);
  };

  const fetchTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('name');
    if (data) setTopics(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !user || !id) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${id}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(fileName, imageFile, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending') => {
    e.preventDefault();
    setSubmitting(true);

    try {
      articleSchema.parse(formData);

      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let updateData: any = {
        ...formData,
        slug,
        status,
      };

      if (imageFile) {
        const thumbnailUrl = await uploadImage();
        if (thumbnailUrl) {
          updateData.thumbnail_url = thumbnailUrl;
        }
      }

      const { error: articleError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (articleError) throw articleError;

      // Update tags
      await supabase.from('article_tags').delete().eq('article_id', id);
      
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          article_id: id!,
          tag_id: tagId,
        }));
        await supabase.from('article_tags').insert(tagInserts);
      }

      toast.success('Article updated successfully');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to update article');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingArticle) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Edit Article</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your article"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Select
                value={formData.topic_id}
                onValueChange={(value) => setFormData({ ...formData, topic_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags (select up to 3)</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (selectedTags.includes(tag.id)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.id));
                      } else if (selectedTags.length < 3) {
                        setSelectedTags([...selectedTags, tag.id]);
                      }
                    }}
                    disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 3}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              {formData.thumbnail_url && !imageFile && (
                <div className="mb-2">
                  <img 
                    src={formData.thumbnail_url} 
                    alt="Current thumbnail" 
                    className="h-32 w-auto rounded object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('thumbnail')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imageFile ? imageFile.name : 'Change Image'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content here..."
                rows={15}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={submitting}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'pending')}
                disabled={submitting}
              >
                Submit for Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditArticle;
