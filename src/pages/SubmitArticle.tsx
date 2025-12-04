import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { z } from 'zod';
import RichTextEditor from '@/components/RichTextEditor';

const articleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  topic_id: z.string().uuid('Please select a topic'),
});

const SubmitArticle = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // New topic/tag creation
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    topic_id: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else {
      fetchTopics();
      fetchTags();
    }
  }, [user, loading, navigate]);

  const fetchTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('name');
    if (data) setTopics(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      toast.error('Topic name is required');
      return;
    }

    setCreatingTopic(true);
    try {
      const slug = newTopicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data, error } = await supabase
        .from('topics')
        .insert({ name: newTopicName.trim(), slug, description: newTopicDesc.trim() || null })
        .select()
        .single();

      if (error) throw error;

      setTopics([...topics, data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ ...formData, topic_id: data.id });
      setNewTopicName('');
      setNewTopicDesc('');
      toast.success('Topic created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create topic');
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setCreatingTag(true);
    try {
      const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: newTagName.trim(), slug })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data].sort((a, b) => a.name.localeCompare(b.name)));
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, data.id]);
      }
      setNewTagName('');
      toast.success('Tag created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
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

  const uploadImage = async (articleId: string) => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${articleId}.${fileExt}`;

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

      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          ...formData,
          slug,
          author_id: user?.id,
          status,
        })
        .select()
        .single();

      if (articleError) throw articleError;

      if (imageFile && article) {
        const thumbnailUrl = await uploadImage(article.id);
        if (thumbnailUrl) {
          await supabase
            .from('articles')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', article.id);
        }
      }

      if (selectedTags.length > 0 && article) {
        const tagInserts = selectedTags.map(tagId => ({
          article_id: article.id,
          tag_id: tagId,
        }));
        await supabase.from('article_tags').insert(tagInserts);
      }

      toast.success(
        status === 'draft' 
          ? 'Article saved as draft' 
          : 'Article submitted for review'
      );
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to save article');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          <CardTitle className="font-serif text-2xl">Create New Article</CardTitle>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="topic">Topic *</Label>
                {isAdmin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        New Topic
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Topic</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="topicName">Topic Name *</Label>
                          <Input
                            id="topicName"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            placeholder="e.g., Technology"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="topicDesc">Description (optional)</Label>
                          <Textarea
                            id="topicDesc"
                            value={newTopicDesc}
                            onChange={(e) => setNewTopicDesc(e.target.value)}
                            placeholder="Brief description of this topic"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button 
                            type="button" 
                            onClick={handleCreateTopic}
                            disabled={creatingTopic}
                          >
                            {creatingTopic ? 'Creating...' : 'Create Topic'}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
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
              <div className="flex items-center justify-between">
                <Label>Tags (select up to 3)</Label>
                {isAdmin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        New Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tagName">Tag Name *</Label>
                          <Input
                            id="tagName"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="e.g., React"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button 
                            type="button" 
                            onClick={handleCreateTag}
                            disabled={creatingTag}
                          >
                            {creatingTag ? 'Creating...' : 'Create Tag'}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
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
              <p className="text-sm text-muted-foreground">Recommended ratio: 16:9 (e.g., 1280×720 or 1920×1080)</p>
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
                  {imageFile ? imageFile.name : 'Upload Image'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                userId={user?.id}
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

export default SubmitArticle;
