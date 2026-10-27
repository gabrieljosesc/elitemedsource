import { cn } from "@/lib/utils";

/** Brand colours for the mark and wordmark (navy + clinical green). */
export const LOGO_NAVY = "#0f172a";
export const LOGO_GREEN = "#17956f";
export const LOGO_GREEN_LIGHT = "#34d399";

/**
 * Brand mark: a capsule split on the diagonal — navy lower half, green upper
 * half carrying a white plus. `light` swaps the navy half to white for dark
 * backgrounds.
 */
export function LogoMark({
  size = 32,
  light = false,
  className,
}: {
  size?: number;
  light?: boolean;
  className?: string;
}) {
  const dark = light ? "#ffffff" : LOGO_NAVY;
  const green = light ? LOGO_GREEN_LIGHT : LOGO_GREEN;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g transform="rotate(-45 16 16)">
        {/* lower (navy) half */}
        <path d="M9.5 10.5h5.9v11H9.5a5.5 5.5 0 0 1 0-11z" fill={dark} />
        {/* upper (green) half with plus */}
        <path d="M16.6 10.5h5.9a5.5 5.5 0 0 1 0 11h-5.9z" fill={green} />
        <path
          d="M21.3 13.9v4.2M19.2 16h4.2"
          stroke="#ffffff"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>
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
      className={cn("inline-flex items-center gap-2 select-none", className)}
      role="img"
      aria-label="Elite MedSource"
    >
      <LogoMark light={light} />
      <span
        className={cn(
          "font-display font-bold text-[21px] leading-none tracking-tight",
          light ? "text-white" : "text-[#0f172a]"
        )}
      >
        Elite
        <span style={{ color: light ? LOGO_GREEN_LIGHT : LOGO_GREEN }}>MedSource</span>
      </span>
    </span>
  );
}
