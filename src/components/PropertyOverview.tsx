import { Users, BedDouble, DoorClosed, Bath, Home, DoorOpen } from "lucide-react";
import { Button, type ButtonColor } from "@/components/Button";

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
  size: 30,
  stroke: "var(--forest-green)",
  strokeWidth: 2,
};

function GuestsIcon() {
  return <Users {...overviewIconProps} />;
}

function BedsIcon() {
  return <BedDouble {...overviewIconProps} />;
}

function BedroomsIcon() {
  return <DoorClosed {...overviewIconProps} />;
}

function BathroomsIcon() {
  return <Bath {...overviewIconProps} />;
}

// Whole building, booked as one unit — a roofline over full walls.
function HouseIcon() {
  return <Home {...overviewIconProps} />;
}

// A single room within a shared property (e.g. Rathescar's separately
// bookable rooms) — a door, distinct from the whole-house roofline.
function RoomIcon() {
  return <DoorOpen {...overviewIconProps} />;
}

// "Type" covers a mix of PMS-driven values (Entire House, Room) and
// free-text building styles (Cottage, Villa, ...) — only the booking-unit
// ones get their own icon; everything else falls back to the house glyph.
function typeIconFor(type: string) {
  return type.toLowerCase() === "room" ? RoomIcon : HouseIcon;
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
    { label: "Type", value: type, Icon: type ? typeIconFor(type) : HouseIcon },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");

  if (items.length === 0) return null;

  return (
    <div className="mb-10 flex flex-wrap gap-x-14 gap-y-8 border-b border-sage-grey/40 pb-10">
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
