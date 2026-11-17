"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  /*
   * identifier can be:
   * ADMIN / BRAND -> Email
   * TESTER        -> Mobile
   */
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  /*
   * ADMIN 2FA OTP STATE
   */
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [adminMaskedEmail, setAdminMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /*
   * --------------------------------------------------
   * FRONTEND IDENTIFIER VALIDATION
   * --------------------------------------------------
   */
  const validateIdentifier = () => {
    const value = identifier.trim();

    if (!value) {
      setErrorMessage("Email address or mobile number is required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedMobile = value.replace(/[\s-]/g, "");
    const mobileRegex = /^(\+91)?[6-9]\d{9}$/;

    const isEmail = emailRegex.test(value);
    const isMobile = mobileRegex.test(normalizedMobile);

    if (!isEmail && !isMobile) {
      setErrorMessage("Please enter a valid email address or mobile number.");
      return false;
    }

    return true;
  };

  /*
   * --------------------------------------------------
   * LOGIN SUBMIT (STEP 1)
   * --------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!validateIdentifier()) {
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        setErrorMessage("Unable to login. Server returned an invalid response.");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Login failed.");
        return;
      }

      // Check if ADMIN OTP is required
      if (result.requiresOtp) {
        setIsOtpStep(true);
        setAdminMaskedEmail(result.email || "your registered email");
        setInfoMessage(
          result.message ||
            "A verification code has been sent to your registered admin email."
        );
        setResendCooldown(60);
        setPassword(""); // Clear password from memory for security
        return;
      }

      const role = result.data?.role;

      if (!role) {
        setErrorMessage("Unable to determine user role.");
        return;
      }

      /*
       * ROLE-BASED REDIRECT FOR DIRECT LOGINS (BRAND / TESTER)
       */
      switch (role) {
        case "ADMIN":
          router.replace("/admin");
          break;
        case "BRAND":
          router.replace("/brand");
          break;
        case "TESTER":
          router.replace("/tester");
          break;
        default:
          setErrorMessage("Invalid user role.");
          return;
      }

      router.refresh();
    } catch (error) {
      console.error("LOGIN FORM ERROR:", error);
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * --------------------------------------------------
   * ADMIN OTP VERIFICATION SUBMIT (STEP 2)
   * --------------------------------------------------
   */
  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage("Verification code must be exactly 6 digits.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/login/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: cleanOtp,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        setErrorMessage("Invalid server response. Please try again.");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to verify code.");
        return;
      }

      // Admin verification successful, redirect to Admin dashboard
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("ADMIN VERIFY OTP ERROR:", error);
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * --------------------------------------------------
   * RESEND ADMIN OTP
   * --------------------------------------------------
   */
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMessage("");
    setInfoMessage("");

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/login/resend-otp", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to resend verification code.");
        return;
      }

      setInfoMessage(
        result.message || "A new verification code has been sent to your email."
      );
      setResendCooldown(60);
      setOtp("");
    } catch (error) {
      console.error("ADMIN RESEND OTP ERROR:", error);
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * --------------------------------------------------
   * BACK TO LOGIN (CREDENTIALS STEP)
   * --------------------------------------------------
   */
  const handleBackToLogin = () => {
    setIsOtpStep(false);
    setOtp("");
    setErrorMessage("");
    setInfoMessage("");
  };

  /*
   * --------------------------------------------------
   * RENDER STEP 2: ADMIN OTP VERIFICATION SCREEN
   * --------------------------------------------------
   */
  if (isOtpStep) {
    return (
      <form onSubmit={handleVerifyOtp} noValidate>
        {/* Security badge and email notification banner */}
        <div
          className="alert d-flex align-items-start mb-3"
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            borderRadius: "8px",
            fontSize: "13.5px",
            lineHeight: "1.5",
          }}
        >
          <i
            className="bi bi-shield-check fs-5 me-2 text-success"
            style={{ marginTop: "-2px" }}
          ></i>
          <div>
            A 6-digit verification code has been sent to{" "}
            <strong>{adminMaskedEmail}</strong>.
          </div>
        </div>

        {errorMessage && (
          <div
            className="alert alert-danger mb-3"
            role="alert"
            style={{ fontSize: "13.5px" }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMessage}
          </div>
        )}

        {infoMessage && !errorMessage && (
          <div
            className="alert alert-success mb-3"
            role="alert"
            style={{ fontSize: "13.5px" }}
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            {infoMessage}
          </div>
        )}

        {/* OTP Input */}
        <div className="login-form-group">
          <label htmlFor="admin-otp" className="login-form-label">
            Enter 6-Digit Code
          </label>
          <div className="login-input-group">
            <i className="bi bi-key input-icon"></i>
            <input
              type="text"
              id="admin-otp"
              name="otp"
              className="login-input"
              placeholder="••••••"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(val);
              }}
              style={{
                letterSpacing: "8px",
                fontSize: "18px",
                fontWeight: "600",
                textAlign: "center",
                paddingLeft: "42px",
              }}
              disabled={isLoading}
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              required
            />
          </div>
          <small
            className="text-muted d-block mt-1"
            style={{ fontSize: "12px" }}
          >
            Code is valid for 5 minutes.
          </small>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-login"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Sign In</span>
              <i className="bi bi-check2-circle ms-2"></i>
            </>
          )}
        </button>

        {/* Action links: Back to login & Resend Code */}
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-light-subtle">
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none text-muted"
            style={{ fontSize: "13px" }}
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Login
          </button>

          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            style={{
              fontSize: "13px",
              cursor:
                resendCooldown > 0 || isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading || resendCooldown > 0}
            onClick={handleResendOtp}
          >
            {resendCooldown > 0 ? (
              <span className="text-muted">
                <i className="bi bi-clock me-1"></i> Resend in {resendCooldown}s
              </span>
            ) : (
              <span className="text-primary fw-semibold">
                <i className="bi bi-arrow-clockwise me-1"></i> Resend Code
              </span>
            )}
          </button>
        </div>
      </form>
    );
  }

  /*
   * --------------------------------------------------
   * RENDER STEP 1: CREDENTIALS SCREEN
   * --------------------------------------------------
   */
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {/* ========================================= */}
      {/* EMAIL / MOBILE */}
      {/* ========================================= */}
      <div className="login-form-group">
        <label htmlFor="identifier" className="login-form-label">
          Email or Mobile Number
        </label>
        <div className="login-input-group">
          <i className="bi bi-person input-icon"></i>
          <input
            type="text"
            id="identifier"
            name="identifier"
            className="login-input"
            placeholder="Email address or mobile number"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            disabled={isLoading}
            autoComplete="username"
            required
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* PASSWORD */}
      {/* ========================================= */}
      <div className="login-form-group">
        <label htmlFor="password" className="login-form-label">
          Password
        </label>
        <div className="login-input-group">
          <i className="bi bi-shield-lock input-icon"></i>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            className="login-input login-input-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            <i
              className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
            ></i>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* FORGOT PASSWORD */}
      {/* ========================================= */}
      <div className="login-options">
        <span></span>
        <Link href="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>
      </div>

      {/* ========================================= */}
      {/* LOGIN BUTTON */}
      {/* ========================================= */}
      <button type="submit" className="btn-login" disabled={isLoading}>
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <i className="bi bi-arrow-right"></i>
          </>
        )}
      </button>
    </form>
  );
}
