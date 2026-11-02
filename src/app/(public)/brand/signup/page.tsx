import Link from "next/link";
import BrandSignupForm from "@/components/auth/BrandSignupForm";
import "@/app/(public)/tester/signup/login.css";

export default function BrandSignupPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            header.revtail-sticky-header,
            footer {
              display: none !important;
            }
            .login-wrapper {
              min-height: 100vh !important;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px 16px !important;
            }
          `,
        }}
      />
      <div className="login-wrapper">
        <div className="container d-flex justify-content-center" style={{ maxWidth: "900px" }}>
          <div className="login-card brand-card-wide">
            <div className="text-center mb-4 pb-2 border-bottom border-light-subtle">
              <div className="mb-3 text-center">
                <Link href="/">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/images/logo2.png"
                    alt="Revtail"
                    style={{ height: "36px", width: "auto" }}
                  />
                </Link>
              </div>
              <span className="auth-badge">
                <i className="bi bi-briefcase me-1"></i> Brand Partnership
              </span>
              <h1 className="login-title" style={{ fontSize: "26px" }}>
                Create Brand Account
              </h1>
              <p className="login-subtitle mb-2">
                Register your company to launch product testing campaigns and connect with verified testers.
              </p>
            </div>

            <BrandSignupForm />
          </div>
        </div>
      </div>
    </>
  );
}
