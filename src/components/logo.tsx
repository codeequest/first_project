import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "./ui";

/**
 * PLACEHOLDER LOGO.
 *
 * When the real logo file arrives, drop it in /public and replace the <span>
 * mark below with:
 *   <Image src="/logo.svg" alt={site.name} width={132} height={32} priority />
 * Nothing else in the app needs to change.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-base font-black text-white transition-transform duration-300 group-hover:scale-105">
        N
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[17px] font-extrabold tracking-tight",
            tone === "light" ? "text-white" : "text-ink",
          )}
        >
          {site.name}
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            tone === "light" ? "text-white/60" : "text-muted",
          )}
        >
          Training Center
        </span>
      </span>
    </Link>
  );
}
