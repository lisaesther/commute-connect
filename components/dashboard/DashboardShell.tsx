"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";

type DashboardShellProps = {
  fullName?: string;
  email?: string;
  role?: string;
  children: ReactNode;
};

type SidebarContentProps = {
  fullName?: string;
  email?: string;
  role?: string;
  pathname: string;
  onNavigate?: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Find a Ride",
    href: "/journeys/search",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    ),
  },
  {
    label: "Post a Journey",
    href: "/journeys/new",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

const roleLabels: Record<string, string> = {
  passenger: "Passenger",
  driver: "Driver",
  both: "Driver and passenger",
};

function SidebarContent({
  fullName,
  email,
  role,
  pathname,
  onNavigate,
}: SidebarContentProps) {
  const displayName = fullName || email || "CommuteConnect user";
  const initial = displayName.charAt(0).toUpperCase();
  const roleLabel = role ? roleLabels[role] || role : "CommuteConnect member";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xl font-bold text-white"
        >
          CommuteConnect
        </Link>

        <p className="mt-1 text-sm text-emerald-300">Ireland</p>
      </div>

      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-2 px-4 py-6"
      >
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-bold text-slate-950">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>

            <p className="truncate text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>

        <div className="[&>button]:w-full [&>button]:border-slate-700 [&>button]:text-slate-300 [&>button]:hover:bg-white/10 [&>button]:hover:text-white">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  fullName,
  email,
  role,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="hidden h-screen w-72 shrink-0 bg-slate-950 lg:sticky lg:top-0 lg:block">
        <SidebarContent
          fullName={fullName}
          email={email}
          role={role}
          pathname={pathname}
        />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
        <Link href="/" className="font-bold text-emerald-700">
          CommuteConnect Ireland
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open dashboard navigation"
          aria-expanded={mobileMenuOpen}
          className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="h-6 w-6"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />

          <aside className="relative h-full w-72 bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close dashboard navigation"
              className="absolute right-4 top-5 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </svg>
            </button>

            <SidebarContent
              fullName={fullName}
              email={email}
              role={role}
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
