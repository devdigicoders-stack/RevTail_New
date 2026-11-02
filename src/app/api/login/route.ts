import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { createToken } from "@/lib/auth";

/*
 * ------------------------------------------------
 * LOGIN RATE LIMIT
 * ------------------------------------------------
 *
 * Maximum failed login attempts allowed
 * during the rate-limit window.
 */
const MAX_LOGIN_ATTEMPTS = 5;

/*
 * 10 minutes
 */
const LOGIN_RATE_LIMIT_WINDOW =
  10 * 60 * 1000;

type LoginAttempt = {
  count: number;
  expiresAt: number;
};

/*
 * Server-side in-memory store.
 *
 * Key:
 * normalized email/mobile
 *
 * Example:
 * admin@example.com
 * 9818712325
 */
const loginAttempts =
  new Map<string, LoginAttempt>();

/*
 * ------------------------------------------------
 * NORMALIZE IDENTIFIER FOR RATE LIMITING
 * ------------------------------------------------
 */
function getRateLimitKey(
  identifier: string
) {
  const value =
    identifier
      .trim()
      .toLowerCase();

  /*
   * Email
   */
  if (value.includes("@")) {
    return value;
  }

  /*
   * Mobile
   *
   * Remove spaces/hyphens.
   */
  let mobile =
    value.replace(
      /[\s-]/g,
      ""
    );

  /*
   * Convert:
   *
   * +919818712325
   *
   * to:
   *
   * 9818712325
   */
  if (
    mobile.startsWith("+91")
  ) {
    mobile =
      mobile.substring(3);
  }

  return mobile;
}

/*
 * ------------------------------------------------
 * CHECK WHETHER LOGIN IS CURRENTLY BLOCKED
 * ------------------------------------------------
 */
function getBlockedAttempt(
  key: string
): LoginAttempt | null {
  const attempt =
    loginAttempts.get(key);

  if (!attempt) {
    return null;
  }

  /*
   * Rate-limit period has finished.
   *
   * Remove old entry automatically.
   */
  if (
    Date.now() >=
    attempt.expiresAt
  ) {
    loginAttempts.delete(key);

    return null;
  }

  if (
    attempt.count >=
    MAX_LOGIN_ATTEMPTS
  ) {
    return attempt;
  }

  return null;
}

/*
 * ------------------------------------------------
 * REGISTER FAILED LOGIN
 * ------------------------------------------------
 */
function registerFailedAttempt(
  key: string
) {
  const now =
    Date.now();

  const existing =
    loginAttempts.get(key);

  /*
   * First failed login
   * or previous window expired.
   */
  if (
    !existing ||
    now >= existing.expiresAt
  ) {
    const attempt: LoginAttempt = {
      count: 1,

      expiresAt:
        now +
        LOGIN_RATE_LIMIT_WINDOW,
    };

    loginAttempts.set(
      key,
      attempt
    );

    return attempt;
  }

  const updatedAttempt: LoginAttempt = {
    count:
      existing.count + 1,

    expiresAt:
      existing.expiresAt,
  };

  loginAttempts.set(
    key,
    updatedAttempt
  );

  return updatedAttempt;
}

/*
 * ------------------------------------------------
 * RATE LIMIT RESPONSE
 * ------------------------------------------------
 */
function createRateLimitResponse(
  expiresAt: number
) {
  const retryAfterSeconds =
    Math.max(
      1,
      Math.ceil(
        (
          expiresAt -
          Date.now()
        ) / 1000
      )
    );

  return NextResponse.json(
    {
      success: false,

      message:
        "Too many login attempts. Please try again in 10 minutes.",

      retryAfter:
        retryAfterSeconds,
    },
    {
      status: 429,

      headers: {
        "Retry-After":
          String(
            retryAfterSeconds
          ),
      },
    }
  );
}

/*
 * ------------------------------------------------
 * INVALID CREDENTIAL RESPONSE
 * ------------------------------------------------
 *
 * Every invalid credential attempt
 * increments the rate-limit counter.
 */
