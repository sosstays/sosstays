import Image from "next/image";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { ScrollRevealItem } from "@/components/ScrollRevealItem";
import { GoogleReviewText } from "@/components/GoogleReviewText";

export type GoogleReview = {
  authorName: string;
  authorUrl?: string | null;
  authorPhotoUrl?: string | null;
  rating: number;
  relativeTime?: string | null;
  text?: string | null;
  /** This review on Google Maps. */
  reviewUrl?: string | null;
};

export type GoogleReviewsData = {
  rating: number;
  reviewCount: number;
  mapsUrl: string;
  reviews: GoogleReview[];
};

const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z";

// Five stars with a fractional fill. Purely visual — the rating is always
// given to screen readers as text by the element that wraps this.
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (className: string) => (
    <span className={`flex ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="flex-none">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
  return (
    <span aria-hidden className="relative inline-block flex-none" style={{ width: size * 5, height: size }}>
      {row("text-cream/30")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
        {row("text-cream")}
      </span>
    </span>
  );
}

// Google's required text attribution: the words "Google Maps", unmodified,
// kept on one line, never translated, in a plain sans-serif at normal
// weight in white.
function GoogleMapsAttribution() {
  return (
    <span translate="no" className="font-sans text-sm font-normal tracking-normal whitespace-nowrap text-white not-italic">
      Google Maps
    </span>
  );
}

function Avatar({ review }: { review: GoogleReview }) {
  return review.authorPhotoUrl ? (
    // Plain <img>: the photo is a tiny, already-sized thumbnail served by
    // Google, and width/height reserve its space so nothing shifts.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={review.authorPhotoUrl}
      alt=""
      width={48}
      height={48}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="h-12 w-12 flex-none rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-light-forest-green text-sm font-semibold text-forest-green"
    >
      {review.authorName.charAt(0).toUpperCase()}
    </span>
  );
}

const MAX_REVIEWS = 4;

// "Guest reviews" from Google for a stay page: a full-width photo band with
// frosted-glass review cards (four at most) that build up one by one as the
// page scrolls, ending with all of them on screen. Renders nothing at all when there is no data — no heading, no
// empty box, no error.
export function GoogleReviews({
  data,
  backgroundImageUrl,
  heading = "Hear it from our guests",
}: {
  data?: GoogleReviewsData | null;
  /** One of the property's own photos, shown darkened behind the cards. */
  backgroundImageUrl?: string | null;
  heading?: string;
}) {
  if (!data || !data.rating || data.reviews.length === 0) return null;
  const reviews = data.reviews.slice(0, MAX_REVIEWS);

  return (
    <section
      aria-labelledby="google-reviews-heading"
      className="relative isolate mb-14 bg-deep-forest px-6 py-24 text-cream [clip-path:inset(0)] sm:px-14 sm:py-28"
    >
      {/* The photo is fixed to the viewport and clipped to this section, so
          it holds still while the cards scroll up over it. */}
      {backgroundImageUrl && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
          <Image src={backgroundImageUrl} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-near-black/60" />

      <div className="mx-auto max-w-[760px]">
        <header className="mb-12 text-center sm:mb-16">
          <Reveal
            as="h2"
            id="google-reviews-heading"
            className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-cream sm:text-6xl"
          >
            {heading}
          </Reveal>
          <Reveal delay={120} className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px]">
            <span className="flex items-center gap-2.5">
              <span className="font-serif text-3xl leading-none font-bold" aria-hidden>
                {data.rating.toFixed(1)}
              </span>
              <Stars rating={data.rating} size={20} />
              <span className="sr-only">Rated {data.rating.toFixed(1)} out of 5 on Google Maps.</span>
            </span>
            <span className="text-cream/85">
              {data.reviewCount.toLocaleString("en-IE")} {data.reviewCount === 1 ? "review" : "reviews"}
            </span>
            <span className="flex items-baseline gap-1.5 text-sm text-cream/85">
              Reviews from <GoogleMapsAttribution />
            </span>
          </Reveal>
        </header>

        <ul className="flex flex-col gap-4">
          {reviews.map((review, i) => (
            <ScrollRevealItem
              key={i}
              className="rounded-[16px] border border-cream/15 bg-cream/10 p-6 backdrop-blur-xl"
            >
              <article>
                {review.text && <GoogleReviewText text={review.text} />}
                <footer className="mt-4 flex items-center gap-3.5">
                  <Avatar review={review} />
                  <p className="min-w-0 truncate text-[15px] font-medium text-cream">
                    {review.authorUrl ? (
                      <a
                        href={review.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rounded-[8px] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                      >
                        {review.authorName}
                        <span className="sr-only"> on Google Maps (opens in a new tab)</span>
                      </a>
                    ) : (
                      review.authorName
                    )}
                  </p>
                  <p className="ml-auto flex flex-none flex-col items-end gap-1 text-[13px] text-cream/85 sm:flex-row sm:items-center sm:gap-2.5">
                    <Stars rating={review.rating} size={15} />
                    <span className="sr-only">Rated {review.rating} out of 5.</span>
                    {review.relativeTime &&
                      (review.reviewUrl ? (
                        <a
                          href={review.reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="rounded-[8px] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                        >
                          {review.relativeTime}
                          <span className="sr-only">: view this review on Google Maps (opens in a new tab)</span>
                        </a>
                      ) : (
                        <span>{review.relativeTime}</span>
                      ))}
                  </p>
                </footer>
              </article>
            </ScrollRevealItem>
          ))}
        </ul>

        <p className="mt-6 text-center text-[13px] leading-relaxed text-cream/85">
          Showing the reviews Google ranks as most relevant, unedited. Google doesn&apos;t verify reviews, but removes
          fake content when it finds it.
        </p>

        <Reveal className="mt-8 text-center">
          <Button link={data.mapsUrl} external variant="secondary" color="cream" animateBgColor="cream" animateColor="forest-green" size="sm">
            Read all reviews on Google Maps
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
