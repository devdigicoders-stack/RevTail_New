import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import {
  ADMIN_LOGIN_OTP_COOKIE,
  ADMIN_LOGIN_OTP_EXPIRY_SECONDS,
  verifyAdminLoginOtp,
} from "@/lib/admin-login-otp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const otp = String(body.otp ?? "").trim();

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code is required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit verification code.",
        },
        { status: 400 }
      );
    }

    const otpToken = request.cookies.get(ADMIN_LOGIN_OTP_COOKIE)?.value;

    if (!otpToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification session expired or not found. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const verification = verifyAdminLoginOtp(otpToken, otp);

    if (!verification.success) {
      let message = "Invalid verification code.";

      if (verification.reason === "EXPIRED") {
        message = "Verification code has expired. Please request a new code.";
      } else if (verification.reason === "TOO_MANY_ATTEMPTS") {
        message =
          "Too many incorrect attempts. Please sign in again to receive a new code.";
      } else if (verification.reason === "INVALID") {
        const remaining = verification.remainingAttempts ?? 0;
        message =
          remaining > 0
            ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Invalid verification code.";
      }

      const response = NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );

      // If there's an updated token tracking attempts, update cookie
      if (verification.newToken) {
        response.cookies.set({
          name: ADMIN_LOGIN_OTP_COOKIE,
          value: verification.newToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ADMIN_LOGIN_OTP_EXPIRY_SECONDS,
          path: "/",
        });
      } else if (
        verification.reason === "EXPIRED" ||
        verification.reason === "TOO_MANY_ATTEMPTS"
      ) {
        // Clear dead cookie
        response.cookies.set({
          name: ADMIN_LOGIN_OTP_COOKIE,
          value: "",
          maxAge: 0,
          path: "/",
        });
      }

      return response;
    }

    // OTP is valid! Retrieve Admin user from DB
    const user = await prisma.user.findUnique({
      where: {
        id: verification.userId,
      },
    });

    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found or inactive. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session JWT token
    const token = await createToken({
      userId: user.id,
      role: user.role,
      email: user.email ?? "",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful.",
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set authenticated session cookie (400 days)
    const maxAge = 60 * 60 * 24 * 400;
    response.cookies.set({
      name: "revtail_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    // Clear Admin OTP cookie
    response.cookies.set({
      name: ADMIN_LOGIN_OTP_COOKIE,
      value: "",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("ADMIN VERIFY OTP ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying the OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
