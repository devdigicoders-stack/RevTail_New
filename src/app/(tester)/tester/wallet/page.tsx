"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WalletSkeleton } from "@/components/tester/TesterSkeletonLoader";

// ============================================================
// TYPES
// ============================================================

type WalletTransaction = {
  id: number;
  type: string;
  amount: string | number;
  balanceAfter: string | number;
  description: string | null;
  createdAt: string;
  campaign: {
    testerCampaignId: number;
    productName: string;
    brandName: string | null;
  } | null;
  payment: {
    id: number;
    status: string;
    paidMethod: string | null;
    transactionReference: string | null;
    paidAt: string | null;
  } | null;
};

type WalletPaymentRequest = {
  id: number;
  amount: string | number;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  paidAmount: string | number | null;
  preferredPaymentMethod: string;
  paidMethod: string | null;
  transactionReference: string | null;
  rejectionReason: string | null;
  campaign: {
    testerCampaignId: number;
    productName: string;
    brandName: string | null;
  };
};

type WalletResponse = {
  success: boolean;
  message: string;
  data?: {
    tester: {
      id: number;
      fullName: string;
    };
    wallet: {
      exists: boolean;
      totalEarned: string | number;
      availableBalance: string | number;
      totalPaid: string | number;
      pendingAmount: number;
      approvedAwaitingPayment: number;
    };
    transactions: WalletTransaction[];
    paymentRequests: WalletPaymentRequest[];
  };
};

// ============================================================
// PAGE
// ============================================================

export default function TesterWalletPage() {
  const [data, setData] = useState<WalletResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWallet() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/tester/wallet", {
          cache: "no-store",
        });

        const result = (await response.json()) as WalletResponse;

        if (!response.ok) {
          throw new Error(result.message || "Unable to load wallet.");
        }

        setData(result.data ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load wallet."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, []);

  const paidRequests = useMemo(() => {
    return (
      data?.paymentRequests.filter((request) => request.status === "PAID") ?? []
    );
  }, [data]);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return <WalletSkeleton />;
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error || !data) {
    return (
      <div className="col-12">
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
            <div>
              <h6 className="fw-bold mb-1">Unable to load wallet</h6>
              <div className="small text-danger text-opacity-75">{error || "Unable to load wallet."}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableBalance = Number(data.wallet.availableBalance);
  const totalEarned = Number(data.wallet.totalEarned);
  const totalPaid = Number(data.wallet.totalPaid);

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
          {/* Top Row: Back button, Page Title, Withdraw Action */}
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
                  My Wallet
                </h4>
              </div>
            </div>

            <Link
              href="/tester/payments"
              className="btn btn-sm text-white rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                backdropFilter: "blur(4px)",
                fontSize: "12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <i className="bi bi-cash-stack"></i>
              <span>Withdraw</span>
            </Link>
          </div>

          {/* Quick Balance Bar */}
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
              Available: <strong>₹{availableBalance.toLocaleString("en-IN")}</strong>
            </span>
            <span>
              <i className="bi bi-graph-up-arrow text-success me-1"></i>
              Total Earned: <strong>₹{totalEarned.toLocaleString("en-IN")}</strong>
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
                  <i className="bi bi-wallet2"></i>
                </span>
                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
                  My Wallet
                </h3>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Track your campaign earnings, available balance, and withdrawal requests.
              </p>
            </div>

            <Link
              href="/tester/payments"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              style={{
                backgroundColor: "#002e7e",
                borderColor: "#002e7e",
                fontSize: "13.5px",
              }}
            >
              <i className="bi bi-cash-stack"></i>
              <span>Withdraw Payment Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================
          3. WALLET SUMMARY CARDS (Responsive Grid)
      ====================================================== */}
      <div className="col-12 mb-3">
        <div className="row g-2 g-md-3">
          {/* Total Earned */}
          <div className="col-12 col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Total Earned</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "38px", height: "38px", background: "#f0fdf4", color: "#16a34a" }}
                >
                  <i className="bi bi-graph-up-arrow fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-dark">
                ₹{totalEarned.toLocaleString("en-IN")}
              </h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                Total earnings from all completed tasks
              </div>
            </div>
          </div>

          {/* Available Balance */}
          <div className="col-6 col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Available Balance</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "38px", height: "38px", background: "#eff6ff", color: "#002e7e" }}
                >
                  <i className="bi bi-wallet2 fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-primary">
                ₹{availableBalance.toLocaleString("en-IN")}
              </h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                Ready to withdraw to your bank account
              </div>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="col-6 col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Total Withdrawals</span>
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: "38px", height: "38px", background: "#fffbeb", color: "#d97706" }}
                >
                  <i className="bi bi-check-circle fs-6"></i>
                </div>
              </div>
              <h3 className="fw-bold mb-0 text-success">
                ₹{totalPaid.toLocaleString("en-IN")}
              </h3>
              <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                Successfully paid out to bank
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          4. PAYMENT HISTORY
      ====================================================== */}
      <div className="col-12 mb-4">
        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        >
          <div className="card-header bg-white border-bottom py-3 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  Payment History ({paidRequests.length})
                </h6>
                <span className="small text-muted">
                  Recorded payouts transferred to your account
                </span>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            {paidRequests.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3 text-muted"
                  style={{ width: "64px", height: "64px" }}
                >
                  <i className="bi bi-receipt fs-2"></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">No payment transactions yet</h6>
                <p className="text-muted small mb-3">
                  Once you complete campaigns and request payouts, processed payments will appear here.
                </p>
                <Link
                  href="/tester/campaigns/live"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                >
                  Browse Live Campaigns
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paidRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 rounded-4"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                      <div>
                        <strong className="text-dark d-block mb-1" style={{ fontSize: "14.5px" }}>
                          {request.campaign.productName}
                        </strong>
                        <div className="small text-muted">
                          by {request.campaign.brandName ?? "Brand"}
                        </div>
                      </div>

                      <div className="text-end">
                        <strong className="text-success fs-5 d-block">
                          ₹{Number(request.paidAmount ?? request.amount).toLocaleString("en-IN")}
                        </strong>
                        <span className="badge rounded-pill bg-success px-2 py-1" style={{ fontSize: "10.5px" }}>
                          PAID
                        </span>
                      </div>
                    </div>

                    <div className="row g-2 small mt-2 pt-2 border-top text-muted" style={{ fontSize: "12px" }}>
                      <div className="col-12 col-md-4">
                        <span className="text-muted">Method: </span>
                        <strong className="text-dark">
                          {formatMethod(request.paidMethod ?? request.preferredPaymentMethod)}
                        </strong>
                      </div>

                      <div className="col-12 col-md-4">
                        <span className="text-muted">Reference: </span>
                        <strong className="text-dark">
                          {request.transactionReference ?? "-"}
                        </strong>
                      </div>

                      <div className="col-12 col-md-4">
                        <span className="text-muted">Paid On: </span>
                        <strong className="text-dark">
                          {formatDateTime(request.paidAt)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatMethod(method: string | null) {
  if (!method) return "-";
  if (method === "BANK_TRANSFER") return "Bank Transfer";
  return method;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}