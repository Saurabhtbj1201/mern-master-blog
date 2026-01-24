import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, Trophy, Heart, UserPlus, MessageSquare, FileText, Shield, Settings2, Loader2 } from 'lucide-react';

interface NotificationSettings {
  achievements: boolean;
  milestones: boolean;
  likes: boolean;
  follows: boolean;
  comments: boolean;
  articlePublished: boolean;
  profileUpdates: boolean;
  securityAlerts: boolean;
}

const defaultSettings: NotificationSettings = {
  achievements: true,
  milestones: true,
  likes: true,
  follows: true,
  comments: true,
  articlePublished: true,
  profileUpdates: true,
  securityAlerts: true,
};

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    if (user) {
      const savedSettings = localStorage.getItem(`notification_prefs_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    if (!user) return;
    
    setSaving(true);
    try {
      localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(settings));
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setSettings(defaultSettings);
    if (user) {
      localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(defaultSettings));
    }
    toast.success('Preferences reset to default');
  };

  const notificationOptions = [
    {
      key: 'achievements' as const,
      label: 'Achievements & Badges',
      description: 'Get notified when you earn new badges or achievements',
      icon: Trophy,
    },
    {
      key: 'milestones' as const,
      label: 'Milestones',
      description: 'Celebrate when you reach important milestones',
      icon: Trophy,
    },
    {
      key: 'likes' as const,
      label: 'Likes',
      description: 'Know when someone likes your articles',
      icon: Heart,
    },
    {
      key: 'follows' as const,
      label: 'New Followers',
      description: 'Get notified when someone follows you',
      icon: UserPlus,
    },
    {
      key: 'comments' as const,
      label: 'Comments',
      description: 'Receive notifications for new comments',
      icon: MessageSquare,
    },
    {
      key: 'articlePublished' as const,
      label: 'Article Published',
      description: 'Confirmation when your article is published',
      icon: FileText,
    },
    {
      key: 'profileUpdates' as const,
      label: 'Profile Updates',
      description: 'Notifications about profile changes',
      icon: Settings2,
    },
    {
      key: 'securityAlerts' as const,
      label: 'Security Alerts',
      description: 'Important security notifications like password changes',
      icon: Shield,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Choose which notifications you'd like to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={option.key} className="text-sm font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.key}
                  checked={settings[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
          <Button variant="outline" onClick={handleResetToDefault}>
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
