import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";
import { getUplistingRoom, getUplistingCalendar } from "@/lib/uplisting/client";

const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });

const PRICE_WINDOW_DAYS = 30;

type RoomType = {
  name: string;
  roomId?: string | null;
  image?: ({ alt?: string } & Record<string, unknown>) | null;
  bedConfiguration?: string | null;
  guests: number;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Cheapest available night over the next PRICE_WINDOW_DAYS, straight off
// Uplisting's own calendar — matches how RoomBookingBar derives its
// on-load "from €X / night" figure. Returns null (never a fabricated
// number) when the room isn't PMS-linked or the live lookup fails, so a
// missing price just means no price cell rather than a guess.
async function getFromNightlyPrice(roomId: string): Promise<number | null> {
  try {
    const room = await getUplistingRoom(roomId);
    if (!room) return null;

    const today = new Date();
    const days = await getUplistingCalendar(room.id, toISODate(today), toISODate(addDays(today, PRICE_WINDOW_DAYS)));
    const availableRates = days.filter((d) => d.available).map((d) => d.dayRate);
    return availableRates.length > 0 ? Math.min(...availableRates) : null;
  } catch {
    return null;
  }
}

function GuestIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7v1H4v-1Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block flex-none text-forest-green/60"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export async function RoomTypesTable({ slug, roomTypes }: { slug: string; roomTypes?: RoomType[] | null }) {
  if (!roomTypes || roomTypes.length === 0) return null;

  const prices = await Promise.all(
    roomTypes.map((room) => (room.roomId ? getFromNightlyPrice(room.roomId) : Promise.resolve(null)))
  );

  return (
    <div className="overflow-hidden rounded-[10px] border border-sage-grey/40">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-forest-green">
            <th className="px-6 py-4 text-sm font-semibold text-cream">Room type</th>
            <th className="w-40 border-l border-cream/15 px-6 py-4 text-sm font-semibold text-cream">
              Number of guests
            </th>
            <th className="w-36 border-l border-cream/15 px-6 py-4 text-sm font-semibold text-cream">Price</th>
            <th className="w-10 border-l border-cream/15 px-3 py-4" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {roomTypes.map((room, i) => {
            // Sanity's roomTypes[].roomId isn't always filled in (it's an
            // optional PMS-linking field) — only rows with one can lead
            // anywhere, since /stays/[slug]/rooms/[roomId] needs it to look
            // up the Uplisting listing.
            const href = room.roomId ? `/stays/${slug}/rooms/${room.roomId}` : null;
            const fromNightly = prices[i];

            const nameCell = (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                {room.image && (
                  <div className="relative h-32 w-full flex-none overflow-hidden rounded-[8px] sm:h-16 sm:w-20">
                    <Image
                      src={urlFor(room.image).width(200).height(160).url()}
                      alt={room.image.alt ?? room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className={`mb-1.5 text-base font-semibold text-forest-green ${poppins.className}`}>
                    {room.name}
                  </p>
                  {room.bedConfiguration && (
                    <p className="text-sm text-near-black/70">{room.bedConfiguration}</p>
                  )}
                </div>
              </div>
            );

            const guestsCell =
              room.guests <= 2 ? (
                <span className="inline-flex items-center gap-1">
                  {Array.from({ length: room.guests }).map((_, g) => (
                    <GuestIcon key={g} />
                  ))}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <GuestIcon />x {room.guests}
                </span>
              );

            const priceCell =
              fromNightly !== null ? (
                <span className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className={`text-base font-semibold text-forest-green ${poppins.className}`}>
                    €{fromNightly.toFixed(0)}
                  </span>
                  <span className="text-xs text-near-black/60">/ night</span>
                </span>
              ) : (
                <span className="text-sm text-near-black/50">—</span>
              );

            return (
              <tr
                key={i}
                className={[
                  i !== 0 ? "border-t border-sage-grey/40" : "",
                  href ? "cursor-pointer transition-colors hover:bg-light-forest-green/30" : "",
                ].join(" ")}
              >
                <td className="px-6 py-5">
                  {href ? (
                    <Link href={href} className="contents">
                      {nameCell}
                    </Link>
                  ) : (
                    nameCell
                  )}
                </td>
                <td className="border-l border-sage-grey/40 px-6 py-5 text-near-black">
                  {href ? (
                    <Link href={href} className="contents">
                      {guestsCell}
                    </Link>
                  ) : (
                    guestsCell
                  )}
                </td>
                <td className="border-l border-sage-grey/40 px-6 py-5">
                  {href ? (
                    <Link href={href} className="contents">
                      {priceCell}
                    </Link>
                  ) : (
                    priceCell
                  )}
                </td>
                <td className="border-l border-sage-grey/40 px-3 py-5 text-center">
                  {href ? (
                    <Link href={href} className="contents">
                      <ChevronIcon />
                    </Link>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
