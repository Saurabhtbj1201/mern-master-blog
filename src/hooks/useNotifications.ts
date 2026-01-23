import { supabase } from '@/integrations/supabase/client';

type NotificationType = 
  | 'achievement'
  | 'milestone'
  | 'like'
  | 'follow'
  | 'comment'
  | 'article_published'
  | 'profile_update'
  | 'password_changed'
  | 'admin'
  | 'welcome';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
}: CreateNotificationParams) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
    });

  if (error) {
    console.error('Failed to create notification:', error);
    return false;
  }
  return true;
};

// Predefined notification templates
export const sendAchievementNotification = async (userId: string, achievementName: string) => {
  return createNotification({
    userId,
    type: 'achievement',
    title: 'New Achievement Unlocked! 🏆',
    message: `Congratulations! You've earned the "${achievementName}" badge.`,
    data: { link: '/achievements' },
  });
};

export const sendMilestoneNotification = async (userId: string, milestone: string) => {
  return createNotification({
    userId,
    type: 'milestone',
    title: 'Milestone Reached! 🎯',
    message: milestone,
    data: { link: '/achievements' },
  });
};

export const sendLikeNotification = async (userId: string, articleTitle: string, articleId: string) => {
  return createNotification({
    userId,
    type: 'like',
    title: 'Someone liked your article! ❤️',
    message: `Your article "${articleTitle}" received a new like.`,
    data: { link: `/article/${articleId}` },
  });
};

export const sendFollowNotification = async (userId: string, followerName: string, followerId: string) => {
  return createNotification({
    userId,
    type: 'follow',
    title: 'New Follower! 👥',
    message: `${followerName} started following you.`,
    data: { link: `/profile/${followerId}` },
  });
};

export const sendCommentNotification = async (userId: string, articleTitle: string, articleId: string) => {
  return createNotification({
    userId,
    type: 'comment',
    title: 'New Comment! 💬',
    message: `Someone commented on your article "${articleTitle}".`,
    data: { link: `/article/${articleId}` },
  });
};

export const sendArticlePublishedNotification = async (userId: string, articleTitle: string, articleId: string) => {
  return createNotification({
    userId,
    type: 'article_published',
    title: 'Article Published! 📝',
    message: `Your article "${articleTitle}" has been published successfully.`,
    data: { link: `/article/${articleId}` },
  });
};

export const sendProfileUpdateNotification = async (userId: string) => {
  return createNotification({
    userId,
    type: 'profile_update',
    title: 'Profile Updated 👤',
    message: 'Your profile has been updated successfully.',
    data: { link: '/profile' },
  });
};

export const sendPasswordChangedNotification = async (userId: string) => {
  return createNotification({
    userId,
    type: 'password_changed',
    title: 'Password Changed 🔐',
    message: 'Your password has been changed successfully. If this wasn\'t you, please contact support immediately.',
  });
};

export const sendWelcomeNotification = async (userId: string, username: string) => {
  return createNotification({
    userId,
    type: 'welcome',
    title: 'Welcome to NotePath! 👋',
    message: `Hi ${username}! We're excited to have you here. Start exploring articles or write your first one!`,
    data: { link: '/submit-article' },
  });
};
