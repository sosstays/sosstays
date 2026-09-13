// The "Payment held by Stripe" lock badge shown on both /book's hero header
// and BookingCheckout's card header — same mark, two contexts, so it takes
// a size instead of being copy-pasted with slightly different dimensions.
export function PaymentBadge({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const iconSize = size === "sm" ? 14 : 15;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`flex items-center gap-2 ${textClass} ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Payment held by Stripe
    </span>
  );
}
