import { Lock } from "lucide-react";

// The "Payment held by Stripe" lock badge shown on both /book's hero header
// and BookingCheckout's card header — same mark, two contexts, so it takes
// a size instead of being copy-pasted with slightly different dimensions.
export function PaymentBadge({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const iconSize = size === "sm" ? 14 : 15;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`flex items-center gap-2 ${textClass} ${className}`}>
      <Lock size={iconSize} strokeWidth={2} />
      Payment held by Stripe
    </span>
  );
}
