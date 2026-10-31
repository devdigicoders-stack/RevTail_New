"use client";

import Link from "next/link";
import Task4ApprovalHistory from "@/components/tester/Task4ApprovalHistory";
import { useCallback, useEffect, useState } from "react";
import { OngoingCampaignsSkeleton } from "@/components/tester/TesterSkeletonLoader";

type TaskStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

type CampaignTask = {
  id: number;
  taskNumber: number;
  title: string;
  status: TaskStatus;
  unlockedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
};

type OngoingCampaign = {
  testerCampaignId: number;
  status: "ONGOING";
  currentTask: number;
  earningAmount: string | number;
  joinedAt: string;
  startedAt: string | null;
  campaign: {
    id: number;
    productName: string;
    productImage: string | null;
    productDescription: string | null;
    productLink: string | null;
    brandName: string | null;
    startDate: string;
    endDate: string;
    task4Required: boolean;
    availableSlots: number;
  };
  currentTaskData: CampaignTask | null;
  tasks: CampaignTask[];
  canCancel: boolean;
};

type OngoingCampaignResponse = {
  success: boolean;
  message: string;
  data?: {
    tester: {
      id: number;
      fullName: string;
    };
    totalCampaigns: number;
    campaigns: OngoingCampaign[];
  };
};

