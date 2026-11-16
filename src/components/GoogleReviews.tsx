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

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="flex-none">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
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
// frosted-glass review cards (four at most) that appear one at a time as
// the page scrolls. Renders nothing at all when there is no data — no heading, no
// empty box, no error.
export function GoogleReviews({
  data,
  backgroundImageUrl,
}: {
  data?: GoogleReviewsData | null;
  /** One of the property's own photos, shown darkened behind the cards. */
  backgroundImageUrl?: string | null;
}) {
  if (!data || !data.rating || data.reviews.length === 0) return null;
  const reviews = data.reviews.slice(0, MAX_REVIEWS);

  return (
    <section
      aria-labelledby="google-reviews-heading"
      className="relative isolate mb-14 bg-deep-forest px-6 text-cream [clip-path:inset(0)] sm:px-14"
      // Room above the first card for the pinned heading, and below the
      // last one so it can travel up into view before the section ends.
      style={{ paddingTop: "62vh", paddingBottom: "18vh" }}
    >
      {/* The photo is fixed to the viewport and clipped to this section, so
          it holds still while the cards scroll up over it. */}
      {backgroundImageUrl && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
          <Image src={backgroundImageUrl} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-near-black/60" />

      {/* The heading is pinned the same way as the photo: fixed to the
          viewport, visible only while this section is behind it. The cards
          then scroll up towards it and fade out before they reach it. */}
      <header className="pointer-events-none fixed inset-x-0 z-10 px-6 text-center" style={{ top: "9vh" }}>
        <h2
          id="google-reviews-heading"
          className="font-serif text-4xl leading-[1.05] font-bold tracking-tight text-cream sm:text-6xl"
        >
          Hear it from our guests
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px]">
          <span className="flex items-center gap-2.5">
            <span className="font-serif text-3xl leading-none font-bold" aria-hidden>
              {data.rating.toFixed(1)}
            </span>
            <Stars rating={data.rating} size={20} />
            <span className="sr-only">Rated {data.rating.toFixed(1)} out of 5 on Google.</span>
          </span>
          <span className="text-cream/85">
            {data.reviewCount.toLocaleString("en-IE")} {data.reviewCount === 1 ? "review" : "reviews"}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-bright-cream px-3 py-1.5 text-[13px] text-near-black">
            <GoogleLogo size={16} />
            Reviews from <span className="font-semibold">Google</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[760px]">
        <ul className="flex flex-col gap-5">
          {reviews.map((review, i) => (
            <ScrollRevealItem
              key={i}
              className="rounded-[16px] border border-cream/15 bg-cream/10 p-6 backdrop-blur-xl sm:p-7"
            >
              <article>
                <p className="mb-3 flex items-center gap-2.5 text-[13px] text-cream/85">
                  <Stars rating={review.rating} size={15} />
                  <span className="sr-only">Rated {review.rating} out of 5.</span>
                  {review.relativeTime && <span>{review.relativeTime}</span>}
                </p>
                {review.text && <GoogleReviewText text={review.text} />}
                <footer className="mt-5 flex items-center gap-3.5">
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
                        <span className="sr-only"> on Google (opens in a new tab)</span>
                      </a>
                    ) : (
                      review.authorName
                    )}
                  </p>
                </footer>
              </article>
            </ScrollRevealItem>
          ))}
        </ul>

        <Reveal className="mt-12 text-center">
          <Button link={data.mapsUrl} external variant="secondary" color="cream" animateBgColor="cream" animateColor="forest-green" size="sm">
            Read all reviews on Google
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
