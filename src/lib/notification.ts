import { messaging } from "./firebase";
import prisma from "./prisma";
import type { MulticastMessage } from "firebase-admin/messaging";

interface PushNotificationOptions {
  userId?: number;
  fcmToken?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Send a push notification to a user using their saved FCM tokens or a specific token
 */
export async function sendPushNotification({
  userId,
  fcmToken,
  title,
  body,
  data = {},
  imageUrl,
}: PushNotificationOptions) {
  try {
    if (!messaging) {
      console.error("[FCM] Firebase messaging service not initialized");
      return { success: false, message: "Firebase messaging not initialized" };
    }

    const tokens: string[] = [];

    if (fcmToken) {
      tokens.push(fcmToken);
    } else if (userId) {
      const userTokens = await prisma.userDeviceToken.findMany({
        where: { userId },
        select: { token: true },
      });
      tokens.push(...userTokens.map((t) => t.token));
    }

    if (tokens.length === 0) {
      console.log(`[FCM] No tokens found for user ${userId || "unknown"}`);
      return { success: false, message: "No device tokens found" };
    }

    const messagePayload: MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
        ...(imageUrl ? { imageUrl } : {}),
      },
      data: {
        ...data,
        title,
        body,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          priority: "high",
          channelId: "high_importance_channel",
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
    };

    const response = await messaging.sendEachForMulticast(messagePayload);
    console.log(`[FCM] Sent notifications: ${response.successCount} succeeded, ${response.failureCount} failed.`);

    // Clean up invalid or unregistered tokens
    if (response.failureCount > 0) {
      const tokensToRemove: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === "messaging/invalid-registration-token" ||
            errCode === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await prisma.userDeviceToken.deleteMany({
          where: { token: { in: tokensToRemove } },
        });
        console.log(`[FCM] Cleaned up ${tokensToRemove.length} stale tokens.`);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error("[FCM] Error sending push notification:", error);
    return { success: false, error };
  }
}
