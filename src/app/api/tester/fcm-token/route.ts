import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { token, platform = "android" } = body;

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    // Upsert or register token for logged-in user or anonymous device
    await prisma.userDeviceToken.upsert({
      where: { token },
      update: {
        userId: user ? user.userId : null,
        platform,
        updatedAt: new Date(),
      },
      create: {
        token,
        userId: user ? user.userId : null,
        platform,
      },
    });

    return NextResponse.json({ success: true, message: "Token registered successfully" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
