"use client";

import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";



type Gender = "" | "MALE" | "FEMALE" | "OTHER";

type AgeCategory =
  | ""
  | "AGE_18_24"
  | "AGE_25_34"
  | "AGE_35_44"
  | "AGE_45_PLUS";

export default function TesterSignupForm() {
 
  const router = useRouter();



  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [gender, setGender] =
    useState<Gender>("");
  const [ageCategory, setAgeCategory] =
    useState<AgeCategory>("");
  const [pinCode, setPinCode] =
    useState("");
  const [whatsappConsent, setWhatsappConsent] =
    useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [otp, setOtp] =
    useState("");

  const [
    otpSent,
    setOtpSent,
  ] = useState(false);

  const [
    mobileVerified,
    setMobileVerified,
  ] = useState(false);

  const [
    isSendingOtp,
    setIsSendingOtp,
  ] = useState(false);

  const [
    isVerifyingOtp,
    setIsVerifyingOtp,
  ] = useState(false);

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);

  /*
   * ---------------------------------------------
   * OTP RESEND COUNTDOWN
   * ---------------------------------------------
   */
  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setResendSeconds(
            (current) =>
              current > 0
                ? current - 1
                : 0
          );
        },
        1000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [resendSeconds]);

  /*
   * ---------------------------------------------
   * SEND WHATSAPP OTP
   * ---------------------------------------------
   */
  const handleSendOtp =
    async () => {
      setErrorMessage("");
      setSuccessMessage("");

      const normalizedMobile =
        mobile.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          normalizedMobile
        )
      ) {
        setErrorMessage(
          "Please enter a valid 10-digit Indian mobile number."
        );

        return;
      }

      try {
        setIsSendingOtp(true);

        const response =
          await fetch(
            "/api/tester/signup/otp/send",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  mobile:
                    normalizedMobile,
                }),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          const responseText =
            await response.text();

          console.error(
            "SEND OTP NON-JSON RESPONSE:",
            {
              status:
                response.status,

              url:
                response.url,

              response:
                responseText,
            }
          );

          setErrorMessage(
            "Unable to send OTP. The server returned an invalid response."
          );

          return;
        }

        const result =
          await response.json();

        if (!response.ok) {
          setErrorMessage(
            result.message ||
              "Unable to send OTP."
          );

          if (
            result.retryAfter
          ) {
            setResendSeconds(
              Number(
                result.retryAfter
              )
            );
          }

          return;
        }

        setOtp("");
        setOtpSent(true);
        setMobileVerified(
          false
        );

        setResendSeconds(
          Number(
            result.resendAfter ??
              60
          )
        );

        setSuccessMessage(
          result.message ||
            "OTP sent to your WhatsApp number."
        );
      } catch (error) {
        console.error(
          "SEND OTP ERROR:",
          error
        );

        setErrorMessage(
          "Unable to send OTP. Please try again."
        );
      } finally {
        setIsSendingOtp(false);
      }
    };

  /*
   * ---------------------------------------------
   * VERIFY WHATSAPP OTP
   * ---------------------------------------------
   */
  const handleVerifyOtp =
    async () => {
      setErrorMessage("");
      setSuccessMessage("");

      if (
        !/^\d{6}$/.test(
          otp
        )
      ) {
        setErrorMessage(
          "Please enter the 6-digit OTP."
        );

        return;
      }

      try {
        setIsVerifyingOtp(
          true
        );

        const response =
          await fetch(
            "/api/tester/signup/otp/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  mobile:
                    mobile.trim(),

                  otp,
                }),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          const responseText =
            await response.text();

          console.error(
            "VERIFY OTP NON-JSON RESPONSE:",
            {
              status:
                response.status,

              url:
                response.url,

              response:
                responseText,
            }
          );

          setErrorMessage(
            "Unable to verify OTP. The server returned an invalid response."
          );

          return;
        }

        const result =
          await response.json();

        if (!response.ok) {
          setErrorMessage(
            result.message ||
              "Invalid OTP."
          );

          return;
        }

        setMobileVerified(
          true
        );

        setSuccessMessage(
          result.message ||
            "Mobile number verified successfully."
        );
      } catch (error) {
        console.error(
          "VERIFY OTP ERROR:",
          error
        );

        setErrorMessage(
          "Unable to verify OTP. Please try again."
        );
      } finally {
        setIsVerifyingOtp(
          false
        );
      }
    };

  /*
   * ---------------------------------------------
   * FRONTEND VALIDATION
   * ---------------------------------------------
   */
  const validateForm = () => {
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage(
        "Full name is required."
      );

      return false;
    }

    /*
     * Tester mobile is stored as a normalized
     * 10-digit Indian mobile number.
     */
    const normalizedMobile =
      mobile.trim();

    if (!normalizedMobile) {
      setErrorMessage(
        "Mobile number is required."
      );

      return false;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        normalizedMobile
      )
    ) {
      setErrorMessage(
        "Please enter a valid 10-digit Indian mobile number."
      );

      return false;
    }

    if (!mobileVerified) {
      setErrorMessage(
        "Please verify your mobile number with the WhatsApp OTP."
      );

      return false;
    }

    if (!password) {
      setErrorMessage(
        "Password is required."
      );

      return false;
    }

    /*
     * API requires minimum 8 characters.
     */
    if (password.length < 8) {
      setErrorMessage(
        "Password must be at least 8 characters."
      );

      return false;
    }

    if (!confirmPassword) {
      setErrorMessage(
        "Confirm password is required."
      );

      return false;
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "Password and confirm password do not match."
      );

      return false;
    }

    if (!gender) {
      setErrorMessage(
        "Please select gender."
      );

      return false;
    }

    if (!ageCategory) {
      setErrorMessage(
        "Please select your age category."
      );

      return false;
    }

    if (!pinCode.trim()) {
      setErrorMessage(
        "PIN code is required."
      );

      return false;
    }

    if (
      !/^\d{6}$/.test(
        pinCode.trim()
      )
    ) {
      setErrorMessage(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    if (!whatsappConsent) {
      setErrorMessage(
        "Please agree to receive campaign messages and updates on WhatsApp."
      );

      return false;
    }

    return true;
  };

  /*
   * ---------------------------------------------
   * SUBMIT
   * ---------------------------------------------
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await fetch(
          "/api/tester/signup",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fullName:
                fullName.trim(),

              mobile:
                mobile.trim(),

              password,

              gender,

              ageCategory,

              pinCode:
                pinCode.trim(),
            }),
          }
        );

      /*
       * Guard against an HTML error page.
       */
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        const responseText =
          await response.text();

        console.error(
          "TESTER SIGNUP NON-JSON RESPONSE:",
          {
            status:
              response.status,

            url:
              response.url,

            response:
              responseText,
          }
        );

        setErrorMessage(
          "Unable to create account. The server returned an invalid response."
        );

        return;
      }

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.message ||
            "Unable to create Tester account."
        );

        return;
      }

      /*
       * Registration succeeded.
       *
       * Do not redirect to login because the Tester
       * must first be approved by an Admin.
       */
      setSuccessMessage(
        "Your account is under review. You will be notified once approved." 
      );

      /*
       * Clear sensitive fields.
       */
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "TESTER SIGNUP ERROR:",
        error
      );

      setErrorMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <form onSubmit={handleSubmit} noValidate>
    {/* ERROR MESSAGE */}
    {errorMessage && (
      <div className="alert alert-danger mb-3" role="alert">
        {errorMessage}
      </div>
    )}

    {/* SUCCESS MESSAGE */}
    {successMessage && (
      <div className="alert alert-success mb-3" role="alert">
        {successMessage}
      </div>
    )}

    <div className="row g-3">
      {/* ===================================== */}
      {/* FULL NAME */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="fullName"
            className="login-form-label"
          >
            Full Name
          </label>

          <div className="login-input-group">
            <i className="bi bi-person input-icon"></i>

            <input
              type="text"
              id="fullName"
              name="fullName"
              className="login-input"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={isLoading}
              autoComplete="name"
              required
            />
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* MOBILE NUMBER */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="mobile"
            className="login-form-label"
          >
            Mobile Number
          </label>

          <div className="login-input-group">
            <i className="bi bi-phone input-icon"></i>

            <input
              type="tel"
              id="mobile"
              name="mobile"
              className="login-input"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setMobile(value);
                setOtp("");
                setOtpSent(false);
                setMobileVerified(false);
                setResendSeconds(0);
                setSuccessMessage("");
                setErrorMessage("");
              }}
              disabled={isLoading}
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              required
            />
          </div>

          <div
            className="text-muted mt-1"
            style={{
              fontSize: "11px",
              lineHeight: "1.35",
            }}
          >
            This mobile number will be used for Tester login.{" "}
            {!mobileVerified ? (
              <button
                type="button"
                className="btn btn-link p-0 border-0 align-baseline text-success text-decoration-underline"
                style={{
                  fontSize: "11px",
                  lineHeight: "1.35",
                  verticalAlign: "baseline",
                }}
                disabled={
                  isLoading ||
                  isSendingOtp ||
                  mobile.length !== 10 ||
                  resendSeconds > 0
                }
                onClick={handleSendOtp}
              >
                {isSendingOtp
                  ? "Sending OTP..."
                  : resendSeconds > 0
                  ? `Resend OTP in ${resendSeconds}s`
                  : otpSent
                  ? "Resend WhatsApp OTP"
                  : "Send WhatsApp OTP"}
              </button>
            ) : (
              <span className="text-success fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i>
                Mobile verified
              </span>
            )}
          </div>

          {/* WHATSAPP OTP INPUT */}
          {otpSent && !mobileVerified && (
            <div className="mt-3">
              <label
                htmlFor="signupOtp"
                className="login-form-label"
              >
                WhatsApp OTP
              </label>

              <div className="d-flex gap-2">
                <div className="login-input-group flex-grow-1">
                  <i className="bi bi-shield-lock input-icon"></i>

                  <input
                    type="text"
                    id="signupOtp"
                    className="login-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    disabled={isLoading || isVerifyingOtp}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-success tester-verify-otp-button"
                  disabled={
                    isLoading || isVerifyingOtp || otp.length !== 6
                  }
                  onClick={handleVerifyOtp}
                >
                  {isVerifyingOtp ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>

              <small
                className="text-muted d-block mt-1"
                style={{
                  fontSize: "11px",
                  lineHeight: "1.35",
                }}
              >
                Enter the OTP sent to your WhatsApp number.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* ===================================== */}
      {/* GENDER */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="gender"
            className="login-form-label"
          >
            Gender
          </label>

          <div className="login-input-group">
            <i className="bi bi-person-badge input-icon"></i>

            <select
              id="gender"
              name="gender"
              className="login-input"
              value={gender}
              onChange={(event) =>
                setGender(event.target.value as Gender)
              }
              disabled={isLoading}
              required
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* AGE CATEGORY */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="ageCategory"
            className="login-form-label"
          >
            Age Category
          </label>

          <div className="login-input-group">
            <i className="bi bi-people input-icon"></i>

            <select
              id="ageCategory"
              name="ageCategory"
              className="login-input"
              value={ageCategory}
              onChange={(event) =>
                setAgeCategory(
                  event.target.value as AgeCategory
                )
              }
              disabled={isLoading}
              required
            >
              <option value="">Select Age Category</option>
              <option value="AGE_18_24">18–24 years</option>
              <option value="AGE_25_34">25–34 years</option>
              <option value="AGE_35_44">35–44 years</option>
              <option value="AGE_45_PLUS">45 years and above</option>
            </select>
          </div>

          <small
            className="text-muted d-block mt-1"
            style={{ fontSize: "11px", lineHeight: "1.35" }}
          >
            We only collect your age group, not your exact date of birth.
          </small>
        </div>
      </div>

      {/* ===================================== */}
      {/* PIN CODE */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="pinCode"
            className="login-form-label"
          >
            Area PIN Code
          </label>

          <div className="login-input-group">
            <i className="bi bi-geo-alt input-icon"></i>

            <input
              type="text"
              id="pinCode"
              name="pinCode"
              className="login-input"
              placeholder="Area PIN code"
              value={pinCode}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);
                setPinCode(value);
              }}
              disabled={isLoading}
              inputMode="numeric"
              maxLength={6}
              required
            />
          </div>

          <small
            className="text-muted d-block mt-1"
            style={{ fontSize: "11px", lineHeight: "1.35" }}
          >
            City and state will be automatically identified from your PIN code.
          </small>
        </div>
      </div>

      {/* ===================================== */}
      {/* PASSWORD */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="password"
            className="login-form-label"
          >
            Password
          </label>

          <div className="login-input-group">
            <i className="bi bi-shield-lock input-icon"></i>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="login-input login-input-password"
              placeholder="Create password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle-btn"
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <i
                className={
                  showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                }
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* CONFIRM PASSWORD */}
      {/* ===================================== */}
      <div className="col-12 col-md-6">
        <div className="login-form-group">
          <label
            htmlFor="confirmPassword"
            className="login-form-label"
          >
            Confirm Password
          </label>

          <div className="login-input-group">
            <i className="bi bi-shield-check input-icon"></i>

            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="login-input login-input-password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={isLoading}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle-btn"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={isLoading}
            >
              <i
                className={
                  showConfirmPassword
                    ? "bi bi-eye-slash"
                    : "bi bi-eye"
                }
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* PASSWORD INFO */}
      <div className="col-12">
        <small
          className="text-muted d-block"
          style={{ fontSize: "11px", lineHeight: "1.35" }}
        >
          Password must be at least 8 characters long.
        </small>
      </div>



      {/* ===================================== */}
      {/* WHATSAPP CAMPAIGN CONSENT PERMISSION */}
      {/* ===================================== */}
      <div className="col-12 my-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isLoading) {
              setWhatsappConsent(!whatsappConsent);
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !isLoading) {
              e.preventDefault();
              setWhatsappConsent(!whatsappConsent);
            }
          }}
          className="user-select-none"
          style={{
            backgroundColor: whatsappConsent ? "#f0fdf4" : "#ffffff",
            border: whatsappConsent ? "1.5px solid #22c55e" : "1.5px solid #cbd5e1",
            borderRadius: "12px",
            padding: "14px 16px",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: whatsappConsent
              ? "0 2px 8px rgba(34, 197, 94, 0.12)"
              : "0 1px 3px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div className="d-flex align-items-start gap-3">
            {/* Custom Bulletproof Checkbox (Immune to global CSS input overrides) */}
            <div
              style={{
                width: "22px",
                height: "22px",
                minWidth: "22px",
                maxWidth: "22px",
                borderRadius: "6px",
                backgroundColor: whatsappConsent ? "#16a34a" : "#ffffff",
                border: whatsappConsent ? "2px solid #16a34a" : "2px solid #94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "2px",
                transition: "all 0.18s ease",
                boxShadow: whatsappConsent ? "0 2px 4px rgba(22, 163, 74, 0.25)" : "none",
                flexShrink: 0,
              }}
            >
              {whatsappConsent && (
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <path
                    d="M1.5 5L4.5 8L11.5 1.5"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Hidden Input for Form Accessibility */}
            <input
              type="checkbox"
              id="whatsappConsent"
              name="whatsappConsent"
              checked={whatsappConsent}
              onChange={(e) => setWhatsappConsent(e.target.checked)}
              disabled={isLoading}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: 0,
                height: 0,
                margin: 0,
                padding: 0,
              }}
            />

            {/* Label & Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="d-flex align-items-center gap-1.5 mb-1"
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                <i
                  className="bi bi-whatsapp"
                  style={{ color: "#25D366", fontSize: "16px" }}
                ></i>
                <span>WhatsApp Updates Permission</span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#475569",
                  lineHeight: "1.5",
                  fontWeight: 500,
                }}
              >
                I agree to receive new campaign invitations, task instructions, and reward updates on my WhatsApp number.
              </div>
            </div>
          </div>

          {/* Required warning alert if unchecked */}
          {!whatsappConsent && (
            <div
              className="mt-2.5 pt-2 border-top d-flex align-items-center gap-1.5"
              style={{
                borderColor: "#fee2e2",
                color: "#dc2626",
                fontSize: "11.5px",
                fontWeight: 600,
              }}
            >
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>Permission is required to receive campaign alerts and instructions on WhatsApp.</span>
            </div>
          )}
        </div>
      </div>

      {/* ===================================== */}
      {/* SUBMIT */}
      {/* ===================================== */}
      <div className="col-12">
        <button
          type="submit"
          className="btn-login w-100"
          disabled={
            isLoading || !mobileVerified || !whatsappConsent
          }
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Tester Account</span>
              <i className="bi bi-arrow-right ms-2"></i>
            </>
          )}
        </button>
      </div>

      {/* LOGIN LINK */}
      <div className="col-12 text-center mt-2">
        <span className="text-muted">Already registered? </span>
        <Link href="/login" className="forgot-password-link">
          Sign In
        </Link>
      </div>
    </div>
    {/* Keep Verify OTP legible even if a global button hover rule overrides Bootstrap. */}
    <style>{`
      .tester-verify-otp-button,
      .tester-verify-otp-button:hover,
      .tester-verify-otp-button:focus,
      .tester-verify-otp-button:active {
        background-color: #198754 !important;
        border-color: #198754 !important;
        color: #fff !important;
      }
    `}</style>
  </form>
);
}

