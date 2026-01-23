import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Edit, Trash2, Eye, Plus, UserPlus, Shield, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminNotifications } from '@/components/AdminNotifications';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newTopic, setNewTopic] = useState({ name: '', slug: '', description: '' });
  const [newTag, setNewTag] = useState({ name: '', slug: '' });
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
        toast.error('Admin access required');
      } else {
        fetchArticles();
        fetchTopics();
        fetchTags();
        fetchUsers();
        fetchAdmins();
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .in('status', ['pending', 'approved', 'published'])
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

  const fetchTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('*')
      .order('name');
    if (data) setTopics(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    if (data) setTags(data);
  };

  const fetchUsers = async () => {
    // Fetch all profiles first
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profiles) {
      // Fetch all user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      // Map roles to users
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.id) || []
      }));
      
      // Filter out admins for users list
      const nonAdminUsers = usersWithRoles.filter(
        u => !u.user_roles.some((r: any) => r.role === 'admin')
      );
      setUsers(nonAdminUsers);
    }
  };

  const fetchAdmins = async () => {
    // Fetch admin roles
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (adminRoles) {
      const adminIds = adminRoles.map(r => r.user_id);
      
      // Fetch profiles for admins
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', adminIds);
      
      if (adminProfiles) {
        setAdmins(adminProfiles);
      }
    }
  };

  const handleSaveTopic = async () => {
    if (!newTopic.name || !newTopic.slug) {
      toast.error('Name and slug are required');
      return;
    }

    if (editingTopic) {
      const { error } = await supabase
        .from('topics')
        .update(newTopic)
        .eq('id', editingTopic.id);
      
      if (error) {
        toast.error('Failed to update topic');
      } else {
        toast.success('Topic updated successfully');
        setIsTopicDialogOpen(false);
        setEditingTopic(null);
        setNewTopic({ name: '', slug: '', description: '' });
        fetchTopics();
      }
    } else {
      const { error } = await supabase
        .from('topics')
        .insert(newTopic);
      
      if (error) {
        toast.error('Failed to create topic');
      } else {
        toast.success('Topic created successfully');
        setIsTopicDialogOpen(false);
        setNewTopic({ name: '', slug: '', description: '' });
        fetchTopics();
      }
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (error) {
      toast.error('Failed to delete topic');
    } else {
      toast.success('Topic deleted successfully');
      fetchTopics();
    }
  };

  const handleSaveTag = async () => {
    if (!newTag.name || !newTag.slug) {
      toast.error('Name and slug are required');
      return;
    }

    if (editingTag) {
      const { error } = await supabase
        .from('tags')
        .update(newTag)
        .eq('id', editingTag.id);
      
      if (error) {
        toast.error('Failed to update tag');
      } else {
        toast.success('Tag updated successfully');
        setIsTagDialogOpen(false);
        setEditingTag(null);
        setNewTag({ name: '', slug: '' });
        fetchTags();
      }
    } else {
      const { error } = await supabase
        .from('tags')
        .insert(newTag);
      
      if (error) {
        toast.error('Failed to create tag');
      } else {
        toast.success('Tag created successfully');
        setIsTagDialogOpen(false);
        setNewTag({ name: '', slug: '' });
        fetchTags();
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      toast.error('Failed to delete tag');
    } else {
      toast.success('Tag deleted successfully');
      fetchTags();
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });

    if (error) {
      toast.error('Failed to make user admin');
    } else {
      toast.success('User is now an admin');
      fetchUsers();
      fetchAdmins();
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      toast.error('All fields are required');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newAdmin.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: newAdmin.email,
      password: newAdmin.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: newAdmin.username
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user) {
      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'admin' });

      if (roleError) {
        toast.error('User created but failed to assign admin role');
      } else {
        toast.success('Admin created successfully');
        setIsAddAdminDialogOpen(false);
        setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' });
        fetchAdmins();
      }
    }
  };

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const approvedArticles = articles.filter(a => a.status === 'approved');
  const publishedArticles = articles.filter(a => a.status === 'published');

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
        <TabsList className="flex-wrap">
          <TabsTrigger value="pending">
            Pending Review ({pendingArticles.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="topics">
            Topics ({topics.length})
          </TabsTrigger>
          <TabsTrigger value="tags">
            Tags ({tags.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="admins">
            Admins ({admins.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Send className="mr-1 h-4 w-4" />
            Notifications
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
                          onClick={() => navigate(`/article/${article.id}?preview=true`)}
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
                          onClick={() => navigate(`/article/${article.id}?preview=true`)}
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

        <TabsContent value="published" className="mt-6">
          {publishedArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No published articles</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {publishedArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="default">Published</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {article.profiles?.username || 'Anonymous'}
                          </span>
                        </div>
                        <CardTitle className="font-serif">{article.title}</CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {article.views || 0} views
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
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusUpdate(article.id, 'draft')}
                        >
                          Unpublish
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

        <TabsContent value="topics" className="mt-6">
          <div className="mb-4">
            <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTopic(null);
                  setNewTopic({ name: '', slug: '', description: '' });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic-name">Name</Label>
                    <Input
                      id="topic-name"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      placeholder="Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-slug">Slug</Label>
                    <Input
                      id="topic-slug"
                      value={newTopic.slug}
                      onChange={(e) => setNewTopic({ ...newTopic, slug: e.target.value })}
                      placeholder="technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic-description">Description</Label>
                    <Textarea
                      id="topic-description"
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                      placeholder="Articles about technology..."
                    />
                  </div>
                  <Button onClick={handleSaveTopic} className="w-full">
                    {editingTopic ? 'Update' : 'Create'} Topic
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.name}</TableCell>
                    <TableCell>{topic.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">{topic.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTopic(topic);
                            setNewTopic({
                              name: topic.name,
                              slug: topic.slug,
                              description: topic.description || ''
                            });
                            setIsTopicDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTopic(topic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <div className="mb-4">
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTag(null);
                  setNewTag({ name: '', slug: '' });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTag ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-name">Name</Label>
                    <Input
                      id="tag-name"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      placeholder="React"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag-slug">Slug</Label>
                    <Input
                      id="tag-slug"
                      value={newTag.slug}
                      onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                      placeholder="react"
                    />
                  </div>
                  <Button onClick={handleSaveTag} className="w-full">
                    {editingTag ? 'Update' : 'Create'} Tag
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTag(tag);
                            setNewTag({ name: tag.name, slug: tag.slug });
                            setIsTagDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell className="font-medium">{userItem.username}</TableCell>
                      <TableCell className="max-w-xs truncate">{userItem.bio || '—'}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(userItem.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMakeAdmin(userItem.id)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Make Admin
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <div className="mb-4">
            <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      value={newAdmin.confirmPassword}
                      onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button onClick={handleAddAdmin} className="w-full">
                    Create Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.username}</TableCell>
                      <TableCell className="max-w-xs truncate">{admin.bio || '—'}</TableCell>
                      <TableCell>
                        <Badge className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(admin.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <AdminNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
