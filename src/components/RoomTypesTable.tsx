import { Poppins } from "next/font/google";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });

type RoomType = {
  name: string;
  image?: ({ alt?: string } & Record<string, unknown>) | null;
  bedConfiguration?: string | null;
  guests: number;
};

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

export function RoomTypesTable({ roomTypes }: { roomTypes?: RoomType[] | null }) {
  if (!roomTypes || roomTypes.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[10px] border border-sage-grey/40">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-forest-green">
            <th className="px-6 py-4 text-sm font-semibold text-cream">Room type</th>
            <th className="w-48 border-l border-cream/15 px-6 py-4 text-sm font-semibold text-cream">
              Number of guests
            </th>
          </tr>
        </thead>
        <tbody>
          {roomTypes.map((room, i) => (
            <tr key={i} className={i !== 0 ? "border-t border-sage-grey/40" : undefined}>
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  {room.image && (
                    <div className="relative h-16 w-20 flex-none overflow-hidden rounded-[8px]">
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
              </td>
              <td className="border-l border-sage-grey/40 px-6 py-5 text-near-black">
                {room.guests <= 2 ? (
                  <span className="inline-flex items-center gap-1">
                    {Array.from({ length: room.guests }).map((_, g) => (
                      <GuestIcon key={g} />
                    ))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <GuestIcon />x {room.guests}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
