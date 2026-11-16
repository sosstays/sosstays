import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { GoogleReviews, type GoogleReviewsData } from "@/components/GoogleReviews";
import { ReviewScoreCard } from "@/components/ReviewScore";
import { FaqSection } from "@/components/FaqSection";

// Static design preview for the Google reviews section — placeholder data
// only, never indexed. Delete once the live section ships.
export const metadata: Metadata = {
  title: "Design preview: Google reviews",
  robots: { index: false, follow: false },
};

const MAPS_URL = "https://www.google.com/maps";

const PLACEHOLDER: GoogleReviewsData = {
  rating: 4.8,
  reviewCount: 127,
  mapsUrl: MAPS_URL,
  reviews: [
    {
      authorName: "Guest A",
      authorUrl: MAPS_URL,
      rating: 5,
      relativeTime: "2 months ago",
      text: "Placeholder review. We stayed four nights with two kids and the house had everything we needed. The kitchen was properly stocked, the beds were comfortable and the host answered every question within minutes. Check-in was simple and the directions were clear. The garden was a hit with the children and we were ten minutes from the beach. We would happily come back next summer and have already recommended it to friends.",
    },
    {
      authorName: "Guest B",
      authorUrl: MAPS_URL,
      rating: 5,
      relativeTime: "3 months ago",
      text: "Placeholder review. Spotless, quiet and exactly as described. Great base for exploring the area.",
    },
    {
      authorName: "Guest C",
      rating: 4,
      relativeTime: "5 months ago",
      text: "Placeholder review. Lovely house and a very helpful host. The only reason for four stars is that parking was tight for a larger car, but that is a small thing. Everything else was excellent, from the welcome pack to the heating being on when we arrived on a cold evening.",
    },
    {
      authorName: "Guest D",
      authorUrl: MAPS_URL,
      rating: 5,
      relativeTime: "7 months ago",
      text: "Placeholder review. Booked for a family get-together and it could not have gone better.",
    },
    {
      authorName: "Guest E",
      authorUrl: MAPS_URL,
      rating: 3,
      relativeTime: "a year ago",
      text: "Placeholder review. Good location and clean, though the wifi dropped a few times during our stay.",
    },
  ],
};

const FEWER: GoogleReviewsData = { ...PLACEHOLDER, rating: 4.5, reviewCount: 2, reviews: PLACEHOLDER.reviews.slice(1, 3) };

function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto max-w-6xl px-8 pt-10 pb-4 font-mono text-xs tracking-wide text-near-black/60 uppercase sm:px-14">
      {children}
    </p>
  );
}

export default async function GoogleReviewsPreviewPage() {
  // A real property photo for the backdrop, so the preview shows the band
  // the way a stay page would.
  const photo = await client.fetch(
    `*[_type == "propertyPage" && market == $market && defined(gallery[1])][0].gallery[1]`
  );
  const backgroundImageUrl = photo ? urlFor(photo).width(2000).height(1400).url() : null;

  return (
    <main className="overflow-x-hidden bg-cream pb-24 font-sans text-near-black">
      <div className="mx-auto max-w-6xl px-8 pt-12 sm:px-14">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-forest-green">
          Design preview: Google reviews on a stay page
        </h1>
        <p className="mt-2 max-w-2xl text-near-black/70">
          Placeholder data only. Names, ratings and text below are made up.
        </p>
      </div>

      <StateLabel>State 1: normal (five reviews), shown in context</StateLabel>
      <section className="mx-auto max-w-6xl px-8 pb-10 sm:px-14">
        <div className="max-w-[380px]">
          <ReviewScoreCard
            score={9.2}
            reviewCount={48}
            source="Booking.com"
            asOf="2026-11-01"
            categories={[
              { label: "Cleanliness", value: 9.6 },
              { label: "Location", value: 9.1 },
            ]}
            compact
          />
        </div>
      </section>
      <GoogleReviews data={PLACEHOLDER} backgroundImageUrl={backgroundImageUrl} />
      <FaqSection
        heading="Good to know"
        maxWidth="72rem"
        items={[{ question: "Placeholder question, to show the section that follows", answer: "Placeholder answer." }]}
      />

      <StateLabel>State 2: fewer than five reviews</StateLabel>
      <GoogleReviews data={FEWER} backgroundImageUrl={backgroundImageUrl} />

      <StateLabel>State 3: no data (nothing renders between these two lines)</StateLabel>
      <div className="mx-auto max-w-6xl px-8 sm:px-14">
        <hr className="border-sage-grey/40" />
      </div>
      <GoogleReviews data={null} />
      <div className="mx-auto max-w-6xl px-8 pt-4 sm:px-14">
        <hr className="border-sage-grey/40" />
      </div>
    </main>
  );
}