export default function OngoingCampaignsPage() {
  // ============================================================
  // STATE
  // ============================================================
  const [campaigns, setCampaigns] = useState<OngoingCampaign[]>([]);
  const [testerName, setTesterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // ============================================================
  // LOAD ONGOING CAMPAIGNS
  // ============================================================
  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tester/campaigns/ongoing", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as OngoingCampaignResponse;

      if (!response.ok) {
        throw new Error(result.message || "Unable to load ongoing campaigns.");
      }

      setCampaigns(result.data?.campaigns ?? []);
      setTesterName(result.data?.tester.fullName ?? "");
    } catch (err) {
      console.error("Ongoing campaigns error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load ongoing campaigns."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // ============================================================
  // CANCEL CAMPAIGN
  // ============================================================
  async function handleCancel(testerCampaignId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this campaign? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setCancellingId(testerCampaignId);
      setActionMessage("");
      setError("");

      const response = await fetch(
        `/api/tester/campaigns/ongoing/${testerCampaignId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel campaign.");
      }

      setActionMessage("Campaign cancelled successfully.");
      await loadCampaigns();
    } catch (err) {
      console.error("Cancel campaign error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to cancel campaign."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return <OngoingCampaignsSkeleton />;
  }

  return (
    <>
      {/* ======================================================
          1. NATIVE MOBILE APP HEADER (d-block d-md-none)
      ====================================================== */}
      <div className="col-12 d-block d-md-none tester-app-header-container mb-3">
        <div
          className="tester-mobile-live-header"
          style={{
            background: "linear-gradient(135deg, #001f54 0%, #002e7e 60%, #0284c7 100%)",
            padding: "1.75rem 1.25rem 1.25rem 1.25rem",
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            boxShadow: "0 8px 24px rgba(0, 46, 126, 0.22)",
            color: "#ffffff",
          }}
        >
          {/* Top Row: Back button, Page Title, Count Badge */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <Link
                href="/tester"
                className="btn btn-sm d-flex align-items-center justify-content-center text-white"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.18)",
                  backdropFilter: "blur(4px)",
                  padding: 0,
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <i className="bi bi-arrow-left fs-5"></i>
              </Link>
              <div>
                <h4
                  className="fw-bold mb-0 text-white"
                  style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                >
                  Ongoing Tasks
                </h4>
              </div>
            </div>

            <span
              className="badge rounded-pill text-white"
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                backdropFilter: "blur(4px)",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              {campaigns.length} Active
            </span>
          </div>

          {/* Sub-bar */}
          <div
            className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              fontSize: "11.5px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span>
              <i className="bi bi-play-circle-fill text-warning me-1"></i>
              Complete tasks to earn rewards
            </span>
            <span>
              <i className="bi bi-shield-check text-info me-1"></i>
              Tracked Live
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          2. DESKTOP PAGE HEADER (d-none d-md-block)
      ====================================================== */}
      <div className="col-12 d-none d-md-block mb-3">
        <div
          className="p-4 rounded-4 shadow-sm"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#002e7e",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="bi bi-hourglass-split"></i>
                </span>
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                  Ongoing Campaigns
                </h3>
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0284c7",
                    fontSize: "12px",
                    padding: "6px 12px",
                    fontWeight: 600,
                  }}
                >
                  {campaigns.length} Active
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                {testerName
                  ? `${testerName}, continue your active campaigns and complete your current tasks.`
                  : "Continue your active campaigns and complete your current tasks."}
              </p>
            </div>

            <Link
              href="/tester/campaigns/live"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              style={{
                backgroundColor: "#002e7e",
                borderColor: "#002e7e",
                fontSize: "13.5px",
              }}
            >
              <i className="bi bi-plus-circle"></i>
              <span>Join More Campaigns</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          3. NOTIFICATION MESSAGES
      ====================================================== */}
      {actionMessage && (
        <div className="col-12 mb-3">
          <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill text-success fs-5"></i>
            <span className="fw-medium">{actionMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="col-12 mb-3">
          <div className="alert alert-danger border-0 shadow-sm rounded-4 p-3 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
            <span className="fw-medium">{error}</span>
          </div>
        </div>
      )}

      {/* ======================================================
          4. EMPTY STATE (When no ongoing campaigns exist)
      ====================================================== */}
      {!error && campaigns.length === 0 && (
        <div className="col-12 py-5">
          <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-3">
            <div
              className="d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#f1f5f9",
                color: "#64748b",
                fontSize: "2rem",
              }}
            >
              <i className="bi bi-hourglass-split"></i>
            </div>
            <h5 className="fw-bold mb-1">No ongoing campaigns right now</h5>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Once your campaign application is approved, it will appear here so you can start tasks.
            </p>
            <div>
              <Link
                href="/tester/campaigns/live"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                style={{ backgroundColor: "#002e7e", borderColor: "#002e7e" }}
              >
                Browse Live Campaigns
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          5. DESKTOP VIEW (d-none d-md-block)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div className="col-12 d-none d-md-block mb-4">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th className="py-3 px-4 text-muted small fw-semibold text-uppercase">
                      Campaign Product
                    </th>
                    <th className="py-3 px-3 text-muted small fw-semibold text-uppercase">
                      Current Task
                    </th>
                    <th className="py-3 px-3 text-muted small fw-semibold text-uppercase" style={{ minWidth: "160px" }}>
                      Progress
                    </th>
                    <th className="py-3 px-3 text-muted small fw-semibold text-uppercase">
                      Reward
                    </th>
                    <th className="py-3 px-3 text-muted small fw-semibold text-uppercase">
                      Status
                    </th>
                    <th className="py-3 px-4 text-end text-muted small fw-semibold text-uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((testerCampaign) => {
                    const progress = calculateProgress(testerCampaign.tasks);
                    const currentTask = testerCampaign.currentTaskData;

                    return (
                      <tr
                        key={testerCampaign.testerCampaignId}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 overflow-hidden bg-white d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "64px",
                                height: "64px",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {testerCampaign.campaign.productImage ? (
                                <img
                                  src={testerCampaign.campaign.productImage}
                                  alt={testerCampaign.campaign.productName}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <i className="bi bi-image text-muted fs-4"></i>
                              )}
                            </div>

                            <div>
                              <div className="small fw-semibold text-primary">
                                {testerCampaign.campaign.brandName ?? "Brand"}
                              </div>
                              <div
                                className="fw-bold text-dark"
                                style={{
                                  fontSize: "14px",
                                  maxWidth: "260px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {testerCampaign.campaign.productName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Task */}
                        <td className="py-3 px-3">
                          {currentTask ? (
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>
                                Task {currentTask.taskNumber}: {currentTask.title}
                              </div>
                              {currentTask.taskNumber === 1 &&
                                testerCampaign.currentTask === 1 &&
                                testerCampaign.campaign.productLink && (
                                  <a
                                    href={testerCampaign.campaign.productLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-link p-0 text-primary small d-inline-flex align-items-center gap-1 mt-1"
                                    style={{ textDecoration: "none" }}
                                  >
                                    <span>Buy on Marketplace</span>
                                    <i className="bi bi-box-arrow-up-right" style={{ fontSize: "11px" }}></i>
                                  </a>
                                )}
                            </div>
                          ) : (
                            <span className="text-muted small">No active task</span>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="small text-muted">{progress.approved} of {progress.total} tasks</span>
                            <span className="small fw-bold text-dark">{progress.percentage}%</span>
                          </div>
                          <div
                            className="progress rounded-pill"
                            style={{ height: "6px", backgroundColor: "#e2e8f0" }}
                          >
                            <div
                              className="progress-bar rounded-pill"
                              style={{
                                width: `${progress.percentage}%`,
                                backgroundColor: progress.percentage === 100 ? "#16a34a" : "#002e7e",
                              }}
                            />
                          </div>
                        </td>

                        {/* Reward */}
                        <td className="py-3 px-3">
                          <strong className="text-success" style={{ fontSize: "15px" }}>
                            ₹{Number(testerCampaign.earningAmount).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {currentTask ? (
                            <span
                              className={`badge rounded-pill px-3 py-2 fw-semibold ${getTaskBadgeClass(
                                currentTask.status
                              )}`}
                              style={{ fontSize: "11px" }}
                            >
                              {currentTask.status}
                            </span>
                          ) : (
                            <span className="badge rounded-pill bg-secondary px-3 py-2">
                              UNKNOWN
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-end">
                          <div className="d-flex justify-content-end align-items-center gap-2">
                            <Link
                              href={`/tester/campaigns/ongoing/${testerCampaign.testerCampaignId}`}
                              className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: "#002e7e",
                                borderColor: "#002e7e",
                                fontSize: "12.5px",
                              }}
                            >
                              <span>{getActionText(currentTask?.status ?? null)}</span>
                              <i className="bi bi-arrow-right"></i>
                            </Link>

                            {testerCampaign.canCancel && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                                style={{ fontSize: "12.5px" }}
                                disabled={cancellingId === testerCampaign.testerCampaignId}
                                onClick={() => handleCancel(testerCampaign.testerCampaignId)}
                              >
                                {cancellingId === testerCampaign.testerCampaignId
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          6. MOBILE APP VIEW (d-block d-md-none)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div className="col-12 d-block d-md-none pb-5 mb-5">
          <div className="d-flex flex-column gap-3">
            {campaigns.map((testerCampaign) => {
              const currentTask = testerCampaign.currentTaskData;
              const progress = calculateProgress(testerCampaign.tasks);

              return (
                <div
                  key={testerCampaign.testerCampaignId}
                  className="card border-0 shadow-sm rounded-4 p-3"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {/* Top: Image + Info */}
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className="position-relative flex-shrink-0 overflow-hidden rounded-3 bg-light d-flex align-items-center justify-content-center"
                      style={{
                        width: "84px",
                        height: "84px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      {testerCampaign.campaign.productImage ? (
                        <img
                          src={testerCampaign.campaign.productImage}
                          alt={testerCampaign.campaign.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i className="bi bi-image fs-4 text-muted"></i>
                      )}
                    </div>

                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small text-muted fw-semibold text-truncate">
                          {testerCampaign.campaign.brandName ?? "Brand"}
                        </span>
                        {currentTask && (
                          <span
                            className={`badge rounded-pill ${getTaskBadgeClass(
                              currentTask.status
                            )}`}
                            style={{ fontSize: "10.5px", padding: "4px 8px" }}
                          >
                            {currentTask.status}
                          </span>
                        )}
                      </div>

                      <h6
                        className="fw-bold mb-1 text-dark"
                        style={{
                          fontSize: "13.5px",
                          lineHeight: "1.3",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {testerCampaign.campaign.productName}
                      </h6>

                      <div className="d-flex align-items-center justify-content-between pt-1">
                        <div>
                          <span className="text-muted" style={{ fontSize: "10px", display: "block" }}>
                            Assurred Reward
                          </span>
                          <strong className="text-success" style={{ fontSize: "14px" }}>
                            ₹{Number(testerCampaign.earningAmount).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div className="text-end">
                          <span className="text-muted" style={{ fontSize: "10px", display: "block" }}>
                            Current Stage
                          </span>
                          <span className="small text-dark fw-bold">
                            {currentTask ? `Task ${currentTask.taskNumber}` : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Task Detail Box */}
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="small text-muted fw-semibold">Current Step</span>
                      <strong className="small text-primary">
                        {currentTask ? `Task ${currentTask.taskNumber}` : "-"}
                      </strong>
                    </div>

                    {currentTask && (
                      <div className="small fw-semibold text-dark mb-1">
                        {currentTask.title}
                      </div>
                    )}

                    {currentTask?.taskNumber === 1 &&
                      testerCampaign.currentTask === 1 &&
                      testerCampaign.campaign.productLink && (
                        <a
                          href={testerCampaign.campaign.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3 d-inline-flex align-items-center gap-1 mt-2"
                          style={{ fontSize: "12px" }}
                        >
                          <span>Buy Product on Marketplace</span>
                          <i className="bi bi-box-arrow-up-right" style={{ fontSize: "10px" }}></i>
                        </a>
                      )}

                    {currentTask?.status === "REJECTED" && currentTask.rejectionReason && (
                      <div className="alert alert-danger py-2 px-3 mt-2 mb-0 small rounded-3 border-0">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {currentTask.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        Progress: {progress.approved} of {progress.total} tasks completed
                      </span>
                      <span className="fw-bold text-dark" style={{ fontSize: "11px" }}>
                        {progress.percentage}%
                      </span>
                    </div>
                    <div
                      className="progress rounded-pill"
                      style={{ height: "6px", backgroundColor: "#e2e8f0" }}
                    >
                      <div
                        className="progress-bar rounded-pill"
                        style={{
                          width: `${progress.percentage}%`,
                          backgroundColor: progress.percentage === 100 ? "#16a34a" : "#002e7e",
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="d-flex align-items-center gap-2">
                    <Link
                      href={`/tester/campaigns/ongoing/${testerCampaign.testerCampaignId}`}
                      className="btn btn-primary flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{
                        backgroundColor: "#002e7e",
                        borderColor: "#002e7e",
                        fontSize: "13px",
                      }}
                    >
                      <span>{getActionText(currentTask?.status ?? null)}</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>

                    {testerCampaign.canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline-danger rounded-pill px-3 py-2"
                        disabled={cancellingId === testerCampaign.testerCampaignId}
                        onClick={() => handleCancel(testerCampaign.testerCampaignId)}
                        title="Cancel Campaign"
                      >
                        {cancellingId === testerCampaign.testerCampaignId ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <i className="bi bi-x-lg"></i>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// PROGRESS
// ============================================================
function calculateProgress(tasks: CampaignTask[]) {
  const total = tasks.length;
  const approved = tasks.filter((task) => task.status === "APPROVED").length;
  const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;
  return { total, approved, percentage };
}

// ============================================================
// STATUS BADGE
// ============================================================
function getTaskBadgeClass(status: TaskStatus) {
  switch (status) {
    case "AVAILABLE":
      return "bg-primary text-white";
    case "SUBMITTED":
      return "bg-warning text-dark";
    case "APPROVED":
      return "bg-success text-white";
    case "REJECTED":
      return "bg-danger text-white";
    case "LOCKED":
      return "bg-secondary text-white";
    default:
      return "bg-secondary text-white";
  }
}

// ============================================================
// ACTION LABEL
// ============================================================
function getActionText(status: TaskStatus | null) {
  switch (status) {
    case "AVAILABLE":
      return "Start Task";
    case "REJECTED":
      return "Resubmit Task";
    case "SUBMITTED":
      return "View Submission";
    case "APPROVED":
      return "View Campaign";
    default:
      return "Open Campaign";
  }
}