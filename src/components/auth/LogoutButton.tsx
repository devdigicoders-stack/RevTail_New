"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  children?: React.ReactNode;
  title?: string;
};

export default function LogoutButton({
  className,
  children,
  title,
}: LogoutButtonProps = {}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      /*
       * Replace the current page so the user cannot simply
       * press Back and return to the authenticated page.
       */
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      className={className || "dropdown-item text-danger"}
      href="#"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
    >
      {children || (
        <>
          <i className="bi bi-box-arrow-right"></i>
          {loading ? " Logging out..." : " Logout"}
        </>
      )}
    </a>
  );
}