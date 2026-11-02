import Link from "next/link";
import TesterSignupForm from "@/components/auth/TesterSignupForm";
import "./login.css";

export default function TesterSignupPage() {
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
          <div className="login-card tester-card-wide">
            <div className="text-center mb-4">
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
                <i className="bi bi-person-check me-1"></i> Tester Community
              </span>
              <h1 className="login-title" style={{ fontSize: "26px" }}>
                Create Tester Account
              </h1>
              <p className="login-subtitle mb-2">
                Register using your mobile number to test authentic products and receive guaranteed cash rewards.
              </p>
            </div>

            <TesterSignupForm />
          </div>
        </div>
      </div>
    </>
  );
}
