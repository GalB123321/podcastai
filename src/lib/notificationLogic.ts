import { firestore } from 'firebase-admin';
import type { Resend } from 'resend';

/**
 * Configuration for notification services
 */
const config = {
  emailApiKey: process.env.EMAIL_API_KEY || '',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || '',
  emailProvider: process.env.EMAIL_PROVIDER || 'resend'
};

/**
 * Message structure for notifications
 */
export interface NotificationMessage {
  subject: string;
  body: string;
  template?: string;
  variables?: Record<string, string>;
}

/**
 * Options for scheduling notifications
 */
export interface ScheduleOptions {
  recurring?: boolean;
  timezone?: string;
  channel?: 'email' | 'push' | 'both';
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Error thrown by notification operations
 */
export class NotificationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly userId?: string
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

/**
 * Validates notification configuration
 * @throws {NotificationError} If configuration is invalid
 */
function validateConfig(): void {
  if (!config.emailApiKey) {
    throw new NotificationError(
      'Missing EMAIL_API_KEY environment variable',
      'MISSING_CONFIG'
    );
  }
  if (!config.emailFromAddress) {
    throw new NotificationError(
      'Missing EMAIL_FROM_ADDRESS environment variable',
      'MISSING_CONFIG'
    );
  }
}

/**
 * Gets user's notification preferences and email
 * @param userId - The ID of the user
 * @returns User's email and notification preferences
 * @throws {NotificationError} If user not found
 */
async function getUserNotificationInfo(userId: string): Promise<{
  email: string;
  preferences: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    timezone: string;
  };
}> {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new NotificationError(
        `User ${userId} not found`,
        'USER_NOT_FOUND',
        userId
      );
    }

    const userData = userDoc.data();
    
    if (!userData?.email) {
      throw new NotificationError(
        `No email found for user ${userId}`,
        'NO_EMAIL',
        userId
      );
    }

    return {
      email: userData.email,
      preferences: {
        emailEnabled: userData.emailNotifications ?? true,
        pushEnabled: userData.pushNotifications ?? true,
        timezone: userData.timezone || 'UTC'
      }
    };
  } catch (error) {
    if (error instanceof NotificationError) throw error;
    throw new NotificationError(
      `Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'USER_INFO_FAILED',
      userId
    );
  }
}

/**
 * Schedule a reminder notification for a user
 * @param userId - The ID of the user to remind
 * @param episodeId - The ID of the episode to remind about
 * @param when - JavaScript Date when the reminder should fire
 * @param options - Optional scheduling configuration
 * @throws {NotificationError} If scheduling fails
 */
export async function scheduleReminder(
  userId: string,
  episodeId: string,
  when: Date,
  options: Partial<ScheduleOptions> = {}
): Promise<void> {
  try {
    validateConfig();
    
    // Get user's notification preferences
    const userInfo = await getUserNotificationInfo(userId);

    // Get episode details for the notification
    const episodeDoc = await firestore()
      .collection('episodes')
      .doc(episodeId)
      .get();

    if (!episodeDoc.exists) {
      throw new NotificationError(
        `Episode ${episodeId} not found`,
        'EPISODE_NOT_FOUND'
      );
    }

    const episodeData = episodeDoc.data();

    // Create notification record
    const notification = {
      userId,
      episodeId,
      scheduledFor: when,
      type: 'reminder',
      status: 'scheduled',
      channel: options.channel || 'both',
      message: {
        subject: `Reminder: "${episodeData?.title}"`,
        body: `Don't forget to check out your episode "${episodeData?.title}"!`
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      ...options
    };

    // Store in notifications collection
    await firestore()
      .collection('notifications')
      .add(notification);

    // TODO: Schedule with actual notification service
    // Example scheduling service call:
    // await notificationService.schedule({
    //   userId,
    //   trigger: {
    //     type: 'timestamp',
    //     timestamp: when.getTime(),
    //     timezone: options.timezone || userInfo.preferences.timezone
    //   },
    //   notification: {
    //     title: notification.message.subject,
    //     body: notification.message.body,
    //     data: { episodeId }
    //   }
    // });

  } catch (error) {
    if (error instanceof NotificationError) throw error;
    throw new NotificationError(
      `Failed to schedule reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SCHEDULE_FAILED',
      userId
    );
  }
}

/**
 * Send an immediate email notification to a user
 * @param userId - The ID of the user to notify
 * @param message - Object with subject and body fields
 * @throws {NotificationError} If sending fails
 */
export async function sendEmailNotification(
  userId: string,
  message: NotificationMessage
): Promise<void> {
  try {
    validateConfig();

    // Get user's email and preferences
    const userInfo = await getUserNotificationInfo(userId);

    if (!userInfo.preferences.emailEnabled) {
      // Silently return if user has disabled email notifications
      return;
    }

    // TODO: Replace with actual email service call
    // Example Resend API call:
    // const resend = new Resend(config.emailApiKey);
    // await resend.emails.send({
    //   from: config.emailFromAddress,
    //   to: userInfo.email,
    //   subject: message.subject,
    //   html: message.body,
    //   tags: [{ name: 'category', value: 'podcast' }]
    // });

    // Log notification attempt
    await firestore()
      .collection('notifications')
      .add({
        userId,
        type: 'email',
        status: 'sent',
        message,
        sentAt: firestore.FieldValue.serverTimestamp()
      });

  } catch (error) {
    if (error instanceof NotificationError) throw error;
    throw new NotificationError(
      `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EMAIL_FAILED',
      userId
    );
  }
}

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

/**
 * Sends a contact form message to the appropriate channels
 * (Currently just logs to console - would typically send to an API endpoint)
 */
export async function sendContactMessage(data: ContactMessage): Promise<void> {
  // TODO: Replace with actual API call
  console.log('Contact form submission:', data);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // TODO: Add error handling and validation
  return Promise.resolve();
} 