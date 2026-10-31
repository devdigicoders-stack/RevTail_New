"use client";

import Link from "next/link";
import { OngoingCampaignsSkeleton } from "@/components/tester/TesterSkeletonLoader";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

// ============================================================
// TYPES
// ============================================================

type TaskStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

type SubmissionStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

type TaskProgress = {
  id: number;

  taskNumber: number;

  title: string;

  status: TaskStatus;

  unlockedAt:
    | string
    | null;

  submittedAt:
    | string
    | null;

  approvedAt:
    | string
    | null;

  rejectedAt:
    | string
    | null;

  rejectionReason:
    | string
    | null;

  totalAttempts:
    number;

  latestSubmission: {
    id: number;

    attemptNumber:
      number;

    status:
      SubmissionStatus;

    submittedAt:
      string;

    reviewedAt:
      | string
      | null;

    rejectionReason:
      | string
      | null;
  } | null;

  isCurrent:
    boolean;

  canSubmit:
    boolean;

  waitingForApproval:
    boolean;

  isCompleted:
    boolean;
};

type ProgressResponse = {
  success: boolean;

  message: string;

  data?: {
    testerCampaignId:
      number;

    campaign: {
      id: number;

      productName:
        string;

      productImage:
        | string
        | null;

      productDescription:
        | string
        | null;

      productLink:
        | string
        | null;

      brandName:
        | string
        | null;

      task4Required:
        boolean;
    };

    campaignStatus:
      | "ONGOING"
      | "COMPLETED"
      | "CANCELLED";

    currentTaskNumber:
      number;

    currentTask:
      | TaskProgress
      | null;

    progress: {
      approvedTasks:
        number;

      totalTasks:
        number;

      percentage:
        number;
    };

    earningAmount:
      | number
      | string;

    joinedAt:
      string;

    startedAt:
      | string
      | null;

    completedAt:
      | string
      | null;

    cancelledAt:
      | string
      | null;

    cancellationReason:
      | string
      | null;

    tasks:
      TaskProgress[];
  };
};

// ============================================================
// PAGE
// ============================================================

