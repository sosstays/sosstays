import { Poppins } from "next/font/google";
import { Button, type ButtonColor } from "@/components/Button";

const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"] });

export function BookNowCta({
  bookingUrl,
  className,
  bgColor,
  color,
  external = true,
  label = "Book now",
}: {
  bookingUrl: string | null;
  className: string;
  bgColor: ButtonColor;
  color: ButtonColor;
  /** False for an internal link (e.g. an in-page anchor) rather than an external booking URL. */
  external?: boolean;
  label?: string;
}) {
  return bookingUrl ? (
    <Button link={bookingUrl} external={external} bgColor={bgColor} color={color} size="custom" className={className}>
      {label}
    </Button>
  ) : (
    <span className={`${className} cursor-not-allowed opacity-60`}>Booking coming soon</span>
  );
}

const overviewIconProps = {
  width: 30,
  height: 30,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "var(--forest-green)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GuestsIcon() {
  return (
    <svg {...overviewIconProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.5 12c2.6.2 4.5 2 4.5 5" />
    </svg>
  );
}

function BedsIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
      <path d="M3 17h18" />
      <path d="M3 19v2M21 19v2" />
      <path d="M7 9V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function BedroomsIcon() {
  return (
    <svg {...overviewIconProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 12h6v8" />
    </svg>
  );
}

function BathroomsIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" />
      <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
      <path d="M8 20v1.5M16 20v1.5" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg {...overviewIconProps}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function PropertyOverview({
  guests,
  beds,
  bedrooms,
  bathrooms,
  type,
}: {
  guests?: number | null;
  beds?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  type?: string | null;
}) {
  const items = [
    { label: "Guests", value: guests, Icon: GuestsIcon },
    { label: "Beds", value: beds, Icon: BedsIcon },
    { label: "Bedrooms", value: bedrooms, Icon: BedroomsIcon },
    { label: "Bathrooms", value: bathrooms, Icon: BathroomsIcon },
    { label: "Type", value: type, Icon: TypeIcon },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  if (items.length === 0) return null;

  return (
    <div className={`${poppins.className} mb-10 flex flex-wrap gap-x-14 gap-y-8 border-b border-sage-grey/40 pb-10`}>
      {items.map(({ label, value, Icon }) => (
        <div key={label} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <Icon />
            <span className="text-base text-near-black">{value}</span>
          </div>
          <span className="text-base text-near-black/55">{label}</span>
        </div>
      ))}
    </div>
  );
}
