"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** The admin panel's segmented pill navigation: current page in solid black. */
export function NavPills({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-1 rounded-full bg-black/[0.04] p-[5px]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center rounded-full px-4 text-xs font-medium whitespace-nowrap transition-colors xl:px-5",
                  active ? "bg-black text-white" : "text-black/55 hover:bg-black/10 hover:text-black",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