export default function TesterCampaignProgressPage() {
  const params =
    useParams<{
      testerCampaignId:
        string;
    }>();

  const testerCampaignId =
    Number(
      params.testerCampaignId
    );

  const [
    campaignData,
    setCampaignData,
  ] =
    useState<
      ProgressResponse["data"] | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        new Date()
    );

  const [
    mobileTab,
    setMobileTab,
  ] =
    useState<"tasks" | "details">(
      "tasks"
    );

  // ============================================================
  // LOAD CAMPAIGN PROGRESS
  // ============================================================

  const loadProgress =
    useCallback(
      async () => {
        if (
          !Number.isInteger(
            testerCampaignId
          ) ||
          testerCampaignId <=
            0
        ) {
          setError(
            "Invalid tester campaign."
          );

          setLoading(
            false
          );

          return;
        }

        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const response =
            await fetch(
              `/api/tester/campaigns/ongoing/${testerCampaignId}/progress`,
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const result =
            (await response.json()) as
              ProgressResponse;

          if (
            !response.ok
          ) {
            throw new Error(
              result.message ||
                "Unable to load campaign progress."
            );
          }

          setCampaignData(
            result.data ??
              null
          );
        } catch (err) {
          console.error(
            "Campaign progress error:",
            err
          );

          setError(
            err instanceof
              Error
              ? err.message
              : "Unable to load campaign progress."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        testerCampaignId,
      ]
    );

  useEffect(() => {
    loadProgress();
  }, [
    loadProgress,
  ]);

  // ============================================================
  // INFORMATIONAL COUNTDOWN
  // ============================================================

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setNow(
            new Date()
          );
        },
        60 *
          1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading
  ) {
    return <OngoingCampaignsSkeleton />;
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !campaignData
  ) {
    return (
      <div className="col-12">

        <div className="alert alert-danger border-0 shadow-sm">

          <i className="bi bi-exclamation-circle me-2"></i>

          {
            error ||
            "Campaign information not found."
          }

        </div>

        <Link
          href="/tester/campaigns/ongoing"
          className="btn btn-outline-primary btn-sm"
        >
          <i className="bi bi-arrow-left me-2"></i>

          Back to Ongoing Campaigns
        </Link>

      </div>
    );
  }

  const {
    campaign,
    progress,
    tasks,
  } =
    campaignData;

  const cleanProductDescription = campaign.productDescription
    ? campaign.productDescription.replace(/<[^>]*>/g, "").trim()
    : "";

  return (
    <>
      {/* ======================================================
          MOBILE PHONE VIEW (Only on screens < 768px: d-block d-md-none)
          Navy Background + Floating Rounded White Card (Reference Design)
      ====================================================== */}
      <div
        className="col-12 d-block d-md-none tester-app-header-container p-0 m-0"
        style={{
          background: "linear-gradient(180deg, #00163e 0%, #001f54 100%)",
          minHeight: "100vh",
          paddingBottom: "115px",
          overflowX: "hidden",
        }}
      >
        {/* Top Dark Navy Header Area */}
        <div className="px-3 pt-3 pb-3 text-white">
          {/* Back Icon Button */}
          <div className="d-flex align-items-center mb-2.5">
            <Link
              href="/tester/campaigns/ongoing"
              className="text-white text-decoration-none d-inline-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.14)",
              }}
              aria-label="Back to Ongoing Campaigns"
            >
              <i className="bi bi-chevron-left fs-5"></i>
            </Link>
          </div>

          {/* Product Title */}
          <h1
            className="text-white fw-bold mb-3 text-truncate"
            style={{
              fontSize: "clamp(1.15rem, 4.5vw, 1.35rem)",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
            title={campaign.productName}
          >
            {campaign.productName}
          </h1>

          {/* 2 Tabs: Details & Tasks (No Feedback Tab) */}
          <div className="d-flex align-items-center justify-content-center gap-2.5 mb-1">
            <button
              type="button"
              onClick={() => setMobileTab("details")}
              className="btn border-0 py-2 px-4 fw-bold"
              style={{
                borderRadius: "999px",
                fontSize: "14px",
                transition: "all 0.2s ease",
                ...(mobileTab === "details"
                  ? {
                      backgroundColor: "#f59e0b",
                      color: "#0f172a",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "rgba(255, 255, 255, 0.75)",
                    }),
              }}
            >
              Details
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("tasks")}
              className="btn border-0 py-2 px-4 fw-bold"
              style={{
                borderRadius: "999px",
                fontSize: "14px",
                transition: "all 0.2s ease",
                ...(mobileTab === "tasks"
                  ? {
                      backgroundColor: "#f59e0b",
                      color: "#0f172a",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "rgba(255, 255, 255, 0.75)",
                    }),
              }}
            >
              Tasks
            </button>
          </div>
        </div>

        {/* Floating White Card with Balanced Symmetrical Margins */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            margin: "0 10px",
            padding: "1.25rem 1rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
        >
          {/* TAB 1: TASKS */}
          {mobileTab === "tasks" && (
            <div>
              {/* Alert if waiting review */}
              {campaignData.currentTask?.waitingForApproval && (
                <div className="alert alert-warning py-2 px-3 mb-3 small rounded-3 border-0">
                  <i className="bi bi-hourglass-split me-2"></i>
                  Task {campaignData.currentTask.taskNumber} is submitted and waiting for review.
                </div>
              )}

              {/* Alert if rejected */}
              {campaignData.currentTask?.status === "REJECTED" && (
                <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 border-0">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  <strong>Task {campaignData.currentTask.taskNumber} rejected:</strong>{" "}
                  {campaignData.currentTask.rejectionReason || "Please correct the submission and try again."}
                </div>
              )}

              {/* Tasks List */}
              <div className="d-flex flex-column gap-3">
                {tasks.map((task) => {
                  const rejectionReason =
                    task.rejectionReason ||
                    task.latestSubmission?.rejectionReason;

                  const taskDescription =
                    task.status === "REJECTED" && rejectionReason
                      ? `Reason: ${rejectionReason}`
                      : getTaskDescription(task.taskNumber);

                  const taskUrl =
                    `/tester/campaigns/ongoing/${testerCampaignId}/tasks/${task.taskNumber}`;

                  const taskCanOpen = task.isCurrent && task.canSubmit;

                  const taskHasSubmittedDetails =
                    (task.status === "APPROVED" || task.status === "SUBMITTED") &&
                    task.latestSubmission !== null;

                  const taskDetailUrl = `${taskUrl}/submission`;

                  const showBuyNow =
                    task.taskNumber === 1 && Boolean(campaign.productLink);

                  const mobileTaskCard = (
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: task.isCurrent ? "#f8fafc" : "#ffffff",
                        border: task.isCurrent ? "1.5px solid #cbd5e1" : "1px solid #f1f5f9",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Top Row: Icon + Title + Buy Now */}
                      <div className="d-flex align-items-center gap-2 mb-1.5">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="flex-shrink-0"
                        >
                          <rect x="5" y="4" width="14" height="17" rx="2" ry="2" />
                          <path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>

                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: "14.5px" }}>
                          Task {task.taskNumber} :{" "}
                          {task.taskNumber === 4 ? "Publish Upon Approval" : task.title}
                        </div>

                        {showBuyNow && campaign.productLink && (
                          <a
                            href={campaign.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm ms-auto py-1 px-2.5 rounded-2 fw-semibold text-nowrap"
                            style={{ fontSize: "12px", zIndex: 3 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Buy Now
                          </a>
                        )}

                        {(taskCanOpen || taskHasSubmittedDetails) && !showBuyNow && (
                          <i className="bi bi-chevron-right text-muted ms-auto fs-6"></i>
                        )}
                      </div>

                      {/* Subtitle / Description */}
                      <div className="text-muted mb-2.5" style={{ fontSize: "12.5px", lineHeight: "1.45" }}>
                        -&gt; {taskDescription}
                      </div>

                      {/* Bottom Status / Badges */}
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        {task.status === "APPROVED" && (
                          <div className="d-flex align-items-center gap-1.5 fw-semibold" style={{ color: "#10b981", fontSize: "13px" }}>
                            <i className="bi bi-check-circle-fill fs-6"></i>
                            <span>Completed</span>
                          </div>
                        )}

                        {(task.status === "AVAILABLE" || (task.isCurrent && task.canSubmit && task.status !== "REJECTED")) && (
                          <div className="d-flex flex-wrap align-items-center gap-3">
                            <div className="d-flex align-items-center gap-1.5 fw-semibold" style={{ color: "#2563eb", fontSize: "13px" }}>
                              <i className="bi bi-clock-history"></i>
                              <span>On going</span>
                            </div>

                            {campaignData.campaignStatus === "ONGOING" && task.unlockedAt && (
                              <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "12px" }}>
                                <i className="bi bi-clock text-warning"></i>
                                <span>Time left :</span>
                                <strong className="text-dark">
                                  {formatTaskTimeLeftCompact(task.unlockedAt, task.taskNumber, now)}
                                </strong>
                              </div>
                            )}
                          </div>
                        )}

                        {task.status === "SUBMITTED" && (
                          <div className="d-flex align-items-center gap-1.5 fw-semibold text-warning" style={{ fontSize: "13px" }}>
                            <i className="bi bi-hourglass-split"></i>
                            <span>Under Review</span>
                          </div>
                        )}

                        {task.status === "REJECTED" && (
                          <div className="d-flex align-items-center gap-1.5 fw-semibold text-danger" style={{ fontSize: "13px" }}>
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <span>Resubmit</span>
                          </div>
                        )}

                        {task.status === "LOCKED" && (
                          <div
                            className="d-inline-flex align-items-center gap-1.5 fw-semibold"
                            style={{
                              backgroundColor: "#f5f3ff",
                              color: "#8b5cf6",
                              padding: "3px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          >
                            <i className="bi bi-clock-fill" style={{ fontSize: "11px" }}></i>
                            <span>Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  if (showBuyNow) {
                    return (
                      <div key={task.id} className="position-relative">
                        {mobileTaskCard}
                        {(taskCanOpen || taskHasSubmittedDetails) && (
                          <Link
                            href={taskCanOpen ? taskUrl : taskDetailUrl}
                            className="stretched-link"
                            aria-label={`View Task ${task.taskNumber}`}
                          />
                        )}
                      </div>
                    );
                  }

                  if (taskCanOpen || taskHasSubmittedDetails) {
                    return (
                      <Link
                        key={task.id}
                        href={taskCanOpen ? taskUrl : taskDetailUrl}
                        className="text-decoration-none d-block"
                      >
                        {mobileTaskCard}
                      </Link>
                    );
                  }

                  return <div key={task.id}>{mobileTaskCard}</div>;
                })}
              </div>

              {/* Bottom Progress Bar */}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <span className="small text-muted fw-medium">
                    Task Completed: <strong className="text-dark">{progress.approvedTasks}/{progress.totalTasks}</strong>
                  </span>
                  <span className="small fw-bold text-primary">{progress.percentage}%</span>
                </div>
                <div className="progress" style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "999px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${progress.percentage}%`,
                      backgroundColor: "#2563eb",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {mobileTab === "details" && (
            <div>
              {campaign.productImage && (
                <div
                  className="rounded-4 overflow-hidden mb-3 bg-light d-flex align-items-center justify-content-center p-2 border"
                  style={{ height: "220px", borderColor: "#e2e8f0" }}
                >
                  <img
                    src={campaign.productImage}
                    alt={campaign.productName}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>
              )}

              <div className="mb-3">
                <span
                  className="badge px-2.5 py-1 rounded-pill mb-2 fw-semibold"
                  style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "11px" }}
                >
                  {campaign.brandName ?? "Brand"}
                </span>
                <h5 className="fw-bold text-dark mb-1" style={{ lineHeight: 1.35 }}>
                  {campaign.productName}
                </h5>
              </div>

              {/* 2x2 Info Grid with clean CSS Grid and proper padding */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "1.25rem",
                }}
              >
                {/* 1. Earning Reward */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      marginBottom: "4px",
                      lineHeight: 1.2,
                    }}
                  >
                    Earning Reward
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#16a34a",
                      lineHeight: 1.2,
                    }}
                  >
                    ₹{Number(campaignData.earningAmount).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* 2. Total Tasks */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      marginBottom: "4px",
                      lineHeight: 1.2,
                    }}
                  >
                    Total Tasks
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.2,
                    }}
                  >
                    {progress.totalTasks} Tasks
                  </div>
                </div>

                {/* 3. Status */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      marginBottom: "4px",
                      lineHeight: 1.2,
                    }}
                  >
                    Status
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#2563eb",
                      lineHeight: 1.2,
                    }}
                  >
                    {formatCampaignStatus(campaignData.campaignStatus)}
                  </div>
                </div>

                {/* 4. Completed */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      marginBottom: "4px",
                      lineHeight: 1.2,
                    }}
                  >
                    Completed
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.2,
                    }}
                  >
                    {progress.approvedTasks} / {progress.totalTasks}
                  </div>
                </div>
              </div>

              {/* Clean About Product text without raw HTML tags */}
              {cleanProductDescription && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    marginBottom: "1rem",
                  }}
                >
                  <h6
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "6px",
                    }}
                  >
                    About Product
                  </h6>
                  <p
                    style={{
                      lineHeight: 1.5,
                      fontSize: "13px",
                      color: "#475569",
                      margin: 0,
                    }}
                  >
                    {cleanProductDescription}
                  </p>
                </div>
              )}

              {/* Marketplace CTA Button */}
              {campaign.productLink && (
                <a
                  href={campaign.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm mb-2"
                  style={{ fontSize: "14px" }}
                >
                  <i className="bi bi-cart-check"></i>
                  <span>View Product on Marketplace</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          DESKTOP VIEW (Screens >= 768px: d-none d-md-block)
          Preserves original desktop layout untouched!
      ====================================================== */}
      <div className="col-12 d-none d-md-block">
        <Link
          href="/tester/campaigns/ongoing"
          className="text-decoration-none small d-inline-flex align-items-center mb-3"
        >
          <i className="bi bi-chevron-left me-1"></i>
          Ongoing Campaigns
        </Link>

        {/* SINGLE DESKTOP CAMPAIGN CARD */}
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* CAMPAIGN HEADER */}
          <div className="p-2 p-sm-3">
            <div className="d-flex gap-2 gap-sm-3 align-items-center">
              {/* Product Image */}
              <div
                className="rounded overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "60px", height: "60px" }}
              >
                {campaign.productImage ? (
                  <img
                    src={campaign.productImage}
                    alt={campaign.productName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <i className="bi bi-image text-muted fs-4"></i>
                )}
              </div>

              {/* Campaign Information */}
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="small text-primary fw-semibold text-truncate">
                  {campaign.brandName ?? "Brand"}
                </div>
                <div className="fw-bold text-dark text-truncate">
                  {campaign.productName}
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2 mt-1 small">
                  <span>
                    <span className="text-muted">Earn:</span>{" "}
                    <strong className="text-success">
                      ₹{Number(campaignData.earningAmount).toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span className="text-muted">•</span>
                  <span>
                    <span className="text-muted">Tasks:</span>{" "}
                    <strong>{progress.totalTasks}</strong>
                  </span>
                  <span className="text-muted">•</span>
                  <span className={`fw-semibold ${getCampaignStatusClass(campaignData.campaignStatus)}`}>
                    {formatCampaignStatus(campaignData.campaignStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TASKS */}
          <div>
            {tasks.map((task) => {
              const status = getTaskStatusDisplay(task.status);
              const rejectionReason = task.rejectionReason || task.latestSubmission?.rejectionReason;
              const taskDescription =
                task.status === "REJECTED" && rejectionReason
                  ? `Reason: ${rejectionReason}`
                  : getTaskDescription(task.taskNumber);
              const taskUrl = `/tester/campaigns/ongoing/${testerCampaignId}/tasks/${task.taskNumber}`;
              const taskCanOpen = task.isCurrent && task.canSubmit;
              const taskHasSubmittedDetails =
                (task.status === "APPROVED" || task.status === "SUBMITTED") &&
                task.latestSubmission !== null;
              const taskDetailUrl = `${taskUrl}/submission`;
              const showBuyNow = task.taskNumber === 1 && Boolean(campaign.productLink);

              const taskContent = (
                <div className={`px-2 px-sm-3 py-3 border-top ${task.isCurrent ? "bg-primary bg-opacity-10" : "bg-white"}`}>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className={`d-flex align-items-center justify-content-center flex-shrink-0 ${getTaskIconClass(task.status)}`}
                      style={{ width: "28px", height: "28px", fontSize: "1.2rem" }}
                    >
                      <i className={`bi ${getTaskIcon(task.taskNumber)}`}></i>
                    </div>

                    <div className="fw-bold text-dark text-truncate flex-grow-1" style={{ minWidth: 0 }}>
                      Task {task.taskNumber} : {task.taskNumber === 4 ? "Publish Your Review" : task.title}
                    </div>

                    {showBuyNow && campaign.productLink && (
                      <a
                        href={campaign.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm d-inline-flex align-items-center justify-content-center text-nowrap flex-shrink-0 position-relative"
                        style={{ zIndex: 2, fontSize: "0.875rem", padding: "0.25rem 0.45rem", lineHeight: 1.2 }}
                      >
                        Buy Now
                      </a>
                    )}

                    {(taskCanOpen || taskHasSubmittedDetails) && (
                      <i className={`bi bi-chevron-right text-primary flex-shrink-0 ${showBuyNow ? "d-none d-sm-inline" : ""}`}></i>
                    )}
                  </div>

                  <div className={`small mt-2 text-truncate ${task.status === "REJECTED" ? "text-danger" : "text-dark"}`} title={taskDescription}>
                    <span className="me-1">→</span>
                    {taskDescription}
                  </div>

                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
                    <div className={`small fw-semibold d-inline-flex align-items-center ${status.textClass}`}>
                      <i className={`bi ${status.icon} me-1`}></i>
                      {status.label}
                    </div>

                    {campaignData.campaignStatus === "ONGOING" &&
                      task.isCurrent &&
                      task.canSubmit &&
                      (task.status === "AVAILABLE" || task.status === "REJECTED") &&
                      task.unlockedAt && (
                        <div className="small d-inline-flex align-items-center">
                          <i className="bi bi-clock me-1 text-warning"></i>
                          <span className="text-muted me-1">Time left:</span>
                          <strong className="text-dark">
                            {formatTaskTimeLeftCompact(task.unlockedAt, task.taskNumber, now)}
                          </strong>
                        </div>
                      )}
                  </div>
                </div>
              );

              if (showBuyNow) {
                return (
                  <div key={task.id} className="position-relative">
                    {taskContent}
                    {(taskCanOpen || taskHasSubmittedDetails) && (
                      <Link href={taskCanOpen ? taskUrl : taskDetailUrl} className="stretched-link" aria-label={`View Task ${task.taskNumber}`} />
                    )}
                  </div>
                );
              }

              if (taskCanOpen || taskHasSubmittedDetails) {
                return (
                  <Link key={task.id} href={taskCanOpen ? taskUrl : taskDetailUrl} className="text-decoration-none d-block">
                    {taskContent}
                  </Link>
                );
              }

              return <div key={task.id}>{taskContent}</div>;
            })}
          </div>

          {/* TASK COMPLETION PROGRESS */}
          <div className="border-top px-2 px-sm-3 py-3 bg-light">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
              <div className="small">
                <span className="text-muted">Task Completed:</span>{" "}
                <strong>{progress.approvedTasks}/{progress.totalTasks}</strong>
              </div>
              <strong className="small text-primary">{progress.percentage}%</strong>
            </div>
            <div className="progress" style={{ height: "5px" }}>
              <div className="progress-bar" role="progressbar" style={{ width: `${progress.percentage}%` }} aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>
        </div>

        {/* DESKTOP STATUS MESSAGES */}
        {campaignData.currentTask?.waitingForApproval && (
          <div className="alert alert-warning py-2 px-3 mt-3 mb-0 small">
            <i className="bi bi-hourglass-split me-2"></i>
            Task {campaignData.currentTask.taskNumber} is submitted and waiting for review.
          </div>
        )}

        {campaignData.currentTask?.status === "REJECTED" && (
          <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small">
            <i className="bi bi-exclamation-circle me-2"></i>
            <strong>Task {campaignData.currentTask.taskNumber} rejected.</strong>{" "}
            {campaignData.currentTask.rejectionReason || campaignData.currentTask.latestSubmission?.rejectionReason || "Please correct the submission and try again."}
          </div>
        )}
      </div>

    </>
  );
}

// ============================================================
// TASK TIMELINE
// ============================================================

const TASK_DURATION_DAYS:
  Record<
    number,
    number
  > = {
    1:
      2,

    2:
      5,

    3:
      3,

    4:
      5,
  };

// ============================================================
// COMPACT TIME LEFT
// ============================================================

function formatTaskTimeLeftCompact(
  unlockedAt:
    | string
    | null,
  taskNumber:
    number,
  now:
    Date
) {
  if (
    !unlockedAt
  ) {
    return "-";
  }

  const unlockedDate =
    new Date(
      unlockedAt
    );

  if (
    Number.isNaN(
      unlockedDate.getTime()
    )
  ) {
    return "-";
  }

  const deadlineDays =
    TASK_DURATION_DAYS[
      taskNumber
    ];

  if (
    !deadlineDays
  ) {
    return "-";
  }

  const deadline =
    new Date(
      unlockedDate.getTime() +
        deadlineDays *
          24 *
          60 *
          60 *
          1000
    );

  const remainingMs =
    deadline.getTime() -
    now.getTime();

  if (
    remainingMs <=
    0
  ) {
    return "0d 0h";
  }

  const totalHours =
    Math.ceil(
      remainingMs /
        (
          60 *
          60 *
          1000
        )
    );

  const days =
    Math.floor(
      totalHours /
        24
    );

  const hours =
    totalHours %
    24;

  return `${days}d ${hours}h`;
}

// ============================================================
// TASK DESCRIPTION
// ============================================================

function getTaskDescription(
  taskNumber:
    number
) {
  switch (
    taskNumber
  ) {
    case 1:
      return "Buy the product and submit your order details and purchase proof.";

    case 2:
      return "Upload a clear image after receiving the product.";

    case 3:
      return "Share your product review, rating and questionnaire feedback.";

    case 4:
      return "Publish the approved review and submit the review URL and proof.";

    default:
      return `Complete Task ${taskNumber} requirements.`;
  }
}

// ============================================================
// TASK ICON
// ============================================================

function getTaskIcon(
  taskNumber:
    number
) {
  switch (
    taskNumber
  ) {
    case 1:
      return "bi-bag-check";

    case 2:
      return "bi-box-seam";

    case 3:
      return "bi-pencil-square";

    case 4:
      return "bi-send-check";

    default:
      return "bi-clipboard-check";
  }
}

// ============================================================
// TASK ICON COLOR
// ============================================================

function getTaskIconClass(
  status:
    TaskStatus
) {
  switch (
    status
  ) {
    case "APPROVED":
      return "text-success";

    case "AVAILABLE":
      return "text-primary";

    case "SUBMITTED":
      return "text-warning";

    case "REJECTED":
      return "text-danger";

    case "LOCKED":
      return "text-secondary";

    default:
      return "text-secondary";
  }
}

// ============================================================
// TASK STATUS DISPLAY
// ============================================================

function getTaskStatusDisplay(
  status:
    TaskStatus
) {
  switch (
    status
  ) {
    case "APPROVED":
      return {
        label:
          "Completed",

        icon:
          "bi-check-circle-fill",

        textClass:
          "text-success",
      };

    case "AVAILABLE":
      return {
        label:
          "On going",

        icon:
          "bi-arrow-repeat",

        textClass:
          "text-primary",
      };

    case "SUBMITTED":
      return {
        label:
          "Pending Review",

        icon:
          "bi-hourglass-split",

        textClass:
          "text-warning",
      };

    case "REJECTED":
      return {
        label:
          "Resubmit",

        icon:
          "bi-exclamation-circle-fill",

        textClass:
          "text-danger",
      };

    case "LOCKED":
      return {
        label:
          "Pending",

        icon:
          "bi-lock-fill",

        textClass:
          "text-secondary",
      };

    default:
      return {
        label:
          status,

        icon:
          "bi-circle",

        textClass:
          "text-secondary",
      };
  }
}

// ============================================================
// CAMPAIGN STATUS
// ============================================================

function formatCampaignStatus(
  status:
    "ONGOING"
    | "COMPLETED"
    | "CANCELLED"
) {
  switch (
    status
  ) {
    case "ONGOING":
      return "Ongoing";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getCampaignStatusClass(
  status:
    "ONGOING"
    | "COMPLETED"
    | "CANCELLED"
) {
  switch (
    status
  ) {
    case "ONGOING":
      return "text-primary";

    case "COMPLETED":
      return "text-success";

    case "CANCELLED":
      return "text-danger";

    default:
      return "text-muted";
  }
}