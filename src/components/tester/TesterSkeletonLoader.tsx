import React from "react";

// ============================================================
// BASE SKELETON ITEM
// ============================================================

export function SkeletonItem({
  width = "100%",
  height = "16px",
  borderRadius = "8px",
  className = "",
  style = {},
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`tester-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

// ============================================================
// 1. LIVE CAMPAIGNS SKELETON LOADER
// ============================================================

export function LiveCampaignsSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* Category Filter Pills Shimmer */}
      <div className="d-flex gap-2 overflow-hidden mb-3">
        <SkeletonItem width="80px" height="34px" borderRadius="999px" />
        <SkeletonItem width="110px" height="34px" borderRadius="999px" />
        <SkeletonItem width="95px" height="34px" borderRadius="999px" />
        <SkeletonItem width="120px" height="34px" borderRadius="999px" />
      </div>

      {/* Campaign Cards Shimmer */}
      <div className="row g-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-md-6 col-xl-4">
            <div className="tester-skeleton-card">
              {/* Top Row: Thumbnail + Details */}
              <div className="d-flex align-items-center gap-3">
                <SkeletonItem
                  width="76px"
                  height="76px"
                  borderRadius="14px"
                  className="flex-shrink-0"
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <SkeletonItem width="70px" height="14px" borderRadius="6px" />
                    <SkeletonItem width="55px" height="18px" borderRadius="999px" />
                  </div>
                  <SkeletonItem width="90%" height="15px" borderRadius="6px" className="mb-1" />
                  <SkeletonItem width="60%" height="13px" borderRadius="6px" className="mb-2" />
                  <div className="d-flex gap-1.5">
                    <SkeletonItem width="50px" height="16px" borderRadius="6px" />
                    <SkeletonItem width="65px" height="16px" borderRadius="6px" />
                  </div>
                </div>
              </div>

              {/* Card Footer: Payout + Button */}
              <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top">
                <div>
                  <SkeletonItem width="55px" height="11px" borderRadius="4px" className="mb-1" />
                  <SkeletonItem width="75px" height="20px" borderRadius="6px" />
                </div>
                <SkeletonItem width="105px" height="38px" borderRadius="999px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 2. APPLICATIONS SKELETON LOADER
// ============================================================

export function ApplicationsSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* 4 KPI Summary Cards Shimmer */}
      <div className="row g-2 g-md-3 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-6 col-md-6 col-xl-3">
            <div className="tester-skeleton-card">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <SkeletonItem width="60px" height="13px" borderRadius="6px" />
                <SkeletonItem width="32px" height="32px" borderRadius="8px" />
              </div>
              <SkeletonItem width="45px" height="24px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>

      {/* Applications Cards Shimmer */}
      <div className="row g-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-12">
            <div className="tester-skeleton-card">
              <div className="d-flex align-items-center gap-3">
                <SkeletonItem
                  width="76px"
                  height="76px"
                  borderRadius="14px"
                  className="flex-shrink-0"
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <SkeletonItem width="80px" height="13px" borderRadius="6px" />
                    <SkeletonItem width="70px" height="20px" borderRadius="999px" />
                  </div>
                  <SkeletonItem width="85%" height="16px" borderRadius="6px" className="mb-1.5" />
                  <SkeletonItem width="50%" height="13px" borderRadius="6px" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3. ONGOING TASKS SKELETON LOADER
// ============================================================

export function OngoingCampaignsSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* Stat Card Shimmer */}
      <div className="tester-skeleton-card mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <SkeletonItem width="120px" height="16px" borderRadius="6px" />
          <SkeletonItem width="70px" height="22px" borderRadius="999px" />
        </div>
        <SkeletonItem width="100%" height="8px" borderRadius="999px" className="mb-2" />
        <div className="d-flex justify-content-between">
          <SkeletonItem width="90px" height="12px" borderRadius="4px" />
          <SkeletonItem width="50px" height="12px" borderRadius="4px" />
        </div>
      </div>

      {/* Ongoing Tasks Cards Shimmer */}
      <div className="row g-3">
        {[1, 2].map((i) => (
          <div key={i} className="col-12 col-xl-6">
            <div className="tester-skeleton-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <SkeletonItem width="64px" height="64px" borderRadius="12px" className="flex-shrink-0" />
                <div className="flex-grow-1">
                  <SkeletonItem width="70px" height="12px" borderRadius="4px" className="mb-1" />
                  <SkeletonItem width="90%" height="16px" borderRadius="6px" className="mb-1.5" />
                  <SkeletonItem width="50%" height="13px" borderRadius="6px" />
                </div>
              </div>
              <SkeletonItem width="100%" height="6px" borderRadius="999px" className="mb-3" />
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <SkeletonItem width="90px" height="18px" borderRadius="6px" />
                <SkeletonItem width="110px" height="36px" borderRadius="999px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4. COMPLETED HISTORY SKELETON LOADER
// ============================================================

export function HistorySkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* Summary Stats Row */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-6 col-md-4">
          <div className="tester-skeleton-card text-center py-3">
            <SkeletonItem width="40px" height="24px" borderRadius="6px" className="mx-auto mb-1.5" />
            <SkeletonItem width="70px" height="12px" borderRadius="4px" className="mx-auto" />
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="tester-skeleton-card text-center py-3">
            <SkeletonItem width="60px" height="24px" borderRadius="6px" className="mx-auto mb-1.5" />
            <SkeletonItem width="75px" height="12px" borderRadius="4px" className="mx-auto" />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="tester-skeleton-card text-center py-3">
            <SkeletonItem width="50px" height="24px" borderRadius="6px" className="mx-auto mb-1.5" />
            <SkeletonItem width="80px" height="12px" borderRadius="4px" className="mx-auto" />
          </div>
        </div>
      </div>

      {/* History Items */}
      <div className="row g-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-12">
            <div className="tester-skeleton-card">
              <div className="d-flex align-items-center gap-3">
                <SkeletonItem width="60px" height="60px" borderRadius="12px" className="flex-shrink-0" />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <SkeletonItem width="80px" height="13px" borderRadius="4px" />
                    <SkeletonItem width="75px" height="18px" borderRadius="999px" />
                  </div>
                  <SkeletonItem width="80%" height="15px" borderRadius="6px" className="mb-1.5" />
                  <SkeletonItem width="45%" height="12px" borderRadius="4px" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 5. WALLET SKELETON LOADER
// ============================================================

export function WalletSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* Wallet Balance Hero Card Shimmer */}
      <div
        className="tester-skeleton-card mb-3 text-white"
        style={{
          background: "linear-gradient(135deg, #001f54 0%, #002e7e 100%)",
          borderRadius: "20px",
          padding: "1.5rem",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <SkeletonItem width="90px" height="14px" borderRadius="6px" style={{ background: "rgba(255,255,255,0.2)" }} />
          <SkeletonItem width="65px" height="20px" borderRadius="999px" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>
        <SkeletonItem width="140px" height="34px" borderRadius="8px" className="mb-3" style={{ background: "rgba(255,255,255,0.25)" }} />
        <SkeletonItem width="100%" height="42px" borderRadius="999px" style={{ background: "rgba(255,255,255,0.3)" }} />
      </div>

      {/* Quick Stats Row */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-6">
          <div className="tester-skeleton-card py-3">
            <SkeletonItem width="60px" height="12px" borderRadius="4px" className="mb-1.5" />
            <SkeletonItem width="80px" height="20px" borderRadius="6px" />
          </div>
        </div>
        <div className="col-6">
          <div className="tester-skeleton-card py-3">
            <SkeletonItem width="60px" height="12px" borderRadius="4px" className="mb-1.5" />
            <SkeletonItem width="80px" height="20px" borderRadius="6px" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="tester-skeleton-card">
        <SkeletonItem width="130px" height="18px" borderRadius="6px" className="mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="d-flex justify-content-between align-items-center py-2.5 border-top">
            <div>
              <SkeletonItem width="110px" height="14px" borderRadius="4px" className="mb-1" />
              <SkeletonItem width="70px" height="11px" borderRadius="4px" />
            </div>
            <SkeletonItem width="60px" height="18px" borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 6. PROFILE SKELETON LOADER
// ============================================================

export function ProfileSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      <div className="row g-3">
        {/* Left Column: Form Fields Shimmer */}
        <div className="col-12 col-xl-8 order-2 order-xl-1">
          <div className="tester-skeleton-card mb-3">
            <SkeletonItem width="150px" height="18px" borderRadius="6px" className="mb-1" />
            <SkeletonItem width="220px" height="13px" borderRadius="4px" className="mb-3" />
            <div className="row g-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="col-12 col-md-6">
                  <SkeletonItem width="80px" height="13px" borderRadius="4px" className="mb-1.5" />
                  <SkeletonItem width="100%" height="42px" borderRadius="8px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Avatar Summary Shimmer */}
        <div className="col-12 col-xl-4 order-1 order-xl-2">
          <div className="tester-skeleton-card text-center py-4 mb-3">
            <SkeletonItem
              width="80px"
              height="80px"
              borderRadius="50%"
              className="mx-auto mb-3"
            />
            <SkeletonItem width="130px" height="18px" borderRadius="6px" className="mx-auto mb-1.5" />
            <SkeletonItem width="95px" height="13px" borderRadius="4px" className="mx-auto mb-3" />
            <div className="pt-3 border-top d-flex flex-column gap-2 text-start px-2">
              <SkeletonItem width="80%" height="13px" borderRadius="4px" />
              <SkeletonItem width="60%" height="13px" borderRadius="4px" />
              <SkeletonItem width="70%" height="13px" borderRadius="4px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7. DASHBOARD GLOBAL SKELETON LOADER (Next.js loading.tsx)
// ============================================================

export function DashboardSkeleton() {
  return (
    <div className="col-12" style={{ paddingBottom: "115px" }}>
      {/* 2 Stat Cards */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-6">
          <div className="tester-skeleton-card py-3">
            <SkeletonItem width="70px" height="12px" borderRadius="4px" className="mb-2" />
            <SkeletonItem width="90px" height="24px" borderRadius="6px" />
          </div>
        </div>
        <div className="col-6">
          <div className="tester-skeleton-card py-3">
            <SkeletonItem width="70px" height="12px" borderRadius="4px" className="mb-2" />
            <SkeletonItem width="90px" height="24px" borderRadius="6px" />
          </div>
        </div>
      </div>

      {/* Ongoing Task Card */}
      <div className="tester-skeleton-card mb-3">
        <SkeletonItem width="140px" height="18px" borderRadius="6px" className="mb-3" />
        <div className="d-flex align-items-center gap-3">
          <SkeletonItem width="56px" height="56px" borderRadius="12px" className="flex-shrink-0" />
          <div className="flex-grow-1">
            <SkeletonItem width="80%" height="15px" borderRadius="6px" className="mb-1.5" />
            <SkeletonItem width="50%" height="13px" borderRadius="4px" />
          </div>
        </div>
      </div>

      {/* Live Campaigns Grid */}
      <div className="tester-skeleton-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <SkeletonItem width="130px" height="18px" borderRadius="6px" />
          <SkeletonItem width="65px" height="14px" borderRadius="4px" />
        </div>
        <div className="row g-3">
          {[1, 2].map((i) => (
            <div key={i} className="col-12 col-md-6">
              <div className="p-2.5 rounded-3 border" style={{ borderColor: "#f1f5f9" }}>
                <div className="d-flex align-items-center gap-2.5">
                  <SkeletonItem width="56px" height="56px" borderRadius="10px" className="flex-shrink-0" />
                  <div className="flex-grow-1">
                    <SkeletonItem width="85%" height="14px" borderRadius="4px" className="mb-1" />
                    <SkeletonItem width="60px" height="12px" borderRadius="4px" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
