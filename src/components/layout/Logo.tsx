import { cn } from "@/lib/utils";

/** Brand mark: rounded square with a medical cross. */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="var(--color-brand, #2563eb)" />
      <path
        d="M13.5 8h5v5.5H24v5h-5.5V24h-5v-5.5H8v-5h5.5z"
        fill="#ffffff"
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
      <span
        className={cn(
          "font-display font-bold text-[20px] tracking-tight leading-none",
          light ? "text-white" : "text-ink"
        )}
      >
        Elite<span className={light ? "text-white/70" : "text-brand"}>MedSource</span>
      </span>
    </span>
  );
}
