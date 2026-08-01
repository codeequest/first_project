"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { homePathForRole } from "@/auth.config";
import { mainNav } from "@/lib/site";
import { Logo } from "./logo";
import { ButtonLink, Container, cn } from "./ui";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const signedIn = status === "authenticated";
  // The session is fetched client-side, so hold the space until it resolves
  // rather than flashing "Log in" at someone who is already logged in.
  const sessionLoading = status === "loading";
  const dashboardHref = homePathForRole(session?.user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page behind the mobile menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-white/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between gap-6 py-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {sessionLoading ? (
              <div aria-hidden="true" className="h-11 w-48" />
            ) : signedIn ? (
              <ButtonLink href={dashboardHref}>My dashboard</ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost">
                  Log in
                </ButtonLink>
                <ButtonLink href="/signup">Get started</ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-line transition-colors hover:bg-brand-50 md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded bg-ink transition-all duration-300",
                  menuOpen ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute top-1.5 left-0 block h-0.5 w-5 rounded bg-ink transition-opacity duration-200",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded bg-ink transition-all duration-300",
                  menuOpen ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-line bg-white md:hidden"
      >
        <Container>
          <nav className="flex flex-col py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-3.5 text-base font-medium text-ink last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 pb-2">
              {signedIn ? (
                <ButtonLink
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                >
                  My dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    variant="secondary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/signup" onClick={() => setMenuOpen(false)}>
                    Get started
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
