"use client";

import { useState } from "react";
import "@/app/(public)/tester/signup/login.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit message. Please try again.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "90vh",
        padding: "clamp(24px, 4vw, 50px) 0 clamp(40px, 8vw, 90px)",
        overflowX: "hidden",
      }}
    >
      <div className="container px-3 px-sm-4">
        {/* Header Section */}
        <div className="text-center mx-auto mb-4 mb-md-5" style={{ maxWidth: "680px" }}>
          <span className="auth-badge">
            <i className="bi bi-chat-heart me-1"></i> Get in Touch
          </span>
          <h1
            style={{
              fontSize: "clamp(24px, 5.5vw, 36px)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              marginBottom: "10px",
            }}
          >
            We&apos;re Here to Help
          </h1>
          <p
            style={{
              fontSize: "clamp(13.5px, 2.5vw, 16px)",
              color: "#64748b",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Have a question about Revtail, product testing campaigns, rewards, or want to partner with us as a brand?
            Our team is always happy to assist.
          </p>
        </div>

        {/* 4 Clean Minimalist Info Cards */}
        <div className="row g-3 g-md-4 mb-4 mb-md-5">
          {/* Card 1: Support */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="h-100 p-3 p-md-4 d-flex flex-column"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "#eff6ff",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "19px",
                  marginBottom: "12px",
                }}
              >
                <i className="bi bi-life-preserver"></i>
              </div>
              <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                Help &amp; Support
              </h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px", flexGrow: 1 }}>
                Questions regarding tests or campaign status.
              </p>
              <a
                href="mailto:support@revtail.in"
                className="text-truncate"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                support@revtail.in &rarr;
              </a>
            </div>
          </div>

          {/* Card 2: General Enquiries */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="h-100 p-3 p-md-4 d-flex flex-column"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "#f1f5f9",
                  color: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "19px",
                  marginBottom: "12px",
                }}
              >
                <i className="bi bi-envelope"></i>
              </div>
              <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                General Enquiries
              </h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px", flexGrow: 1 }}>
                Brand collaborations and business partnerships.
              </p>
              <a
                href="mailto:info@revtail.in"
                className="text-truncate"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                info@revtail.in &rarr;
              </a>
            </div>
          </div>

          {/* Card 3: WhatsApp & Phone */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="h-100 p-3 p-md-4 d-flex flex-column"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "19px",
                  marginBottom: "12px",
                }}
              >
                <i className="bi bi-whatsapp"></i>
              </div>
              <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                Call / WhatsApp
              </h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px", flexGrow: 1 }}>
                Direct assistance via voice or WhatsApp chat.
              </p>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <a
                  href="tel:+918341675736"
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  +91-8341675736
                </a>
                <span className="text-muted small">&bull;</span>
                <a
                  href="https://chat.whatsapp.com/JLDLEwZWJTPJKhPl5XzWQD"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#16a34a",
                    textDecoration: "none",
                  }}
                >
                  Group &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Card 4: Business Hours */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="h-100 p-3 p-md-4 d-flex flex-column"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "19px",
                  marginBottom: "12px",
                }}
              >
                <i className="bi bi-clock"></i>
              </div>
              <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                Business Hours
              </h3>
              <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "12px", flexGrow: 1 }}>
                Our team is available during standard IST hours.
              </p>
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>
                10:00 AM – 6:30 PM IST
              </span>
            </div>
          </div>
        </div>

        {/* Contact Form & Quick FAQ in 2 columns */}
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-lg-8">
            <div
              className="p-3 p-sm-4 p-md-5"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 10px 24px -4px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div className="mb-3 mb-md-4">
                <h2 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                  Send Us a Message
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                  Fill out the form below and our support team will respond within 24 hours.
                </p>
              </div>

              {submitted ? (
                <div
                  className="p-3 p-md-4 text-center"
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                  }}
                >
                  <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#166534" }}>
                    Thank you! Your message has been sent.
                  </h4>
                  <p style={{ fontSize: "14px", color: "#15803d", marginBottom: "16px" }}>
                    We have received your enquiry and our team will get in touch shortly.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success rounded-pill px-4 py-2 fw-semibold"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="alert alert-danger d-flex align-items-center mb-3 py-2 px-3 fs-14" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                      <div>{errorMsg}</div>
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="login-form-group">
                        <label className="login-form-label">Your Name</label>
                        <div className="login-input-group">
                          <i className="bi bi-person input-icon"></i>
                          <input
                            type="text"
                            required
                            className="login-input"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="login-form-group">
                        <label className="login-form-label">Email Address</label>
                        <div className="login-input-group">
                          <i className="bi bi-envelope input-icon"></i>
                          <input
                            type="email"
                            required
                            className="login-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="login-form-group">
                        <label className="login-form-label">Subject</label>
                        <div className="login-input-group">
                          <i className="bi bi-chat-square-text input-icon"></i>
                          <input
                            type="text"
                            required
                            className="login-input"
                            placeholder="What is this inquiry about?"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="login-form-group">
                        <label className="login-form-label">Message</label>
                        <textarea
                          required
                          rows={4}
                          className="login-input"
                          style={{
                            height: "auto",
                            padding: "12px 16px",
                            lineHeight: "1.5",
                          }}
                          placeholder="How can we help you?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>
                    </div>

                    <div className="col-12 pt-2">
                      <button
                        type="submit"
                        className="btn-login"
                        disabled={isSubmitting}
                        style={{ minHeight: "46px", borderRadius: "10px" }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span> Sending...
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <i className="bi bi-send ms-1"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
