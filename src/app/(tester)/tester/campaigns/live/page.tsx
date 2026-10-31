"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiveCampaignsSkeleton } from "@/components/tester/TesterSkeletonLoader";

type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type LiveCampaign = {
  id: number;
  productName: string;
  productImage: string | null;
  productDescription: string | null;
  productLink: string | null;
  marketplace?: string | null;
  earningAmount: number | string;
  totalSlots: number;
  filledSlots: number;
  availableSlots: number;
  startDate: string;
  endDate: string;
  task4Required: boolean;
  brand: {
    id: number | null;
    companyName: string | null;
    categoryId: number | null;
    category: {
      id: number;
      name: string;
    } | null;
  };
  application: {
    id: number;
    status: ApplicationStatus;
    appliedAt: string;
  } | null;
  canApply: boolean;
};

type LiveCampaignResponse = {
  success: boolean;
  message: string;
  data?: {
    tester: {
      id: number;
      fullName: string;
      city: string | null;
      state: string | null;
      interestIds: number[];
    };
    totalCampaigns: number;
    campaigns: LiveCampaign[];
  };
};

export default function LiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState<LiveCampaign[]>([]);
  const [testerLocation, setTesterLocation] = useState<{
    city: string | null;
    state: string | null;
  }>({
    city: null,
    state: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stripHtml = (html: string | null) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  };

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tester/campaigns/live", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as LiveCampaignResponse;

        if (!response.ok) {
          throw new Error(result.message || "Unable to load live campaigns.");
        }

        const testerInterestIds = result.data?.tester.interestIds ?? [];

        const interestMatchedCampaigns = (result.data?.campaigns ?? []).filter(
          (campaign) =>
            campaign.brand.categoryId !== null &&
            testerInterestIds.includes(campaign.brand.categoryId)
        );

        setCampaigns(interestMatchedCampaigns);

        setTesterLocation({
          city: result.data?.tester.city ?? null,
          state: result.data?.tester.state ?? null,
        });
      } catch (err) {
        console.error("Live campaigns error:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load live campaigns."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return <LiveCampaignsSkeleton />;
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
              <h6 className="fw-bold mb-1">Unable to load campaigns</h6>
              <div className="small text-danger text-opacity-75">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ======================================================
          1. NATIVE MOBILE APP HEADER (Phones Only: d-block d-md-none)
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
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                aria-label="Back to Dashboard"
              >
                <i className="bi bi-arrow-left fs-5"></i>
              </Link>
              <div>
                <h4
                  className="fw-bold mb-0 text-white"
                  style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                >
                  Live Campaigns
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

          {/* Location & Status Bar */}
          <div
            className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              fontSize: "11.5px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span>
              <i className="bi bi-geo-alt-fill text-warning me-1"></i>
              {testerLocation.city
                ? `${testerLocation.city}, ${testerLocation.state}`
                : "Eligible for your location"}
            </span>
            <span>
              <i className="bi bi-patch-check-fill text-info me-1"></i>
              Verified Tasks
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          2. DESKTOP PAGE HEADER (Desktops Only: d-none d-md-block)
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
                  <i className="bi bi-megaphone-fill"></i>
                </span>
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                  Live Campaigns
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
                  {campaigns.length} Available
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Browse verified products, submit test feedback & reviews, and earn assured rewards directly to your wallet!
              </p>
            </div>

            {testerLocation.city && testerLocation.state && (
              <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              >
                <i className="bi bi-geo-alt-fill text-danger fs-6"></i>
                <span className="text-muted">Targeting:</span>
                <strong className="text-dark">
                  {testerLocation.city}, {testerLocation.state}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          3. EMPTY STATE (When no campaigns exist)
      ====================================================== */}
      {campaigns.length === 0 && (
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
              <i className="bi bi-inbox"></i>
            </div>
            <h5 className="fw-bold mb-1">No live campaigns right now</h5>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              New campaigns matching your profile will appear here soon!
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          4. DESKTOP CARDS GRID (d-none d-md-block)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div className="col-12 d-none d-md-block mb-4">
          <div className="row g-4">
            {campaigns.map((campaign) => {
              const isApplied = Boolean(campaign.application);
              const isAmazon = campaign.marketplace?.toLowerCase().includes("amazon");
              const isFlipkart = campaign.marketplace?.toLowerCase().includes("flipkart");

              return (
                <div key={campaign.id} className="col-md-6 col-xl-4">
                  <div
                    className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative"
                    style={{
                      transition: "all 0.25s ease-in-out",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 46, 126, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                    }}
                  >
                    {/* Top Image Container */}
                    <div
                      className="position-relative overflow-hidden"
                      style={{
                        height: "210px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      {campaign.productImage ? (
                        <img
                          src={campaign.productImage}
                          alt={campaign.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                          <i className="bi bi-image fs-1"></i>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="position-absolute top-0 start-0 w-100 p-3 d-flex align-items-center justify-content-between">
                        {campaign.marketplace && (
                          <span
                            className="badge rounded-pill fw-semibold shadow-sm"
                            style={{
                              backgroundColor: isAmazon
                                ? "#232f3e"
                                : isFlipkart
                                ? "#2874f0"
                                : "#002e7e",
                              color: "#ffffff",
                              fontSize: "11px",
                              padding: "6px 12px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            <i className="bi bi-cart3 me-1"></i>
                            {campaign.marketplace}
                          </span>
                        )}

                        <span
                          className="badge rounded-pill text-white fw-semibold shadow-sm"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.65)",
                            backdropFilter: "blur(4px)",
                            fontSize: "11px",
                            padding: "6px 10px",
                          }}
                        >
                          <i className="bi bi-list-check me-1"></i>
                          {campaign.task4Required ? "4 Tasks" : "3 Tasks"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body p-4 d-flex flex-column">
                      {/* Brand & Category */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span
                          className="text-uppercase fw-bold text-primary"
                          style={{ fontSize: "11px", letterSpacing: "0.05em" }}
                        >
                          {campaign.brand?.companyName ?? "Brand"}
                        </span>
                        {campaign.brand?.category?.name && (
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            {campaign.brand.category.name}
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <h5
                        className="fw-bold mb-2 text-dark"
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.35",
                          height: "2.7em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={campaign.productName}
                      >
                        {campaign.productName}
                      </h5>

                      {/* Description Preview */}
                      <p
                        className="text-muted mb-3 flex-grow-1"
                        style={{
                          fontSize: "12.5px",
                          lineHeight: "1.4",
                          height: "2.8em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {stripHtml(campaign.productDescription) || "Test this product and share your verified review."}
                      </p>

                      {/* Earning & Slots Row */}
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-between mb-3"
                        style={{ backgroundColor: "#f8fafc", border: "1px solid #edf2f7" }}
                      >
                        <div>
                          <div className="text-muted" style={{ fontSize: "11px", fontWeight: 600 }}>
                            You Earn
                          </div>
                          <div className="fw-bold text-success" style={{ fontSize: "1.25rem", lineHeight: 1.1 }}>
                            ₹{Number(campaign.earningAmount).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="text-muted" style={{ fontSize: "11px", fontWeight: 600 }}>
                            Available Slots
                          </div>
                          <div className="fw-bold text-dark" style={{ fontSize: "1.1rem", lineHeight: 1.1 }}>
                            <span style={{ color: "#002e7e" }}>{campaign.availableSlots}</span>
                            <span className="text-muted fw-normal" style={{ fontSize: "11px" }}>
                              /{campaign.totalSlots}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {campaign.canApply ? (
                          <Link
                            href={`/tester/campaigns/live/${campaign.id}`}
                            className="btn btn-primary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            style={{
                              backgroundColor: "#002e7e",
                              borderColor: "#002e7e",
                              fontSize: "13.5px",
                            }}
                          >
                            <span>View & Apply</span>
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <Link
                              href={`/tester/campaigns/live/${campaign.id}`}
                              className="btn btn-outline-primary rounded-pill flex-grow-1 py-2 fw-semibold"
                              style={{ fontSize: "13px" }}
                            >
                              View Details
                            </Link>
                            {isApplied && campaign.application && (
                              <span
                                className={`badge rounded-pill px-3 py-2 ${
                                  campaign.application.status === "APPROVED"
                                    ? "bg-success text-white"
                                    : campaign.application.status === "REJECTED"
                                    ? "bg-danger text-white"
                                    : "bg-warning text-dark"
                                }`}
                                style={{ fontSize: "11px", fontWeight: 600 }}
                              >
                                {campaign.application.status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================
          5. MOBILE APP CARDS (d-block d-md-none)
      ====================================================== */}
      {campaigns.length > 0 && (
        <div
          className="col-12 d-block d-md-none"
          style={{ paddingBottom: "115px" }}
        >
          <div className="d-flex flex-column gap-3">
            {campaigns.map((campaign) => {
              const isApplied = Boolean(campaign.application);
              const isAmazon = campaign.marketplace?.toLowerCase().includes("amazon");
              const isFlipkart = campaign.marketplace?.toLowerCase().includes("flipkart");

              return (
                <Link
                  key={campaign.id}
                  href={`/tester/campaigns/live/${campaign.id}`}
                  className="tester-campaign-mobile-card text-decoration-none text-dark"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "1rem",
                  }}
                >
                  {/* Top Row: Product Image + Info */}
                  <div className="d-flex align-items-start" style={{ gap: "14px" }}>
                    {/* Square Product Image */}
                    <div
                      className="position-relative flex-shrink-0 overflow-hidden rounded-3"
                      style={{
                        width: "76px",
                        height: "76px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      {campaign.productImage ? (
                        <img
                          src={campaign.productImage}
                          alt={campaign.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                          <i className="bi bi-image fs-4"></i>
                        </div>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-grow-1 min-w-0">
                      {/* Marketplace & Slots Left */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        {isAmazon ? (
                          <span
                            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "#fff7ed",
                              color: "#c2410c",
                              border: "1px solid #ffedd5",
                              fontSize: "10px",
                              padding: "3px 8px",
                            }}
                          >
                            <i className="bi bi-cart3 me-1" style={{ fontSize: "10px" }}></i>
                            {campaign.marketplace || "Amazon"}
                          </span>
                        ) : isFlipkart ? (
                          <span
                            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #dbeafe",
                              fontSize: "10px",
                              padding: "3px 8px",
                            }}
                          >
                            <i className="bi bi-bag me-1" style={{ fontSize: "10px" }}></i>
                            {campaign.marketplace || "Flipkart"}
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #e2e8f0",
                              fontSize: "10px",
                              padding: "3px 8px",
                            }}
                          >
                            <i className="bi bi-globe me-1 text-primary" style={{ fontSize: "10px" }}></i>
                            {campaign.marketplace || "Online"}
                          </span>
                        )}

                        <span
                          className="badge rounded-pill fw-semibold d-inline-flex align-items-center"
                          style={{
                            fontSize: "10px",
                            padding: "3px 8px",
                            backgroundColor: campaign.availableSlots <= 10 ? "#fef2f2" : "#f8fafc",
                            color: campaign.availableSlots <= 10 ? "#dc2626" : "#475569",
                            border: campaign.availableSlots <= 10 ? "1px solid #fee2e2" : "1px solid #e2e8f0",
                          }}
                        >
                          <i
                            className={`bi ${
                              campaign.availableSlots <= 10
                                ? "bi-fire text-danger"
                                : "bi-people text-secondary"
                            } me-1`}
                            style={{ fontSize: "10px" }}
                          ></i>
                          {campaign.availableSlots} Slots Left
                        </span>
                      </div>

                      {/* Product Title */}
                      <h6
                        className="fw-bold mb-1.5 text-dark"
                        style={{
                          fontSize: "13.5px",
                          lineHeight: "1.35",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          letterSpacing: "-0.01em",
                        }}
                        title={campaign.productName}
                      >
                        {campaign.productName}
                      </h6>

                      {/* Brand Name */}
                      <div
                        className="text-muted text-truncate d-flex align-items-center"
                        style={{ fontSize: "11.5px", gap: "4px" }}
                      >
                        <i className="bi bi-shop text-muted" style={{ fontSize: "10px" }}></i>
                        <span>
                          by <strong className="text-secondary fw-semibold">{campaign.brand?.companyName ?? "Brand"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spacious Bottom Footer Row */}
                  <div
                    className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top"
                    style={{ borderColor: "#f1f5f9" }}
                  >
                    <div>
                      <span
                        className="text-muted fw-semibold text-uppercase"
                        style={{
                          fontSize: "9.5px",
                          letterSpacing: "0.04em",
                          display: "block",
                          lineHeight: 1,
                        }}
                      >
                        You Earn
                      </span>
                      <span
                        className="fw-bold text-success"
                        style={{
                          fontSize: "18px",
                          lineHeight: 1.2,
                          display: "block",
                          marginTop: "3px",
                        }}
                      >
                        ₹{Number(campaign.earningAmount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      {isApplied && campaign.application ? (
                        <span
                          className={`badge rounded-pill px-3 py-1.5 fw-semibold ${
                            campaign.application.status === "APPROVED"
                              ? "bg-success text-white"
                              : campaign.application.status === "REJECTED"
                              ? "bg-danger text-white"
                              : "bg-warning text-dark"
                          }`}
                          style={{ fontSize: "11px" }}
                        >
                          <i className="bi bi-clock-history me-1"></i>
                          {campaign.application.status === "PENDING"
                            ? "Under Review"
                            : campaign.application.status}
                        </span>
                      ) : campaign.availableSlots <= 0 ? (
                        <span
                          className="badge rounded-pill bg-secondary text-white px-3 py-1.5 fw-semibold"
                          style={{ fontSize: "11px" }}
                        >
                          Slots Full
                        </span>
                      ) : (
                        <span
                          className="btn btn-sm text-white rounded-pill fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{
                            fontSize: "12.5px",
                            backgroundColor: "#002e7e",
                            borderColor: "#002e7e",
                            boxShadow: "0 2px 6px rgba(0, 46, 126, 0.22)",
                            padding: "6px 18px",
                          }}
                        >
                          <span>Apply</span>
                          <i className="bi bi-chevron-right" style={{ fontSize: "10px" }}></i>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}