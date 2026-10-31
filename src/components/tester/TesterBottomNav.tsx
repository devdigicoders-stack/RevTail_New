"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TesterBottomNav() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Home",
      href: "/tester",
      icon: "bi-house-door",
      activeIcon: "bi-house-door-fill",
      exact: true,
    },
    {
      label: "Campaigns",
      href: "/tester/campaigns/live",
      icon: "bi-megaphone",
      activeIcon: "bi-megaphone-fill",
      exact: false,
    },
    {
      label: "My Apps",
      href: "/tester/campaigns/applications",
      icon: "bi-send-check",
      activeIcon: "bi-send-check-fill",
      exact: false,
    },
    {
      label: "Earnings",
      href: "/tester/wallet",
      icon: "bi-wallet2",
      activeIcon: "bi-wallet-fill",
      exact: false,
    },
    {
      label: "Profile",
      href: "/tester/profile",
      icon: "bi-person",
      activeIcon: "bi-person-fill",
      exact: false,
    },
  ];

  return (
    <nav
      className="tester-mobile-bottom-nav"
      aria-label="Tester mobile navigation"
    >
      {menuItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`tester-mobile-bottom-nav-item ${
              isActive ? "active" : ""
            }`}
          >
            <div className="tester-mobile-bottom-nav-icon-wrap">
              <i
                className={`bi ${
                  isActive ? item.activeIcon : item.icon
                } tester-mobile-bottom-nav-icon`}
              ></i>
            </div>
            <span className="tester-mobile-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
