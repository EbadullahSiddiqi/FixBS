"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { GitBranch, Github, ArrowRight, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1c1b1b]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffeca0] text-[#1c1b1b] shadow-md shadow-[#ffeca0]/10">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">FixBS</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-[#ffeca0] uppercase">
                v1.0
              </span>
            </div>
            <p className="text-[10px] font-medium text-white/40">Code Intelligence</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/60">
          <Link href="/#features" className="transition hover:text-white">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-white">
            How it works
          </Link>
          <Link href="/#architecture" className="transition hover:text-white">
            Architecture
          </Link>
          {isLoaded && isSignedIn && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[#ffeca0] transition hover:text-[#ffeca0]/80 font-semibold"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Workspace
            </Link>
          )}
        </nav>

        {/* Authentication Actions */}
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
          ) : !isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:border-white/20">
                  <Github className="h-3.5 w-3.5 text-white/70" />
                  <span>Sign In</span>
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="flex items-center gap-1.5 rounded-lg bg-[#ffeca0] px-4 py-2 text-xs font-semibold text-[#1c1b1b] shadow-lg shadow-[#ffeca0]/10 transition hover:bg-[#ffeca0]/90">
                  <span>Get Started</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-[#ffeca0] px-3.5 py-2 text-xs font-semibold text-[#1c1b1b] transition hover:bg-[#ffeca0]/90"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Launch Dashboard</span>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border border-white/10",
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
