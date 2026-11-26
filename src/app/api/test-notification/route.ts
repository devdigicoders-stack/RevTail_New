import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/notification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      userId,
      token,
      title = "Test Notification",
      body: messageBody = "This is a test notification from Revtail!",
      data = {},
    } = body;

    if (!token && !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide either a 'token' or 'userId' to send notification.",
        },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      userId: userId ? Number(userId) : undefined,
      fcmToken: token,
      title,
      body: messageBody,
      data,
    });

    return NextResponse.json({
      success: result.success,
      details: result,
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
