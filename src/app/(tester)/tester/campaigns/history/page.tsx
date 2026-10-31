"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HistorySkeleton } from "@/components/tester/TesterSkeletonLoader";

// ============================================================
// TYPES
// ============================================================
type CompletedTask = {
  id: number;
  taskNumber: number;
  status: string;
  approvedAt: string | null;
};

type CompletedCampaign = {
  testerCampaignId: number;
  status: string;
  earningAmount: string | number;
  joinedAt: string;
  completedAt: string | null;
  campaign: {
    id: number;
    productName: string;
    productImage: string | null;
    productDescription: string | null;
    brandName: string | null;
    task4Required: boolean;
  };
  tasks: CompletedTask[];
};

type CompletedCampaignsResponse = {
  success: boolean;
  message?: string;
  data?: {
    tester: {
      id: number;
      fullName: string;
    };
    totalCampaigns: number;
    totalEarnings: number;
    campaigns: CompletedCampaign[];
  };
};

export default function CompletedCampaignsPage() {
  // ============================================================
  // STATE
  // ============================================================
  const [campaigns, setCampaigns] = useState<CompletedCampaign[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [testerName, setTesterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD COMPLETED CAMPAIGNS
  // ============================================================
  useEffect(() => {
    async function loadCompletedCampaigns() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tester/campaigns/completed", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as CompletedCampaignsResponse;

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load completed campaigns."
          );
        }

        setCampaigns(result.data?.campaigns ?? []);
        setTotalEarnings(result.data?.totalEarnings ?? 0);
        setTotalCampaigns(result.data?.totalCampaigns ?? 0);
        setTesterName(result.data?.tester.fullName ?? "");
      } catch (err) {
        console.error("Completed campaigns error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load completed campaigns."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompletedCampaigns();
  }, []);

  // ============================================================
  // SUMMARY STATS
  // ============================================================
  const totalApprovedTasks = useMemo(() => {
    return campaigns.reduce((acc, campaign) => {
      const approved = campaign.tasks.filter(
        (task) => task.status === "APPROVED"
      ).length;
      return acc + approved;
    }, 0);
  }, [campaigns]);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return <HistorySkeleton />;
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
                  History
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
              {totalCampaigns} Completed
            </span>
          </div>

          {/* Quick Stats Bar */}
          <div
            className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              fontSize: "11.5px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span>
              <i className="bi bi-wallet2 text-warning me-1"></i>
              Earned: ₹{totalEarnings.toLocaleString("en-IN")}
            </span>
            <span>
              <i className="bi bi-check2-all text-success me-1"></i>
              {totalApprovedTasks} Approved Tasks
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
                  <i className="bi bi-trophy-fill"></i>
                </span>
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                  Completed Campaigns
                </h3>
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    fontSize: "12px",
                    padding: "6px 12px",
                    fontWeight: 600,
                  }}
                >
                  {totalCampaigns} Completed
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                {testerName
                  ? `${testerName}, here are your successfully completed campaigns and recorded earnings.`
                  : "Your successfully completed campaigns and recorded earnings."}
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
              <i className="bi bi-search"></i>
              <span>Explore More Campaigns</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          3. ERROR
      ====================================================== */}
      {error && (
        <div className="col-12 mb-3">
          <div className="alert alert-danger border-0 shadow-sm rounded-4 p-3 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
            <span className="fw-medium">{error}</span>
          </div>
        </div>
      )}

      {/* ======================================================
          4. SUMMARY STATS CARDS
      ====================================================== */}
      {!error && (
        <div className="col-12 mb-3">
          <div className="row g-2 g-md-3">
            <div className="col-4 col-md-4">
              <SummaryCard
                icon="bi-check-circle-fill"
                iconColor="#16a34a"
                iconBg="#f0fdf4"
                label="Completed"
                value={totalCampaigns.toString()}
              />
            </div>

            <div className="col-4 col-md-4">
              <SummaryCard
                icon="bi-check2-all"
                iconColor="#0284c7"
                iconBg="#e0f2fe"
                label="Tasks Done"
                value={totalApprovedTasks.toString()}
              />
            </div>

            <div className="col-4 col-md-4">
              <SummaryCard
                icon="bi-wallet2"
                iconColor="#d97706"
                iconBg="#fffbeb"
                label="Total Earned"
                value={`₹${totalEarnings.toLocaleString("en-IN")}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          5. EMPTY STATE
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
              <i className="bi bi-trophy"></i>
            </div>
            <h5 className="fw-bold mb-1">No completed campaigns yet</h5>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Campaigns will appear here after all required test tasks are approved.
            </p>
            <div>
              <Link
                href="/tester/campaigns/ongoing"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                style={{ backgroundColor: "#002e7e", borderColor: "#002e7e" }}
              >
                View Ongoing Campaigns
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          6. DESKTOP COMPLETED CARDS (d-none d-md-block)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div className="col-12 d-none d-md-block mb-4">
          <div className="row g-4">
            {campaigns.map((item) => {
              const approvedTasks = item.tasks.filter(
                (task) => task.status === "APPROVED"
              ).length;
              const totalTasks = item.tasks.length;
              const progressPercentage =
                totalTasks > 0
                  ? Math.round((approvedTasks / totalTasks) * 100)
                  : 0;

              return (
                <div key={item.testerCampaignId} className="col-xl-6">
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100 p-4"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Product Header */}
                    <div className="d-flex gap-3 align-items-start mb-3">
                      <div
                        className="rounded-3 overflow-hidden bg-light flex-shrink-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: "84px",
                          height: "84px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {item.campaign.productImage ? (
                          <img
                            src={item.campaign.productImage}
                            alt={item.campaign.productName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <i className="bi bi-image fs-2 text-muted"></i>
                        )}
                      </div>

                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="small text-primary fw-bold text-uppercase">
                            {item.campaign.brandName ?? "Brand"}
                          </span>
                          <span className="badge rounded-pill bg-success px-3 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                            <i className="bi bi-check-circle-fill me-1"></i>
                            COMPLETED
                          </span>
                        </div>

                        <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "15px" }}>
                          {item.campaign.productName}
                        </h5>

                        <div className="small text-muted">
                          Completed on {formatDate(item.completedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {item.campaign.productDescription && (
                      <p className="text-muted small mb-3" style={{ fontSize: "13px" }}>
                        {truncateText(item.campaign.productDescription, 120)}
                      </p>
                    )}

                    {/* Task Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Task Completion</small>
                        <strong className="small text-dark">
                          {approvedTasks}/{totalTasks} Approved
                        </strong>
                      </div>
                      <div
                        className="progress rounded-pill"
                        style={{ height: "6px", backgroundColor: "#e2e8f0" }}
                      >
                        <div
                          className="progress-bar rounded-pill bg-success"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Badges */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {item.tasks.map((task) => (
                        <span
                          key={task.id}
                          className={`badge rounded-pill px-2 py-1 ${
                            task.status === "APPROVED"
                              ? "bg-success text-white"
                              : "bg-secondary text-white"
                          }`}
                          style={{ fontSize: "11px" }}
                        >
                          <i
                            className={`bi ${
                              task.status === "APPROVED"
                                ? "bi-check-lg"
                                : "bi-circle"
                            } me-1`}
                          />
                          Task {task.taskNumber}
                        </span>
                      ))}
                    </div>

                    {/* Reward & Link */}
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: "11px" }}>
                          Earned Reward
                        </span>
                        <strong className="text-success fs-5">
                          ₹{Number(item.earningAmount).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <Link
                        href={`/tester/campaigns/history/${item.testerCampaignId}`}
                        className="btn btn-sm btn-outline-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "13px" }}
                      >
                        <span>View Details</span>
                        <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================
          7. MOBILE COMPLETED CARDS (d-block d-md-none)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div className="col-12 d-block d-md-none pb-5 mb-5">
          <div className="d-flex flex-column gap-3">
            {campaigns.map((item) => {
              const approvedTasks = item.tasks.filter(
                (task) => task.status === "APPROVED"
              ).length;
              const totalTasks = item.tasks.length;

              return (
                <div
                  key={item.testerCampaignId}
                  className="card border-0 shadow-sm rounded-4 p-3"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {/* Top: Image + Details */}
                  <div className="d-flex align-items-start gap-3 mb-2">
                    <div
                      className="position-relative flex-shrink-0 overflow-hidden rounded-3 bg-light d-flex align-items-center justify-content-center"
                      style={{
                        width: "80px",
                        height: "80px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      {item.campaign.productImage ? (
                        <img
                          src={item.campaign.productImage}
                          alt={item.campaign.productName}
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
                          {item.campaign.brandName ?? "Brand"}
                        </span>
                        <span
                          className="badge rounded-pill bg-success text-white"
                          style={{ fontSize: "10px", padding: "3px 8px" }}
                        >
                          Completed
                        </span>
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
                        {item.campaign.productName}
                      </h6>

                      <div className="d-flex align-items-center justify-content-between pt-1">
                        <div>
                          <span className="text-muted" style={{ fontSize: "10px", display: "block" }}>
                            Reward Earned
                          </span>
                          <strong className="text-success" style={{ fontSize: "14px" }}>
                            ₹{Number(item.earningAmount).toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div className="text-end">
                          <span className="text-muted" style={{ fontSize: "10px", display: "block" }}>
                            Tasks Approved
                          </span>
                          <span className="small text-dark fw-bold">
                            {approvedTasks}/{totalTasks}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Pills */}
                  <div className="d-flex flex-wrap gap-1 mb-3 pt-1">
                    {item.tasks.map((task) => (
                      <span
                        key={task.id}
                        className={`badge rounded-pill ${
                          task.status === "APPROVED"
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                        }`}
                        style={{ fontSize: "10px", padding: "3px 7px" }}
                      >
                        ✓ Task {task.taskNumber}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/tester/campaigns/history/${item.testerCampaignId}`}
                    className="btn btn-outline-primary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: "13px" }}
                  >
                    <span>View Campaign Details</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
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
// SUMMARY CARD
// ============================================================
function SummaryCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="card border-0 shadow-sm rounded-4 h-100 p-2 p-md-3"
      style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
    >
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "38px",
            height: "38px",
            background: iconBg,
            color: iconColor,
          }}
        >
          <i className={`bi ${icon} fs-6`} />
        </div>

        <div className="min-w-0">
          <small
            className="text-muted d-block text-truncate"
            style={{ fontSize: "11px" }}
          >
            {label}
          </small>
          <strong
            className="fw-bold text-dark text-truncate d-block"
            style={{ fontSize: "15px" }}
          >
            {value}
          </strong>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DATE
// ============================================================
function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// TRUNCATE
// ============================================================
function truncateText(value: string, maxLength: number) {
  const text = value.trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}