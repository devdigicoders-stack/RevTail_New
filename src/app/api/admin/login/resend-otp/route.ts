import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ADMIN_LOGIN_OTP_COOKIE,
  ADMIN_LOGIN_OTP_EXPIRY_SECONDS,
  createAdminLoginOtpToken,
  decodeAdminLoginOtpPayload,
  generateAdminLoginOtp,
  getAdminLoginResendWaitSeconds,
} from "@/lib/admin-login-otp";
import { sendAdminLoginOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const otpToken = request.cookies.get(ADMIN_LOGIN_OTP_COOKIE)?.value;

    if (!otpToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification session expired. Please sign in again to receive an OTP.",
        },
        { status: 401 }
      );
    }

    const payload = decodeAdminLoginOtpPayload(otpToken);

    if (!payload || Date.now() > payload.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification session expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const waitSeconds = getAdminLoginResendWaitSeconds(otpToken);

    if (waitSeconds > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        },
        { status: 429 }
      );
    }

    // Verify Admin user in database
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE" || !user.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found or inactive.",
        },
        { status: 403 }
      );
    }

    const otp = generateAdminLoginOtp();

    try {
      await sendAdminLoginOtpEmail({
        to: user.email,
        otp,
      });
    } catch (mailError) {
      console.error("ADMIN RESEND OTP EMAIL FAILED:", mailError);
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to send email. Please check SMTP configuration or try again.",
        },
        { status: 500 }
      );
    }

    const newToken = createAdminLoginOtpToken({
      userId: user.id,
      email: user.email,
      otp,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "A new verification code has been sent to your email.",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: ADMIN_LOGIN_OTP_COOKIE,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_LOGIN_OTP_EXPIRY_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("ADMIN RESEND OTP ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to resend verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}
