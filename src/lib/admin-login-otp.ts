import crypto from "crypto";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

const ADMIN_LOGIN_OTP_SECRET: string = jwtSecret;

export const ADMIN_LOGIN_OTP_COOKIE = "revtail_admin_login_otp";

export const ADMIN_LOGIN_OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
export const ADMIN_LOGIN_RESEND_SECONDS = 60; // 60 seconds
export const MAX_ADMIN_OTP_ATTEMPTS = 5;

export type AdminLoginOtpPayload = {
  purpose: "ADMIN_LOGIN_OTP";
  userId: number;
  email: string;
  otpHash: string;
  attempts: number;
  issuedAt: number;
  expiresAt: number;
};

function sign(value: string): string {
  return crypto
    .createHmac("sha256", ADMIN_LOGIN_OTP_SECRET)
    .update(value)
    .digest("hex");
}

function encodePayload(payload: AdminLoginOtpPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodeAdminLoginOtpPayload(
  token: string | undefined
): AdminLoginOtpPayload | null {
  try {
    if (!token) return null;

    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");

    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminLoginOtpPayload;

    if (payload.purpose !== "ADMIN_LOGIN_OTP") return null;

    return payload;
  } catch {
    return null;
  }
}

function hashOtp(userId: number, otp: string): string {
  return crypto
    .createHmac("sha256", ADMIN_LOGIN_OTP_SECRET)
    .update(`${userId}:${otp}`)
    .digest("hex");
}

export function generateAdminLoginOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function createAdminLoginOtpToken(params: {
  userId: number;
  email: string;
  otp: string;
}): string {
  const now = Date.now();

  const payload: AdminLoginOtpPayload = {
    purpose: "ADMIN_LOGIN_OTP",
    userId: params.userId,
    email: params.email.trim().toLowerCase(),
    otpHash: hashOtp(params.userId, params.otp),
    attempts: 0,
    issuedAt: now,
    expiresAt: now + ADMIN_LOGIN_OTP_EXPIRY_SECONDS * 1000,
  };

  return encodePayload(payload);
}

export function getAdminLoginResendWaitSeconds(token: string | undefined): number {
  const payload = decodeAdminLoginOtpPayload(token);
  if (!payload) return 0;

  const elapsedSeconds = Math.floor((Date.now() - payload.issuedAt) / 1000);
  return Math.max(0, ADMIN_LOGIN_RESEND_SECONDS - elapsedSeconds);
}

export function verifyAdminLoginOtp(
  token: string | undefined,
  otp: string
):
  | {
      success: true;
      userId: number;
      email: string;
    }
  | {
      success: false;
      reason: "INVALID" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "NOT_FOUND";
      newToken?: string;
      remainingAttempts?: number;
    } {
  const payload = decodeAdminLoginOtpPayload(token);

  if (!payload) {
    return {
      success: false,
      reason: "NOT_FOUND",
    };
  }

  if (Date.now() > payload.expiresAt) {
    return {
      success: false,
      reason: "EXPIRED",
    };
  }

  if (payload.attempts >= MAX_ADMIN_OTP_ATTEMPTS) {
    return {
      success: false,
      reason: "TOO_MANY_ATTEMPTS",
    };
  }

  const enteredHash = hashOtp(payload.userId, otp.trim());

  const valid = crypto.timingSafeEqual(
    Buffer.from(enteredHash, "utf8"),
    Buffer.from(payload.otpHash, "utf8")
  );

  if (!valid) {
    const nextAttempts = payload.attempts + 1;
    const remainingAttempts = Math.max(0, MAX_ADMIN_OTP_ATTEMPTS - nextAttempts);

    const updatedPayload: AdminLoginOtpPayload = {
      ...payload,
      attempts: nextAttempts,
    };

    return {
      success: false,
      reason:
        nextAttempts >= MAX_ADMIN_OTP_ATTEMPTS
          ? "TOO_MANY_ATTEMPTS"
          : "INVALID",
      newToken: encodePayload(updatedPayload),
      remainingAttempts,
    };
  }

  return {
    success: true,
    userId: payload.userId,
    email: payload.email,
  };
}

export function maskEmail(email: string): string {
  const parts = email.trim().split("@");
  if (parts.length !== 2) return email;

  const [username, domain] = parts;
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }

  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const maskedUsername = `${firstChar}${"*".repeat(Math.max(1, username.length - 2))}${lastChar}`;

  return `${maskedUsername}@${domain}`;
}
