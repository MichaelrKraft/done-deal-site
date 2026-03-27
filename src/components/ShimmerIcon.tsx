"use client";

import { ReactNode } from "react";

interface ShimmerIconProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export default function ShimmerIcon({
  children,
  className = "",
  size = "md",
  color = "#00BEFF",
}: ShimmerIconProps) {
  return (
    <div className={`shimmer-icon relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg
        className={`${sizeMap[size]}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </div>
  );
}

// Pre-built icon paths as components
export function IconDollarCross({ color = "#ef4444" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      <line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="2" />
    </ShimmerIcon>
  );
}

export function IconAlertTriangle({ color = "#ef4444" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </ShimmerIcon>
  );
}

export function IconClock({ color = "#ef4444" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </ShimmerIcon>
  );
}

export function IconBarChart({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </ShimmerIcon>
  );
}

export function IconTrendingUp({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </ShimmerIcon>
  );
}

export function IconCalendar({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </ShimmerIcon>
  );
}

export function IconBell({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </ShimmerIcon>
  );
}

export function IconLayout({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </ShimmerIcon>
  );
}

export function IconStar({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </ShimmerIcon>
  );
}

export function IconCheckCircle({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="lg" color={color}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </ShimmerIcon>
  );
}

export function IconDiamond({ color = "#00BEFF" }: { color?: string }) {
  return (
    <ShimmerIcon size="sm" color={color}>
      <polygon points="12 2 22 12 12 22 2 12" />
    </ShimmerIcon>
  );
}
