import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma, TargetGender } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import TesterInvitationWidget from "@/components/tester/TesterInvitationWidget";


type TesterDashboardPageProps = {
  searchParams?: Promise<{
    mobilePage?: string | string[];
  }>;
};

const MOBILE_CAMPAIGNS_PER_PAGE = 50;

export default async function TesterDashboardPage({
  searchParams,
}: TesterDashboardPageProps) {
  const params = await searchParams;
  const rawMobilePage = Array.isArray(params?.mobilePage)
    ? params.mobilePage[0]
    : params?.mobilePage;
  const requestedMobilePage = Number(rawMobilePage ?? "1");
  const mobilePage =
    Number.isSafeInteger(requestedMobilePage) && requestedMobilePage > 0
      ? Math.min(requestedMobilePage, 10000)
      : 1;

  // ============================================================
  // 1. GET CURRENT USER
  // ============================================================

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "TESTER") {
    redirect("/");
  }

  // ============================================================
  // 2. GET TESTER PROFILE
  // ============================================================

  const testerProfile =
    await prisma.testerProfile.findUnique({
      where: {
        userId: currentUser.userId,
      },

      select: {
        id: true,
        fullName: true,
        gender: true,
        state: true,
        city: true,
        approvalStatus: true,

        profileImage: true,
        instagramId: true,

        interests: {
          select: {
            interestId: true,
          },
        },

        bankDetails: {
          select: {
            id: true,
          },
        },

        user: {
          select: {
            email: true,
          },
        },
      },
    });

  if (!testerProfile) {
    redirect("/login");
  }

  // ============================================================
  // 3. PROFILE COMPLETION
  // ============================================================

  /*
   * Signup already contains:
   *
   * fullName
   * mobile
   * gender
   * ageCategory
   * pinCode
   * city
   * state
   *
   * Remaining profile fields:
   *
   * email
   * profile image
   * Instagram ID
   * interests
   * bank details
   */

  const profileChecks = [
    Boolean(
      testerProfile.user?.email?.trim()
    ),

    Boolean(
      testerProfile.profileImage?.trim()
    ),

    Boolean(
      testerProfile.instagramId?.trim()
    ),

    Boolean(
      testerProfile.interests &&
        testerProfile.interests.length >= 5
    ),

    Boolean(
      testerProfile.bankDetails
    ),
  ];

  const completedFields =
    profileChecks.filter(Boolean).length;

  const totalRequiredFields =
    profileChecks.length;

  const profileCompletionPercentage =
    totalRequiredFields > 0
      ? Math.round(
          (completedFields /
            totalRequiredFields) *
            100
        )
      : 0;

  const isProfileComplete =
    completedFields ===
    totalRequiredFields;

  const now = new Date();

  // ============================================================
  // 4. LIVE / ELIGIBLE CAMPAIGN COUNT
  // ============================================================

  const testerInterestIds = testerProfile.interests.map(
    (item) => item.interestId
  );

  const canCountLiveCampaigns =
    testerProfile.approvalStatus === "APPROVED" &&
    Boolean(testerProfile.state) &&
    Boolean(testerProfile.city) &&
    testerInterestIds.length > 0;

  // Run independent dashboard queries concurrently to reduce server wait time.
  // Keep the same eligibility rules, campaign statuses, and wallet calculation.
  // Reuse the exact same eligibility filter for the count and mobile list.
  const liveCampaignWhere: Prisma.CampaignWhereInput = {
    status: "LIVE",
    availableSlots: { gt: 0 },
    startDate: { lte: now },
    endDate: { gte: now },
    brand: {
      categoryId: { in: testerInterestIds },
    },
    AND: [
      {
        OR: [
          { targetState: "any" },
          { targetState: testerProfile.state! },
        ],
      },
      {
        OR: [
          { targetCity: "any" },
          { targetCity: testerProfile.city! },
        ],
      },
      {
        OR: [
          { targetGender: "ANY" },
          { targetGender: testerProfile.gender as TargetGender },
        ],
      },
    ],
  };

  const liveCampaignCountPromise = canCountLiveCampaigns
    ? prisma.campaign.count({ where: liveCampaignWhere })
    : Promise.resolve(0);

  // Only load the four campaigns needed for the requested mobile page.
  // The other dashboard queries continue running concurrently.
  const mobileLiveCampaignsPromise = canCountLiveCampaigns
    ? prisma.campaign.findMany({
        where: liveCampaignWhere,
        select: {
          id: true,
          productName: true,
          productImage: true,
          earningAmount: true,
          totalSlots: true,
          filledSlots: true,
          availableSlots: true,
          task4Required: true,
          brand: {
            select: { companyName: true },
          },
        },
        orderBy: [{ startDate: "desc" }, { id: "desc" }],
        skip: (mobilePage - 1) * MOBILE_CAMPAIGNS_PER_PAGE,
        take: MOBILE_CAMPAIGNS_PER_PAGE,
      })
    : Promise.resolve([]);

  // ============================================================
  // 5-9. APPLICATIONS, ONGOING, COMPLETED, WALLET, CURRENT TASKS
  // ============================================================

  const [
    liveCampaignCount,
    applicationCount,
    ongoingCampaignCount,
    completedCampaignCount,
    completedEarnings,
    ongoingCampaigns,
    mobileLiveCampaigns,
  ] = await Promise.all([
    liveCampaignCountPromise,

    prisma.campaignApplication.count({
      where: { testerProfileId: testerProfile.id },
    }),

    prisma.testerCampaign.count({
      where: {
        testerProfileId: testerProfile.id,
        status: "ONGOING",
      },
    }),

    prisma.testerCampaign.count({
      where: {
        testerProfileId: testerProfile.id,
        status: "COMPLETED",
      },
    }),

    // Same total as summing earningAmount from COMPLETED campaigns,
    // but the database returns only the sum instead of every row.
    prisma.testerCampaign.aggregate({
      where: {
        testerProfileId: testerProfile.id,
        status: "COMPLETED",
      },
      _sum: { earningAmount: true },
    }),

    prisma.testerCampaign.findMany({
      where: {
        testerProfileId: testerProfile.id,
        status: "ONGOING",
      },
      select: {
        id: true,
        currentTask: true,
        earningAmount: true,
        joinedAt: true,
        campaign: {
          select: {
            id: true,
            productName: true,
            productImage: true,
            brand: {
              select: { companyName: true },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            taskNumber: true,
            status: true,
            rejectionReason: true,
          },
          orderBy: { taskNumber: "asc" },
        },
      },
      orderBy: { joinedAt: "desc" },
      take: 5,
    }),

    mobileLiveCampaignsPromise,
  ]);

  // Application statuses for the four visible mobile campaigns only.
  // Does not alter eligibility, campaign pagination or desktop data.
  const mobileCampaignApplications =
    mobileLiveCampaigns.length > 0
      ? await prisma.campaignApplication.findMany({
          where: {
            testerProfileId: testerProfile.id,
            campaignId: {
              in: mobileLiveCampaigns.map((campaign) => campaign.id),
            },
          },
          select: {
            campaignId: true,
            status: true,
          },
        })
      : [];

  const mobileApplicationStatusByCampaignId = new Map(
    mobileCampaignApplications.map((application) => [
      application.campaignId,
      application.status,
    ])
  );

  const totalMobilePages = Math.max(
    1,
    Math.ceil(liveCampaignCount / MOBILE_CAMPAIGNS_PER_PAGE)
  );

  // Prevent stale/invalid page links from displaying an empty page.
  if (mobilePage > totalMobilePages) {
    redirect(
      totalMobilePages === 1
        ? "/tester"
        : `/tester?mobilePage=${totalMobilePages}`
    );
  }

  // Preserve the existing dashboard's completed-campaign earnings meaning.
  const walletBalance = Number(completedEarnings._sum.earningAmount ?? 0);

  // ============================================================
  // 10. HELPERS
  // ============================================================

  function getTaskName(
    taskNumber: number
  ) {
    switch (taskNumber) {
      case 1:
        return "Buy Product";

      case 2:
        return "Product Received";

      case 3:
        return "Write Review & Rating";

      case 4:
        return "Copy/Paste Review";

      default:
        return `Task ${taskNumber}`;
    }
  }

  function getTaskBadgeClass(
    status: string
  ) {
    switch (status) {
      case "AVAILABLE":
        return "bg-primary-subtle text-primary border border-primary-subtle";

      case "SUBMITTED":
        return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";

      case "APPROVED":
        return "bg-success-subtle text-success border border-success-subtle";

      case "REJECTED":
        return "bg-danger-subtle text-danger border border-danger-subtle";

      case "LOCKED":
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";

      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  }

  // ============================================================
  // 11. UI
  // ============================================================

  const testerFirstName = testerProfile.fullName.trim().split(" ")[0] || "Tester";

  return (
    <>
      <style>{`
        .tester-stat-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
        }
        .tester-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06) !important;
        }

        /* Main Section Cards */
        .tester-main-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          padding: 0 !important;
        }
        .tester-main-card .card-header {
          padding: 1rem 1.25rem 0.5rem 1.25rem !important;
          margin-bottom: 0 !important;
          background: transparent !important;
        }
        .tester-main-card .card-body {
          padding: 0.5rem 1.25rem 1.25rem 1.25rem !important;
        }

        /* Product Cards */
        .tester-product-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          padding: 0.85rem 1rem;
          gap: 0.85rem;
        }
        .tester-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07) !important;
          border-color: #cbd5e1;
        }
        .tester-product-img-box {
          width: 76px;
          height: 76px;
        }
        .tester-product-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        /* Ongoing Task Card Item */
        .tester-ongoing-item {
          padding: 0.85rem 1rem;
          margin-bottom: 0.65rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .tester-ongoing-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        /* Mobile Adjustments: Eliminate excess whitespace & gaps */
        @media (max-width: 767.98px) {
          .tester-main-card {
            border-radius: 14px !important;
            margin-bottom: 0.75rem !important;
            padding: 0 !important;
            border-color: #e2e8f0 !important;
          }
          .tester-main-card .card-header {
            padding: 0.65rem 0.75rem 0.25rem 0.75rem !important;
            margin-bottom: 0 !important;
          }
          .tester-main-card .card-body {
            padding: 0.25rem 0.5rem 0.55rem 0.5rem !important;
          }
          .tester-product-card {
            padding: 0.6rem 0.7rem !important;
            gap: 0.7rem !important;
            border-radius: 12px !important;
          }
          .tester-product-img-box {
            width: 66px !important;
            height: 66px !important;
          }
          .tester-product-title {
            font-size: 12.5px !important;
            line-height: 1.3 !important;
          }
          .tester-ongoing-item {
            padding: 0.65rem 0.75rem !important;
            margin-bottom: 0.5rem !important;
            border-radius: 12px !important;
            border-color: #e2e8f0 !important;
          }
        }
      `}</style>

      {/* ======================================================
          NATIVE MOBILE APP HEADER (Phones Only)
      ====================================================== */}
      <div className="col-12 d-block d-md-none tester-app-header-container">
        <div
          className="tester-app-header"
          style={{
            background: "linear-gradient(180deg, #001f54 0%, #002e7e 100%)",
            paddingTop: "1.1rem",
            paddingBottom: "0.85rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            boxShadow: "0 10px 25px rgba(0, 46, 126, 0.18)",
            width: "100%",
          }}
        >
          {/* Top Row: User Avatar & WhatsApp Community */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <button
              type="button"
              id="sidebar-toggle"
              className="tester-app-avatar-btn border-0 p-0 bg-transparent d-flex align-items-center gap-2"
              aria-label="Open Menu"
            >
              {testerProfile.profileImage ? (
                <img
                  src={testerProfile.profileImage}
                  alt={testerProfile.fullName}
                  className="rounded-circle object-fit-cover"
                  style={{ width: "38px", height: "38px", border: "2px solid rgba(255, 255, 255, 0.8)" }}
                />
              ) : (
                <div
                  className="tester-app-avatar-initial"
                  style={{ width: "38px", height: "38px", fontSize: "16px" }}
                >
                  {testerFirstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-start">
                <div className="text-white fw-bold" style={{ fontSize: "13.5px", lineHeight: "1.2" }}>
                  {testerProfile.fullName}
                </div>
                <div className="text-white-50" style={{ fontSize: "11px" }}>
                  Verified Tester
                </div>
              </div>
            </button>

            {/* WhatsApp Community Link (Replaces Search Button) */}
            <a
              href="https://chat.whatsapp.com/JLDLEwZWJTPJKhPl5XzWQD"
              target="_blank"
              rel="noopener noreferrer"
              className="d-flex align-items-center gap-1.5 text-white text-decoration-none shadow-sm"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
              title="Join WhatsApp Community"
            >
              <i className="bi bi-whatsapp fs-6"></i>
              <span>Community</span>
            </a>
          </div>

          {/* Horizontal Scrollable Filter Pills */}
          <div className="tester-app-filter-scroll mt-2">
            <span className="tester-app-filter-pill active">
              Trending
            </span>
            <Link href="/tester/campaigns/ongoing" className="tester-app-filter-pill">
              Ongoing
            </Link>
            <Link href="/tester/campaigns/history" className="tester-app-filter-pill">
              History
            </Link>
            <Link href="/tester/wallet" className="tester-app-filter-pill">
              My Wallet
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          PAGE HEADER (Desktop / Tablet)
      ====================================================== */}
      <div className="col-12 d-none d-md-block">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white px-4 py-3 rounded-3 shadow-sm border" style={{ borderColor: "#e2e8f0" }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="fw-bold text-dark mb-0">
                Welcome back, {testerFirstName}! 👋
              </h5>
              <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5" style={{ fontSize: "11px" }}>
                Active Tester
              </span>
            </div>
            <p className="text-muted small mb-0">
              Here is what is happening with your review campaigns and tasks today.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link
              href="/tester/campaigns/live"
              className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-1.5 fw-semibold shadow-sm rounded-3"
              style={{ backgroundColor: "#002E7E", borderColor: "#002E7E" }}
            >
              <i className="bi bi-search"></i>
              <span>Find Campaigns</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          PROFILE COMPLETION ALERT (Compact Sleek Banner)
      ====================================================== */}
      {!isProfileComplete && (
        <div className="col-12">
          <div
            id="tester-profile-completion-alert"
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              padding: 0,
            }}
          >
            <div className="card-body p-3 p-md-3.5">
              <div className="row align-items-center gy-3">
                {/* Left: Icon + Title & Subtitle */}
                <div className="col-12 col-md-8 col-lg-9">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="flex-shrink-0 d-flex align-items-center justify-content-center text-white"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #002E7E 0%, #1e40af 100%)",
                        boxShadow: "0 2px 8px rgba(0, 46, 126, 0.2)",
                      }}
                    >
                      <i className="bi bi-person-check fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>
                          Complete Your Profile
                        </h6>
                        <span
                          className="badge rounded-pill fw-semibold"
                          style={{
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            fontSize: "11px",
                            padding: "3px 8px",
                          }}
                        >
                          {profileCompletionPercentage}% Done
                        </span>
                      </div>
                      <p className="text-muted mb-0 small" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                        Add email, bank &amp; interests to unlock all campaigns
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="col-12 col-md-4 col-lg-3 text-md-end">
                  <Link
                    href="/tester/profile"
                    className="btn btn-sm text-white fw-semibold px-3.5 py-2 text-decoration-none d-inline-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: "#002E7E",
                      borderColor: "#002E7E",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxShadow: "0 2px 6px rgba(0, 46, 126, 0.18)",
                    }}
                  >
                    <span>Complete Profile</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className="progress w-100 mt-3"
                style={{
                  height: "6px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${profileCompletionPercentage}%`,
                    background: "linear-gradient(90deg, #002E7E 0%, #2563eb 100%)",
                    borderRadius: "999px",
                    transition: "width 0.4s ease",
                  }}
                  aria-valuenow={profileCompletionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SUMMARY STATS GRID (100% Responsive - Mobile & Desktop)
      ====================================================== */}
      <div className="col-12">
        <div className="row g-2 g-md-3">
          {/* 1. Live Campaigns */}
          <div className="col-6 col-lg-3">
            <Link href="/tester/campaigns/live" className="text-decoration-none">
              <div className="tester-stat-card p-3 p-md-3.5 h-100 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-medium" style={{ fontSize: "12px" }}>
                    Live Campaigns
                  </span>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "34px", height: "34px", background: "#eff6ff", color: "#2563eb" }}
                  >
                    <i className="bi bi-megaphone fs-6"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: "24px" }}>
                  {liveCampaignCount}
                </h3>
                <div className="text-primary small mt-1 d-flex align-items-center gap-1" style={{ fontSize: "11.5px" }}>
                  <span>Apply Now</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: "10px" }}></i>
                </div>
              </div>
            </Link>
          </div>

          {/* 2. Ongoing Tasks */}
          <div className="col-6 col-lg-3">
            <Link href="/tester/campaigns/ongoing" className="text-decoration-none">
              <div className="tester-stat-card p-3 p-md-3.5 h-100 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-medium" style={{ fontSize: "12px" }}>
                    Ongoing Tasks
                  </span>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "34px", height: "34px", background: "#fffbeb", color: "#d97706" }}
                  >
                    <i className="bi bi-hourglass-split fs-6"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: "24px" }}>
                  {ongoingCampaignCount}
                </h3>
                <div className="text-warning-emphasis small mt-1 d-flex align-items-center gap-1" style={{ fontSize: "11.5px" }}>
                  <span>In Progress</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: "10px" }}></i>
                </div>
              </div>
            </Link>
          </div>

          {/* 3. My Applications */}
          <div className="col-6 col-lg-3">
            <Link href="/tester/campaigns/applications" className="text-decoration-none">
              <div className="tester-stat-card p-3 p-md-3.5 h-100 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-medium" style={{ fontSize: "12px" }}>
                    My Applications
                  </span>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "34px", height: "34px", background: "#f5f3ff", color: "#7c3aed" }}
                  >
                    <i className="bi bi-send-check fs-6"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0" style={{ fontSize: "24px" }}>
                  {applicationCount}
                </h3>
                <div className="text-secondary small mt-1 d-flex align-items-center gap-1" style={{ fontSize: "11.5px" }}>
                  <span>View Status</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: "10px" }}></i>
                </div>
              </div>
            </Link>
          </div>

          {/* 4. Wallet Earnings */}
          <div className="col-6 col-lg-3">
            <Link href="/tester/wallet" className="text-decoration-none">
              <div className="tester-stat-card p-3 p-md-3.5 h-100 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-medium" style={{ fontSize: "12px" }}>
                    Total Earnings
                  </span>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "34px", height: "34px", background: "#ecfdf5", color: "#059669" }}
                  >
                    <i className="bi bi-wallet2 fs-6"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-0" style={{ fontSize: "24px" }}>
                  ₹{walletBalance.toLocaleString("en-IN")}
                </h3>
                <div className="text-success small mt-1 d-flex align-items-center gap-1" style={{ fontSize: "11.5px" }}>
                  <span>View Wallet</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: "10px" }}></i>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          CAMPAIGN INVITATIONS (If Any)
      ====================================================== */}
      <TesterInvitationWidget />

      {/* ======================================================
          MAIN TWO-COLUMN WORKSPACE
      ====================================================== */}
      <div className="col-12">
        <div className="row g-3 g-xl-4">
          
          {/* ==================================================
              LEFT COLUMN: ONGOING TASKS + LIVE CAMPAIGNS
          ================================================== */}
          <div className="col-12 col-xl-8">
            
            {/* 1. ONGOING TASKS SECTION */}
            <div className="card tester-main-card border-0 shadow-sm rounded-4 mb-3 mb-md-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 0 }}>
              <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2 text-truncate">
                    <i className="bi bi-hourglass-split text-warning fs-5 flex-shrink-0"></i>
                    <span>Ongoing Tasks ({ongoingCampaignCount})</span>
                  </h6>
                  <p className="text-muted small mb-0 text-truncate" style={{ fontSize: "11.5px" }}>
                    Active campaigns requiring your action
                  </p>
                </div>
                <Link
                  href="/tester/campaigns/ongoing"
                  className="tester-view-all-btn"
                >
                  <span>View All</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="card-body">
                {ongoingCampaigns.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded-3">
                    <div className="fs-1 text-muted mb-2">
                      <i className="bi bi-clipboard2-check"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No Ongoing Tasks</h6>
                    <p className="text-muted small mb-3">
                      Apply to live campaigns below to start testing products and earning!
                    </p>
                    <Link
                      href="/tester/campaigns/live"
                      className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-semibold"
                      style={{ backgroundColor: "#002E7E", borderColor: "#002E7E" }}
                    >
                      Explore Campaigns
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="table-responsive d-none d-md-block">
                      <table className="table align-middle mb-0">
                        <thead className="table-light">
                          <tr style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <th>Product</th>
                            <th>Brand</th>
                            <th>Current Task</th>
                            <th>Status</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ongoingCampaigns.map((testerCampaign) => {
                            const currentTask = testerCampaign.tasks.find(
                              (task) => task.taskNumber === testerCampaign.currentTask
                            );

                            return (
                              <tr key={testerCampaign.id}>
                                <td>
                                  <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                    {testerCampaign.campaign.productImage ? (
                                      <img
                                        src={testerCampaign.campaign.productImage}
                                        alt={testerCampaign.campaign.productName}
                                        className="rounded-2 object-fit-cover flex-shrink-0"
                                        style={{ width: "38px", height: "38px", border: "1px solid #e2e8f0" }}
                                      />
                                    ) : (
                                      <div
                                        className="rounded-2 bg-light d-flex align-items-center justify-content-center text-muted flex-shrink-0"
                                        style={{ width: "38px", height: "38px" }}
                                      >
                                        <i className="bi bi-box-seam"></i>
                                      </div>
                                    )}
                                    <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "200px" }}>
                                      {testerCampaign.campaign.productName}
                                    </div>
                                  </div>
                                </td>

                                <td className="small text-muted">
                                  {testerCampaign.campaign.brand?.companyName ?? "-"}
                                </td>

                                <td>
                                  <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                                    Task {testerCampaign.currentTask}
                                  </div>
                                  <div className="small text-muted">
                                    {getTaskName(testerCampaign.currentTask)}
                                  </div>
                                </td>

                                <td>
                                  {currentTask ? (
                                    <>
                                      <span className={`badge rounded-pill ${getTaskBadgeClass(currentTask.status)}`}>
                                        {currentTask.status}
                                      </span>
                                      {currentTask.status === "REJECTED" && currentTask.rejectionReason && (
                                        <div className="small text-danger mt-1" style={{ fontSize: "11px" }}>
                                          {currentTask.rejectionReason}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="badge rounded-pill bg-secondary-subtle text-secondary">
                                      Pending
                                    </span>
                                  )}
                                </td>

                                <td className="text-end">
                                  <Link
                                    href={`/tester/campaigns/ongoing/${testerCampaign.id}`}
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold"
                                  >
                                    Continue &rarr;
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="d-block d-md-none">
                      {ongoingCampaigns.map((testerCampaign) => {
                        const currentTask = testerCampaign.tasks.find(
                          (task) => task.taskNumber === testerCampaign.currentTask
                        );

                        return (
                          <div
                            key={testerCampaign.id}
                            className="tester-ongoing-item shadow-xs"
                          >
                            {/* Product Info Row */}
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                              <div
                                className="rounded-2 overflow-hidden bg-light flex-shrink-0 d-flex align-items-center justify-content-center"
                                style={{ width: "46px", height: "46px", border: "1px solid #e2e8f0" }}
                              >
                                {testerCampaign.campaign.productImage ? (
                                  <img
                                    src={testerCampaign.campaign.productImage}
                                    alt={testerCampaign.campaign.productName}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                ) : (
                                  <i className="bi bi-box-seam text-muted fs-5"></i>
                                )}
                              </div>

                              <div className="min-w-0 flex-grow-1">
                                <div
                                  className="tester-ongoing-title"
                                  title={testerCampaign.campaign.productName}
                                >
                                  {testerCampaign.campaign.productName}
                                </div>
                                <div className="text-muted text-truncate mt-0.5" style={{ fontSize: "11px" }}>
                                  {testerCampaign.campaign.brand?.companyName ?? "Brand"}
                                </div>
                              </div>
                            </div>

                            {/* Status & Action Bottom Row */}
                            <div
                              className="d-flex align-items-center justify-content-between gap-2 pt-2 border-top mt-2"
                              style={{ borderColor: "#f1f5f9" }}
                            >
                              <div className="d-flex align-items-center gap-1.5 flex-wrap min-w-0">
                                <span
                                  className="badge rounded-pill fw-semibold text-dark text-truncate"
                                  style={{
                                    backgroundColor: "#f1f5f9",
                                    fontSize: "10.5px",
                                    padding: "3px 8px",
                                    border: "1px solid #e2e8f0",
                                    maxWidth: "160px",
                                  }}
                                >
                                  Task {testerCampaign.currentTask}: {getTaskName(testerCampaign.currentTask)}
                                </span>
                                {currentTask && (
                                  <span
                                    className={`badge rounded-pill ${getTaskBadgeClass(currentTask.status)}`}
                                    style={{ fontSize: "10px", padding: "3px 7px" }}
                                  >
                                    {currentTask.status}
                                  </span>
                                )}
                              </div>

                              <Link
                                href={`/tester/campaigns/ongoing/${testerCampaign.id}`}
                                className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold text-nowrap flex-shrink-0 d-inline-flex align-items-center gap-1 text-decoration-none shadow-xs"
                                style={{
                                  fontSize: "11.5px",
                                  backgroundColor: "#002E7E",
                                  borderColor: "#002E7E",
                                }}
                              >
                                <span>Continue</span>
                                <i className="bi bi-arrow-right" style={{ fontSize: "10px" }}></i>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. LIVE CAMPAIGNS SECTION (Available on BOTH Desktop & Phone) */}
            <div className="card tester-main-card border-0 shadow-sm rounded-4 mb-3 mb-md-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 0 }}>
              <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2 text-truncate">
                    <i className="bi bi-megaphone-fill text-primary fs-5 flex-shrink-0"></i>
                    <span>Live Campaigns ({liveCampaignCount})</span>
                  </h6>
                  <p className="text-muted small mb-0 text-truncate" style={{ fontSize: "11.5px" }}>
                    Browse and test verified products
                  </p>
                </div>
                <Link
                  href="/tester/campaigns/live"
                  className="tester-view-all-btn"
                >
                  <span>View All</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="card-body">
                {mobileLiveCampaigns.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded-3">
                    <div className="fs-1 text-muted mb-2">
                      <i className="bi bi-inbox"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No Live Campaigns Available</h6>
                    <p className="text-muted small mb-0">
                      Check back soon for new testing opportunities matching your profile!
                    </p>
                  </div>
                ) : (
                  <div className="row g-2 g-md-3">
                    {mobileLiveCampaigns.map((campaign) => {
                      const filledCount =
                        campaign.filledSlots ??
                        (campaign.totalSlots - (campaign.availableSlots ?? 0));
                      const isApplied = mobileApplicationStatusByCampaignId.has(campaign.id);
                      const applicationStatus = mobileApplicationStatusByCampaignId.get(campaign.id);

                      return (
                        <div key={campaign.id} className="col-12 col-md-6">
                          <Link
                            href={`/tester/campaigns/live/${campaign.id}`}
                            className="tester-product-card d-flex text-decoration-none h-100"
                          >
                            {/* Product Image */}
                            <div
                              className="tester-product-img-box rounded-3 overflow-hidden bg-light flex-shrink-0 d-flex align-items-center justify-content-center"
                              style={{ border: "1px solid #e2e8f0" }}
                            >
                              {campaign.productImage ? (
                                <img
                                  src={campaign.productImage}
                                  alt={campaign.productName}
                                  className="w-100 h-100 object-fit-cover"
                                />
                              ) : (
                                <i className="bi bi-image text-muted fs-4"></i>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-grow-1 d-flex flex-column justify-content-between">
                              <div>
                                <div className="d-flex align-items-start justify-content-between gap-1.5 mb-0.5">
                                  <div
                                    className="tester-product-title"
                                    title={campaign.productName}
                                  >
                                    {campaign.productName}
                                  </div>
                                  {isApplied && (
                                    <span
                                      className={`badge rounded-pill flex-shrink-0 ${getMobileApplicationClass(
                                        applicationStatus ?? null
                                      )}`}
                                      style={{ fontSize: "9.5px", padding: "2px 6px" }}
                                    >
                                      {applicationStatus}
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted text-truncate mt-0.5 mb-1" style={{ fontSize: "11px" }}>
                                  {campaign.brand?.companyName ?? "Brand"}
                                </div>
                              </div>

                              <div
                                className="d-flex align-items-center justify-content-between pt-1.5 border-top mt-1"
                                style={{ borderColor: "#f1f5f9" }}
                              >
                                <div className="d-flex align-items-center gap-1">
                                  <span className="text-muted" style={{ fontSize: "10.5px" }}>Earning: </span>
                                  <span className="fw-bold text-success" style={{ fontSize: "13px" }}>
                                    ₹{Number(campaign.earningAmount).toLocaleString("en-IN")}
                                  </span>
                                </div>

                                <div className="d-flex align-items-center gap-1.5">
                                  <span
                                    className="badge rounded-pill fw-medium text-secondary"
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      fontSize: "10.5px",
                                      padding: "3px 7px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {filledCount}/{campaign.totalSlots} Slots
                                  </span>

                                  <span
                                    className="badge rounded-pill fw-semibold text-white d-inline-flex align-items-center gap-0.5"
                                    style={{
                                      backgroundColor: "#002E7E",
                                      fontSize: "10.5px",
                                      padding: "3px 8px",
                                    }}
                                  >
                                    <span>View</span>
                                    <i className="bi bi-arrow-right" style={{ fontSize: "9px" }}></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {liveCampaignCount > MOBILE_CAMPAIGNS_PER_PAGE && (
                  <nav
                    className="d-flex justify-content-between align-items-center gap-2 mt-3 pt-3 border-top"
                    aria-label="Campaign pagination"
                  >
                    {mobilePage > 1 ? (
                      <Link
                        href={
                          mobilePage - 1 === 1
                            ? "/tester"
                            : `/tester?mobilePage=${mobilePage - 1}`
                        }
                        scroll={false}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      >
                        <i className="bi bi-chevron-left me-1"></i>
                        Prev
                      </Link>
                    ) : (
                      <span className="btn btn-outline-secondary btn-sm rounded-pill px-3 disabled" aria-disabled="true">
                        <i className="bi bi-chevron-left me-1"></i>
                        Prev
                      </span>
                    )}

                    <span className="small text-muted text-nowrap">
                      Page {mobilePage} of {totalMobilePages}
                    </span>

                    {mobilePage < totalMobilePages ? (
                      <Link
                        href={`/tester?mobilePage=${mobilePage + 1}`}
                        scroll={false}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      >
                        Next
                        <i className="bi bi-chevron-right ms-1"></i>
                      </Link>
                    ) : (
                      <span className="btn btn-outline-secondary btn-sm rounded-pill px-3 disabled" aria-disabled="true">
                        Next
                        <i className="bi bi-chevron-right ms-1"></i>
                      </span>
                    )}
                  </nav>
                )}
              </div>
            </div>

          </div>

          {/* ==================================================
              RIGHT COLUMN: WALLET CARD + STEP GUIDE + QUICK LINKS
          ================================================== */}
          <div className="col-12 col-xl-4">
            
            {/* 1. WALLET BALANCE CARD */}
            <div
              className="card border-0 shadow-sm rounded-4 mb-3 text-white overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #001f54 0%, #002e7e 100%)",
                boxShadow: "0 10px 25px rgba(0, 46, 126, 0.2)",
                padding: 0,
              }}
            >
              <div className="card-body p-3.5 p-md-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="text-white-50 small text-uppercase fw-semibold" style={{ letterSpacing: "0.08em", fontSize: "11px" }}>
                      Tester Wallet
                    </span>
                    <h2 className="fw-bold mb-0 text-white mt-1" style={{ fontSize: "32px", letterSpacing: "-0.02em" }}>
                      ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.15)" }}
                  >
                    <i className="bi bi-wallet2 text-white fs-5"></i>
                  </div>
                </div>

                <p className="text-white-50 small mb-4" style={{ fontSize: "12.5px" }}>
                  Earned from completed verified review campaigns. Ready for bank or UPI withdrawal.
                </p>

                <div className="d-flex gap-2">
                  <Link
                    href="/tester/wallet"
                    className="btn btn-light btn-sm fw-semibold rounded-pill grow text-center py-2 text-decoration-none"
                    style={{ color: "#002E7E", fontSize: "13px" }}
                  >
                    View Wallet
                  </Link>
                  <Link
                    href="/tester/payments"
                    className="btn btn-outline-light btn-sm fw-semibold rounded-pill grow text-center py-2 text-decoration-none"
                    style={{ fontSize: "13px" }}
                  >
                    Withdraw
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. HOW PRODUCT TESTING WORKS GUIDE */}
            <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 0 }}>
              <div className="card-body p-3 p-md-3.5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                    <i className="bi bi-shield-check text-success fs-5"></i>
                    <span>How Testing Works</span>
                  </h6>
                  <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: "10.5px", fontWeight: "500" }}>
                    4 Simple Steps
                  </span>
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* Step 1 */}
                  <div className="d-flex align-items-start" style={{ gap: "12px" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 text-white shadow-sm"
                      style={{
                        width: "26px",
                        height: "26px",
                        fontSize: "12px",
                        background: "linear-gradient(135deg, #001f54 0%, #002e7e 100%)",
                      }}
                    >
                      1
                    </div>
                    <div className="flex-grow-1 min-w-0 pt-0.5">
                      <div className="fw-bold text-dark" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                        Order Product
                      </div>
                      <div className="text-muted" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                        Buy product on Amazon/Flipkart &amp; submit Order ID
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="d-flex align-items-start" style={{ gap: "12px" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 text-white shadow-sm"
                      style={{
                        width: "26px",
                        height: "26px",
                        fontSize: "12px",
                        background: "linear-gradient(135deg, #001f54 0%, #002e7e 100%)",
                      }}
                    >
                      2
                    </div>
                    <div className="flex-grow-1 min-w-0 pt-0.5">
                      <div className="fw-bold text-dark" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                        Confirm Delivery
                      </div>
                      <div className="text-muted" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                        Upload unboxing photo when parcel arrives
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="d-flex align-items-start" style={{ gap: "12px" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 text-white shadow-sm"
                      style={{
                        width: "26px",
                        height: "26px",
                        fontSize: "12px",
                        background: "linear-gradient(135deg, #001f54 0%, #002e7e 100%)",
                      }}
                    >
                      3
                    </div>
                    <div className="flex-grow-1 min-w-0 pt-0.5">
                      <div className="fw-bold text-dark" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                        Write Review Draft
                      </div>
                      <div className="text-muted" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                        Submit your honest review &amp; survey questions
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="d-flex align-items-start" style={{ gap: "12px" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 text-white shadow-sm"
                      style={{
                        width: "26px",
                        height: "26px",
                        fontSize: "12px",
                        background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                      }}
                    >
                      4
                    </div>
                    <div className="flex-grow-1 min-w-0 pt-0.5">
                      <div className="fw-bold text-success" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                        Publish &amp; Get Paid! 🎉
                      </div>
                      <div className="text-muted" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                        Post live review &amp; receive reward in your wallet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. NEED HELP / COMMUNITY */}
            <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: 0 }}>
              <div className="card-body p-3 text-center">
                <i className="bi bi-whatsapp text-success fs-3 mb-2 d-inline-block"></i>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "13.5px" }}>Tester Community</h6>
                <p className="text-muted small mb-2.5" style={{ fontSize: "11.5px" }}>
                  Join our official WhatsApp group for daily campaign updates &amp; instant support.
                </p>
                <a
                  href="https://chat.whatsapp.com/JLDLEwZWJTPJKhPl5XzWQD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tester-community-cta-btn"
                >
                  <i className="bi bi-whatsapp"></i>
                  <span>Join Community</span>
                  <i className="bi bi-arrow-right-short fs-5"></i>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

// Mobile application badge classes match /tester/campaigns/live.
function getMobileApplicationClass(status: string | null) {
  switch (status) {
    case "PENDING":
      return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    case "APPROVED":
      return "bg-success-subtle text-success border border-success-subtle";
    case "REJECTED":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    case "CANCELLED":
      return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    default:
      return "bg-light text-muted border";
  }
}
