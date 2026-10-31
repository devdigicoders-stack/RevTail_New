"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApplicationsSkeleton } from "@/components/tester/TesterSkeletonLoader";

type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type TesterCampaignStatus =
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

type CampaignApplication = {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  campaign: {
    id: number;
    productName: string;
    productImage: string | null;
    productDescription: string | null;
    earningAmount: number | string;
    startDate: string | null;
    endDate: string | null;
    availableSlots: number;
    task4Required: boolean;
    brandName: string | null;
  };
  testerCampaign: {
    id: number;
    status: TesterCampaignStatus;
    currentTask: number;
  } | null;
};

type ApplicationsResponse = {
  success: boolean;
  message: string;
  data?: {
    tester: {
      id: number;
      fullName: string;
    };
    totalApplications: number;
    applications: CampaignApplication[];
  };
};

export default function TesterCampaignApplicationsPage() {
  // ============================================================
  // STATE
  // ============================================================
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [testerName, setTesterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD APPLICATIONS
  // ============================================================
  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tester/campaigns/applications", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as ApplicationsResponse;

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load campaign applications."
          );
        }

        setApplications(result.data?.applications ?? []);
        setTesterName(result.data?.tester.fullName ?? "");
      } catch (err) {
        console.error("Campaign applications error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load campaign applications."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================
  const summary = useMemo(() => {
    const pending = applications.filter(
      (app) => app.status === "PENDING"
    ).length;

    const approved = applications.filter(
      (app) => app.status === "APPROVED"
    ).length;

    const rejected = applications.filter(
      (app) => app.status === "REJECTED"
    ).length;

    const assigned = applications.filter(
      (app) => app.testerCampaign !== null
    ).length;

    return {
      pending,
      approved,
      rejected,
      assigned,
    };
  }, [applications]);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return <ApplicationsSkeleton />;
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <div className="col-12">
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
            <div>
              <h6 className="fw-bold mb-1">Unable to load applications</h6>
              <div className="small text-danger text-opacity-75">{error}</div>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Link
            href="/tester/campaigns/live"
            className="btn btn-outline-primary rounded-pill px-4"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Browse Live Campaigns
          </Link>
        </div>
      </div>
    );
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
                  My Applications
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
              {applications.length} Total
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
              <i className="bi bi-clock-history text-warning me-1"></i>
              {summary.pending} Pending
            </span>
            <span>
              <i className="bi bi-check-circle-fill text-success me-1"></i>
              {summary.approved} Approved
            </span>
            <span>
              <i className="bi bi-patch-check-fill text-info me-1"></i>
              {summary.assigned} Assigned
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
                  <i className="bi bi-file-earmark-text-fill"></i>
                </span>
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                  Campaign Applications
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
                  {applications.length} Total
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                {testerName
                  ? `${testerName}, track your campaign application approvals and review statuses here.`
                  : "Track your campaign application approvals and review statuses here."}
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
              <span>Find Live Campaigns</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          3. KPI SUMMARY CARDS (Responsive: 4 cols Desktop, 2x2 Mobile)
      ====================================================== */}
      <div className="col-12 mb-3">
        <div className="row g-2 g-md-3">
          {/* Card 1: Total */}
          <div className="col-6 col-md-6 col-xl-3">
            <div
              className="tester-kpi-card border-0 shadow-sm rounded-4 h-100"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "1rem" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Total Applied</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "36px", height: "36px", background: "#eff6ff", color: "#002e7e" }}
                >
                  <i className="bi bi-send-check fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-dark">{applications.length}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>All applications</div>
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="col-6 col-md-6 col-xl-3">
            <div
              className="tester-kpi-card border-0 shadow-sm rounded-4 h-100"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "1rem" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Pending Review</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "36px", height: "36px", background: "#fffbeb", color: "#d97706" }}
                >
                  <i className="bi bi-clock-history fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-warning">{summary.pending}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>Awaiting brand review</div>
            </div>
          </div>

          {/* Card 3: Approved */}
          <div className="col-6 col-md-6 col-xl-3">
            <div
              className="tester-kpi-card border-0 shadow-sm rounded-4 h-100"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "1rem" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Approved</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "36px", height: "36px", background: "#f0fdf4", color: "#16a34a" }}
                >
                  <i className="bi bi-check-circle fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-success">{summary.approved}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>Ready to test</div>
            </div>
          </div>

          {/* Card 4: Assigned */}
          <div className="col-6 col-md-6 col-xl-3">
            <div
              className="tester-kpi-card border-0 shadow-sm rounded-4 h-100"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "1rem" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Assigned</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "36px", height: "36px", background: "#e0f2fe", color: "#0284c7" }}
                >
                  <i className="bi bi-megaphone fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-info">{summary.assigned}</h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>In active progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          4. EMPTY STATE (When no applications exist)
      ====================================================== */}
      {applications.length === 0 && (
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
              <i className="bi bi-send"></i>
            </div>
            <h5 className="fw-bold mb-1">No campaign applications yet</h5>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Browse live campaigns and apply to campaigns that match your profile interests.
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
          5. DESKTOP APPLICATIONS LIST (d-none d-md-block)
      ====================================================== */}
      {applications.length > 0 && (
        <div className="col-12 d-none d-md-block mb-4">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <div className="card-header bg-white border-bottom py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-dark">
                  Application Records ({applications.length})
                </h6>
                <span className="small text-muted">Latest applications shown first</span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="p-3 rounded-4"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <div className="row g-3 align-items-center">
                      {/* Product Image */}
                      <div className="col-auto">
                        <div
                          className="rounded-3 overflow-hidden bg-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "84px",
                            height: "84px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {application.campaign.productImage ? (
                            <img
                              src={application.campaign.productImage}
                              alt={application.campaign.productName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <i className="bi bi-image fs-3 text-muted"></i>
                          )}
                        </div>
                      </div>

                      {/* Campaign Info */}
                      <div className="col">
                        <div className="small fw-semibold text-primary mb-1">
                          {application.campaign.brandName ?? "Brand"}
                        </div>
                        <h6 className="fw-bold mb-2 text-dark">
                          {application.campaign.productName}
                        </h6>

                        <div className="d-flex flex-wrap align-items-center gap-3 small">
                          <div className="d-flex align-items-center gap-1">
                            <span className="text-muted">Reward:</span>
                            <strong className="text-success">
                              ₹{Number(application.campaign.earningAmount).toLocaleString("en-IN")}
                            </strong>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <span className="text-muted">Applied On:</span>
                            <strong>{formatDate(application.appliedAt)}</strong>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <span className="text-muted">Tasks:</span>
                            <strong>
                              {application.campaign.task4Required ? "4 Tasks" : "3 Tasks"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="col-12 col-lg-auto">
                        <div className="d-flex flex-column align-items-lg-end gap-2">
                          <span
                            className={`badge rounded-pill px-3 py-2 fw-semibold ${getApplicationBadgeClass(
                              application.status
                            )}`}
                            style={{ fontSize: "12px" }}
                          >
                            {getApplicationStatusLabel(application.status)}
                          </span>

                          {application.testerCampaign ? (
                            <AssignedCampaignAction
                              testerCampaign={application.testerCampaign}
                            />
                          ) : (
                            <Link
                              href={`/tester/campaigns/live/${application.campaign.id}`}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              style={{ fontSize: "13px" }}
                            >
                              View Campaign
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason Alert */}
                    {application.status === "REJECTED" && application.rejectionReason && (
                      <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small rounded-3 border-0">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        <strong>Rejection Reason:</strong> {application.rejectionReason}
                      </div>
                    )}

                    {/* Assigned Banner */}
                    {application.testerCampaign && (
                      <div
                        className="py-2 px-3 mt-3 mb-0 small rounded-3"
                        style={{ background: "#ecfdf5", color: "#065f46" }}
                      >
                        <i className="bi bi-check-circle-fill me-2 text-success"></i>
                        Campaign active in your dashboard.
                        {application.testerCampaign.status === "ONGOING" && (
                          <>
                            {" "}
                            Current Stage:{" "}
                            <strong>Task {application.testerCampaign.currentTask}</strong>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          6. MOBILE APPLICATIONS CARDS (d-block d-md-none)
      ====================================================== */}
      {applications.length > 0 && (
        <div
          className="col-12 d-block d-md-none"
          style={{ paddingBottom: "115px" }}
        >
          <div className="d-flex flex-column gap-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="tester-app-card border-0 shadow-sm rounded-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "1rem",
                  borderRadius: "18px",
                }}
              >
                {/* Top: Image + Info */}
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div
                    className="position-relative flex-shrink-0 overflow-hidden rounded-3 bg-light d-flex align-items-center justify-content-center"
                    style={{
                      width: "76px",
                      height: "76px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    {application.campaign.productImage ? (
                      <img
                        src={application.campaign.productImage}
                        alt={application.campaign.productName}
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
                    <div className="d-flex align-items-center justify-content-between mb-1.5">
                      <span className="small text-muted fw-semibold text-truncate" style={{ fontSize: "11.5px" }}>
                        {application.campaign.brandName ?? "Brand"}
                      </span>
                      <span
                        className={`badge rounded-pill fw-semibold ${getApplicationBadgeClass(
                          application.status
                        )}`}
                        style={{ fontSize: "10.5px", padding: "3.5px 9px" }}
                      >
                        {getApplicationStatusLabel(application.status)}
                      </span>
                    </div>

                    <h6
                      className="fw-bold mb-2 text-dark"
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.35",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {application.campaign.productName}
                    </h6>

                    <div className="d-flex align-items-center justify-content-between pt-1">
                      <div>
                        <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: "9.5px", letterSpacing: "0.04em", display: "block" }}>
                          Reward
                        </span>
                        <strong className="text-success fw-bold" style={{ fontSize: "16px" }}>
                          ₹{Number(application.campaign.earningAmount).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div className="text-end">
                        <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: "9.5px", letterSpacing: "0.04em", display: "block" }}>
                          Applied
                        </span>
                        <span className="small text-secondary fw-semibold">
                          {formatDate(application.appliedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Alert */}
                {application.status === "REJECTED" && application.rejectionReason && (
                  <div className="alert alert-danger py-2 px-3 mb-2.5 small rounded-3 border-0 d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-circle-fill text-danger fs-6"></i>
                    <span>{application.rejectionReason}</span>
                  </div>
                )}

                {/* Assigned Banner */}
                {application.testerCampaign && (
                  <div
                    className="py-2 px-3 mb-2.5 rounded-3 d-flex align-items-center gap-2"
                    style={{ background: "#ecfdf5", color: "#065f46", fontSize: "12px", border: "1px solid #d1fae5" }}
                  >
                    <i className="bi bi-patch-check-fill text-success fs-6"></i>
                    <span className="fw-medium">Campaign Assigned • Task {application.testerCampaign.currentTask}</span>
                  </div>
                )}

                {/* Action Button */}
                <div>
                  {application.testerCampaign ? (
                    <AssignedCampaignActionMobile
                      testerCampaign={application.testerCampaign}
                    />
                  ) : (
                    <Link
                      href={`/tester/campaigns/live/${application.campaign.id}`}
                      className="btn btn-outline-primary w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{ fontSize: "13.5px" }}
                    >
                      <span>View Campaign Details</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// ASSIGNED CAMPAIGN ACTION (Desktop)
// ============================================================
function AssignedCampaignAction({
  testerCampaign,
}: {
  testerCampaign: {
    id: number;
    status: TesterCampaignStatus;
    currentTask: number;
  };
}) {
  if (testerCampaign.status === "ONGOING") {
    return (
      <Link
        href={`/tester/campaigns/ongoing/${testerCampaign.id}`}
        className="btn btn-sm btn-primary rounded-pill px-3"
        style={{ backgroundColor: "#002e7e", borderColor: "#002e7e", fontSize: "13px" }}
      >
        <span>Open Campaign</span>
        <i className="bi bi-arrow-right ms-2"></i>
      </Link>
    );
  }

  if (testerCampaign.status === "COMPLETED") {
    return (
      <Link
        href={`/tester/campaigns/history/${testerCampaign.id}`}
        className="btn btn-sm btn-outline-success rounded-pill px-3"
        style={{ fontSize: "13px" }}
      >
        View Completed
      </Link>
    );
  }

  return (
    <span className="small text-muted">
      Campaign {testerCampaign.status}
    </span>
  );
}

// ============================================================
// ASSIGNED CAMPAIGN ACTION (Mobile)
// ============================================================
function AssignedCampaignActionMobile({
  testerCampaign,
}: {
  testerCampaign: {
    id: number;
    status: TesterCampaignStatus;
    currentTask: number;
  };
}) {
  if (testerCampaign.status === "ONGOING") {
    return (
      <Link
        href={`/tester/campaigns/ongoing/${testerCampaign.id}`}
        className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
        style={{
          backgroundColor: "#002e7e",
          borderColor: "#002e7e",
          fontSize: "13.5px",
          boxShadow: "0 2px 6px rgba(0, 46, 126, 0.22)",
        }}
      >
        <span>Continue Campaign</span>
        <i className="bi bi-arrow-right"></i>
      </Link>
    );
  }

  if (testerCampaign.status === "COMPLETED") {
    return (
      <Link
        href={`/tester/campaigns/history/${testerCampaign.id}`}
        className="btn btn-outline-success w-100 rounded-pill py-2.5 fw-semibold text-center shadow-sm"
        style={{ fontSize: "13.5px" }}
      >
        View Completed Campaign
      </Link>
    );
  }

  return (
    <div className="text-center small text-muted py-1">
      Campaign {testerCampaign.status}
    </div>
  );
}

// ============================================================
// APPLICATION BADGE
// ============================================================
function getApplicationBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-warning text-dark";
    case "APPROVED":
      return "bg-success text-white";
    case "REJECTED":
      return "bg-danger text-white";
    case "CANCELLED":
      return "bg-secondary text-white";
    default:
      return "bg-secondary text-white";
  }
}

// ============================================================
// APPLICATION STATUS LABEL
// ============================================================
function getApplicationStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return "Pending Review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

// ============================================================
// DATE FORMAT
// ============================================================
function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
