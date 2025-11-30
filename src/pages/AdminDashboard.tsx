import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
        toast.error('Admin access required');
      } else {
        fetchArticles();
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false });
    
    if (data) {
      const articlesWithProfiles = await Promise.all(
        data.map(async (article) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', article.author_id)
            .single();
          
          return {
            ...article,
            profiles: { username: profile?.username || 'Anonymous' }
          };
        })
      );
      setArticles(articlesWithProfiles);
    }
  };

  const handleStatusUpdate = async (articleId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    
    if (newStatus === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId);

    if (error) {
      toast.error('Failed to update article status');
    } else {
      toast.success(`Article ${newStatus} successfully`);
      fetchArticles();
    }
  };

  const handleDelete = async (articleId: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      toast.error('Failed to delete article');
    } else {
      toast.success('Article deleted successfully');
      fetchArticles();
    }
  };

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const approvedArticles = articles.filter(a => a.status === 'approved');

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage articles and content</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingArticles.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending articles</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">Pending Review</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {article.profiles?.username || 'Anonymous'}
                          </span>
                        </div>
                        <CardTitle className="font-serif">{article.title}</CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Submitted {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/article/${article.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(article.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusUpdate(article.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{article.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No approved articles</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {approvedArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge>Approved</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {article.profiles?.username || 'Anonymous'}
                          </span>
                        </div>
                        <CardTitle className="font-serif">{article.title}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/article/${article.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(article.id, 'published')}
                        >
                          Publish
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{article.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
