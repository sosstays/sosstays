import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";
import { portableTextToPlain } from "@/sanity/portableText";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

type SanityImage = Record<string, unknown>;

export type HomeArea = {
  _id: string;
  areaName: string;
  slug: string;
  heroImage?: SanityImage | null;
  introduction?: unknown;
};

// Homepage "Where to start": the area guides as a list of large names on a
// sage band, each row linking to its guide. Replaces the photo carousel the
// homepage used before — every area is visible at once instead of one at a
// time.
export function HomeAreaList({ areas, id = "areas" }: { areas: HomeArea[]; id?: string }) {
  if (areas.length === 0) return null;

  return (
    <section id={id} className="bg-pale-sage px-8 py-24 sm:px-14 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <Eyebrow className="mb-3" tone="forest" delay={0}>
            The places
          </Eyebrow>
          <Reveal as="h2" delay={100} className="font-serif text-4xl font-bold tracking-tight text-forest-green sm:text-6xl">
            Where to start
          </Reveal>
          <Reveal as="p" delay={200} className="mx-auto mt-4 max-w-[40ch] text-near-black/65">
            Every stay comes with an area guide from people who know the place.
          </Reveal>
        </div>

        <ul className="border-t border-forest-green/30">
          {areas.map((area, i) => (
            <Reveal as="li" key={area._id} delay={i * 70} className="border-b border-forest-green/30">
              <Link
                href={`/areas/${area.slug}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:gap-8"
              >
                <h3 className="font-serif text-3xl leading-[1.05] font-bold tracking-tight text-deep-forest transition-transform duration-300 group-hover:translate-x-1.5 sm:text-5xl">
                  {area.areaName}
                </h3>
                {area.introduction ? (
                  <p className="hidden text-[15px] leading-relaxed text-near-black/65 md:block">
                    {portableTextToPlain(area.introduction as never, 130)}
                  </p>
                ) : (
                  <span className="hidden md:block" />
                )}
                {area.heroImage && (
                  <span className="relative block h-[70px] w-[100px] shrink-0 overflow-hidden rounded-[14px] sm:h-[84px] sm:w-[124px]">
                    <Image
                      src={urlFor(area.heroImage).width(372).height(252).url()}
                      alt=""
                      fill
                      sizes="124px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Button link="/areas" variant="primary" bgColor="forest-green" color="cream">
            View all areas
          </Button>
        </div>
      </div>
    </section>
  );
}