function invalidCredentialsResponse(
  rateLimitKey: string
) {
  const attempt =
    registerFailedAttempt(
      rateLimitKey
    );

  /*
   * As soon as attempt #5 fails,
   * immediately block login.
   */
  if (
    attempt.count >=
    MAX_LOGIN_ATTEMPTS
  ) {
    return createRateLimitResponse(
      attempt.expiresAt
    );
  }

  return NextResponse.json(
    {
      success: false,

      message:
        "Invalid login credentials.",
    },
    {
      status: 401,
    }
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    /*
     * identifier is the new field.
     *
     * email is kept temporarily
     * for backward compatibility.
     */
    const rawIdentifier =
      body.identifier ??
      body.email ??
      "";

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const identifier =
      typeof rawIdentifier ===
      "string"
        ? rawIdentifier.trim()
        : "";

    /*
     * ------------------------------------------------
     * 1. VALIDATE INPUT
     * ------------------------------------------------
     */

    if (
      !identifier ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Email/mobile and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ------------------------------------------------
     * 2. RATE-LIMIT CHECK
     * ------------------------------------------------
     *
     * This happens BEFORE Turnstile.
     */

    const rateLimitKey =
      getRateLimitKey(
        identifier
      );

    const blockedAttempt =
      getBlockedAttempt(
        rateLimitKey
      );

    if (blockedAttempt) {
      return createRateLimitResponse(
        blockedAttempt.expiresAt
      );
    }

    /*
     * ------------------------------------------------
     * 3. DETERMINE LOGIN TYPE
     * ------------------------------------------------
     *
     * Email:
     * BRAND
     * ADMIN
     *
     * Mobile:
     * TESTER
     */

    const isEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        identifier
      );

    /*
     * Remove spaces
     * and hyphens.
     */
    const normalizedMobile =
      identifier.replace(
        /[\s-]/g,
        ""
      );

    /*
     * Supports:
     *
     * 9818712325
     * +919818712325
     */
    const isMobile =
      /^(\+91)?[6-9]\d{9}$/.test(
        normalizedMobile
      );

    if (
      !isEmail &&
      !isMobile
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please enter a valid email address or mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ------------------------------------------------
     * 7. FIND USER
     * ------------------------------------------------
     */

    let user = null;

    /*
     * EMAIL LOGIN
     *
     * ADMIN / BRAND
     */
    if (isEmail) {
      const normalizedEmail =
        identifier.toLowerCase();

      user =
        await prisma.user.findUnique({
          where: {
            email:
              normalizedEmail,
          },
        });

      /*
       * Invalid user or invalid
       * login type.
       */
      if (
        !user ||
        (
          user.role !==
            "ADMIN" &&
          user.role !==
            "BRAND"
        )
      ) {
        return invalidCredentialsResponse(
          rateLimitKey
        );
      }
    }

    /*
     * MOBILE LOGIN
     *
     * TESTER
     */
    if (isMobile) {
      let mobileForDb =
        normalizedMobile;

      /*
       * Convert:
       *
       * +919818712325
       *
       * to:
       *
       * 9818712325
       */
      if (
        mobileForDb.startsWith(
          "+91"
        )
      ) {
        mobileForDb =
          mobileForDb.substring(
            3
          );
      }

      user =
        await prisma.user.findUnique({
          where: {
            mobile:
              mobileForDb,
          },
        });

      if (
        !user ||
        user.role !==
          "TESTER"
      ) {
        return invalidCredentialsResponse(
          rateLimitKey
        );
      }
    }

    /*
     * User must exist and
     * account must be ACTIVE.
     */

    if (
      !user ||
      user.status !==
        "ACTIVE"
    ) {
      return invalidCredentialsResponse(
        rateLimitKey
      );
    }

    /*
     * ------------------------------------------------
     * 8. VERIFY PASSWORD
     * ------------------------------------------------
     */

    /*
     * Password is nullable
     * in Prisma schema.
     */
    if (!user.password) {
      return invalidCredentialsResponse(
        rateLimitKey
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (
      !isPasswordValid
    ) {
      return invalidCredentialsResponse(
        rateLimitKey
      );
    }

    /*
     * ------------------------------------------------
     * LOGIN SUCCESS
     * ------------------------------------------------
     *
     * Remove previous failed attempts.
     */

    loginAttempts.delete(
      rateLimitKey
    );

    /*
     * ------------------------------------------------
     * 9. CREATE JWT TOKEN
     * ------------------------------------------------
     */

    const token =
      await createToken({
        userId:
          user.id,

        role:
          user.role,

        email:
          user.email ?? "",
      });

    /*
     * ------------------------------------------------
     * 10. CREATE RESPONSE
     * ------------------------------------------------
     */

    const response =
      NextResponse.json(
        {
          success: true,

          message:
            "Login successful.",

          data: {
            id:
              user.id,

            email:
              user.email,

            mobile:
              user.mobile,

            role:
              user.role,
          },
        },
        {
          status: 200,
        }
      );

    /*
     * ------------------------------------------------
     * 11. COOKIE DURATION
     * ------------------------------------------------
     *
     * Keep the login cookie persistent.
     *
     * The JWT uses the same 400-day lifetime.
     * Explicit logout should delete this cookie.
     */

    const maxAge =
      60 * 60 * 24 * 400;

    /*
     * ------------------------------------------------
     * 12. STORE JWT IN HTTP-ONLY COOKIE
     * ------------------------------------------------
     */

    response.cookies.set({
      name:
        "revtail_token",

      value:
        token,

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      maxAge,

      path:
        "/",
    });

    return response;
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Something went wrong during login.",
      },
      {
        status: 500,
      }
    );
  }
}