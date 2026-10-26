import { cn } from "@/lib/utils";

/**
 * Brand mark: a hexagon (pharma / lab) carrying an "E" whose middle stroke
 * runs as an ECG pulse. Gradient fill from brand to brand-deep.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="ems-mark-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      <polygon
        points="16,1.5 28.6,8.75 28.6,23.25 16,30.5 3.4,23.25 3.4,8.75"
        fill="url(#ems-mark-grad)"
        stroke="url(#ems-mark-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* E: spine, top bar, bottom bar */}
      <path d="M10 9.5h2.6v13H10z M10 9.5h11v2.5H10z M10 20h11v2.5H10z" fill="#ffffff" />
      {/* middle stroke as an ECG pulse */}
      <path
        d="M12.6 16h1.9l1.6-3.6 2.2 7.2 1.6-3.6h3.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  className,
  light = false,
}: {
  className?: string;
  /** Render the wordmark for dark backgrounds. */
  light?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
      role="img"
      aria-label="Elite MedSource"
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-bold text-[19px] tracking-tight",
            light ? "text-white" : "text-ink"
          )}
        >
          Elite<span className={light ? "text-white/70" : "text-brand"}>MedSource</span>
        </span>
        <span
          className={cn(
            "text-[9px] font-semibold tracking-[0.22em] uppercase mt-1",
            light ? "text-white/60" : "text-ink-faint"
          )}
        >
          Medical supply
        </span>
      </span>
    </span>
  );
}
