import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";
import { portableTextToPlain } from "@/sanity/portableText";

type AreaGuide = {
  _id: string;
  slug: string;
  areaName: string;
  heroImage?: any;
  introduction?: any;
};

export function AreaGuideCard({ guide }: { guide: AreaGuide }) {
  return (
    <Link
      href={`/areas/${guide.slug}`}
      className="group block overflow-hidden rounded-[10px] border border-sage-grey/40 bg-light-forest-green transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {guide.heroImage ? (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={urlFor(guide.heroImage).width(500).height(320).url()}
            alt={guide.heroImage.alt ?? guide.areaName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-40 bg-light-sage/25" />
      )}
      <div className="p-5">
        <h3 className="mb-2 font-serif text-lg font-bold text-forest-green">
          {guide.areaName}
        </h3>
        {guide.introduction && (
          <p className="text-sm leading-relaxed text-near-black/70">
            {portableTextToPlain(guide.introduction, 80)}
          </p>
        )}
      </div>
    </Link>
  );
}
