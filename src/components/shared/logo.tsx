import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20"
      className={cn("w-auto h-8", className)}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="15"
        fontFamily="Inter, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="url(#logo-gradient)"
      >
        InfoEc
      </text>
    </svg>
  );
}
