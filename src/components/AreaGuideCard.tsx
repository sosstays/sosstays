import { MediaCard } from "@/components/MediaCard";
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
    <MediaCard
      href={`/areas/${guide.slug}`}
      image={guide.heroImage}
      imageAlt={guide.heroImage?.alt ?? guide.areaName}
      title={guide.areaName}
      body={
        guide.introduction && (
          <p className="mb-3 text-sm leading-relaxed text-near-black/70">
            {portableTextToPlain(guide.introduction, 80)}
          </p>
        )
      }
      footer={<span className="text-sm font-semibold text-forest-green">Explore →</span>}
    />
  );
}
