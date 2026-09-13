import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

type SanityImageWithAlt = { alt?: string } & Record<string, unknown>;

export type SearchResultRoom = {
  name: string;
  roomId?: string;
  image?: SanityImageWithAlt;
  bedConfiguration?: string;
  guests?: number;
  /** Average nightly accommodation rate over the searched dates — omitted when no dates were searched or the rate couldn't be fetched. */
  fromPricePerNight?: number;
};

export type SearchResultCardProps = {
  slug: string;
  name: string;
  location: string;
  sleeps?: number;
  coverImage?: SanityImageWithAlt;
  rooms: SearchResultRoom[];
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

// Carries the search context through as query params so the room detail
// page (/stays/[slug]/rooms/[roomId]) can pick up where the search left
// off (prefilling its own booking link with the same dates/guest count).
function buildRoomHref(
  slug: string,
  roomId: string,
  checkIn?: string,
  checkOut?: string,
  guests?: number
) {
  const params = new URLSearchParams();
  if (checkIn) params.set("check_in", checkIn);
  if (checkOut) params.set("check_out", checkOut);
  if (guests) params.set("guests", String(guests));
  const query = params.toString();
  return `/stays/${slug}/rooms/${roomId}${query ? `?${query}` : ""}`;
}

function RoomRow({
  room,
  href,
  delay,
}: {
  room: SearchResultRoom;
  href: string | null;
  delay: number;
}) {
  const content = (
    <>
      {room.image ? (
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[8px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed small thumbnail, next/image overhead isn't worth it here */}
          <img
            src={urlFor(room.image).width(192).height(160).url()}
            alt={room.image.alt ?? room.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-[8px] bg-light-forest-green text-[11px] text-near-black/40">
          No photo
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-x-2">
          <h4 className="truncate font-serif text-base font-bold text-near-black">{room.name}</h4>
          {room.fromPricePerNight !== undefined && (
            <span className="shrink-0 text-sm font-semibold text-forest-green">
              ~€{room.fromPricePerNight} / night
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-near-black/60">
          {[room.guests ? `Sleeps ${room.guests}` : null, room.bedConfiguration].filter(Boolean).join(" · ")}
        </p>
      </div>
    </>
  );

  const className =
    "sos-room-pop group flex items-center gap-4 rounded-[14px] border border-sage-grey/40 p-3 transition-colors duration-300 hover:border-forest-green hover:bg-light-forest-green/40";
  const style = { animationDelay: `${delay}s` };

  return href ? (
    <Link href={href} className={className} style={style}>
      {content}
    </Link>
  ) : (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

/**
 * A single /search result: property photo + name on the left, its
 * matched available rooms on the right, inside one shared bordered
 * card — so the border visibly grows to contain however many rooms
 * are available, rather than the property summary and room list being
 * two separate boxes side by side.
 *
 * Deliberately not a PropertyCard variant: PropertyCard is a single
 * `<Link>` wrapping the whole card, and can't host each room's own
 * separate link inside it without nesting `<a>` tags.
 */
export function SearchResultCard({
  slug,
  name,
  location,
  sleeps,
  coverImage,
  rooms,
  checkIn,
  checkOut,
  guests,
}: SearchResultCardProps) {
  return (
    <div className="sos-result-card flex flex-col gap-6 overflow-hidden rounded-[18px] border border-sage-grey/40 p-5 shadow-[0_12px_32px_-18px_rgba(63,82,64,0.2)] sm:flex-row">
      <Link href={`/stays/${slug}`} className="group block sm:w-[360px] sm:shrink-0">
        {coverImage ? (
          <div className="relative h-[200px] overflow-hidden rounded-[10px]">
            <Image
              src={urlFor(coverImage).width(900).height(600).url()}
              alt={coverImage.alt ?? name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-[10px] bg-light-forest-green text-near-black/40">
            No photo yet
          </div>
        )}
        <div className="pt-4">
          <p className="mb-2 text-xs tracking-widest text-near-black/55 uppercase">{location}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-lg font-bold text-near-black">{name}</h3>
            {sleeps && (
              <span className="rounded-full bg-light-sage/35 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-forest-green">
                Sleeps {sleeps}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3">
        <p className="text-xs tracking-widest text-near-black/55 uppercase">
          {rooms.length} room{rooms.length === 1 ? "" : "s"} available
        </p>
        {rooms.map((room, index) => (
          <RoomRow
            key={room.roomId}
            room={room}
            delay={1.1 + index * 0.15}
            href={room.roomId ? buildRoomHref(slug, room.roomId, checkIn, checkOut, guests) : null}
          />
        ))}
      </div>
    </div>
  );
}
