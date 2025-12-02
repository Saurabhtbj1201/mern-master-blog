import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchUserArticles();
    }
  }, [user, loading, navigate]);

  const fetchUserArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setArticles(data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete article');
    } else {
      toast.success('Article deleted successfully');
      fetchUserArticles();
    }
    setDeleteId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'published':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your articles</p>
        </div>
        <Button onClick={() => navigate('/submit-article')}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-lg text-muted-foreground">No articles yet</p>
            <Button onClick={() => navigate('/submit-article')}>
              Create Your First Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                    </div>
                    <CardTitle className="font-serif">{article.title}</CardTitle>
                    <p className="mt-2 text-muted-foreground">
                      {article.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {article.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {(article.status === 'draft' || article.status === 'rejected' || article.status === 'published') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-article/${article.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {(article.status === 'draft' || article.status === 'published') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
