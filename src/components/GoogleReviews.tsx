import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
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
      {row("text-sage-grey/45")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
        {row("text-forest-green")}
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
      width={40}
      height={40}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="h-10 w-10 flex-none rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-light-forest-green text-sm font-semibold text-forest-green"
    >
      {review.authorName.charAt(0).toUpperCase()}
    </span>
  );
}

// "Guest reviews" from Google for a stay page. Renders nothing at all when
// there is no data — no heading, no empty box, no error.
export function GoogleReviews({ data }: { data?: GoogleReviewsData | null }) {
  if (!data || !data.rating || data.reviews.length === 0) return null;
  const reviews = data.reviews.slice(0, 5);

  return (
    <section aria-labelledby="google-reviews-heading" className="mx-auto max-w-6xl px-8 pb-14 sm:px-14">
      {/* One row that scrolls sideways on phones, a three-column grid from
          md up. The summary takes the first cell, so five reviews fill two
          even rows of three. */}
      <ul className="-mx-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
        <li className="relative flex w-[85%] flex-none snap-start flex-col rounded-[16px] bg-light-forest-green p-7 md:w-auto">
          <Eyebrow className="mb-2.5" tone="forest">Guest reviews</Eyebrow>
          <h2 id="google-reviews-heading" className="font-serif text-2xl font-bold tracking-tight text-forest-green">
            What guests say on Google
          </h2>
          <p className="mt-5 flex items-end gap-3">
            <span className="font-serif text-6xl leading-none font-bold tracking-tight text-forest-green" aria-hidden>
              {data.rating.toFixed(1)}
            </span>
            <span className="pb-1">
              <Stars rating={data.rating} size={20} />
              <span className="sr-only">Rated {data.rating.toFixed(1)} out of 5 on Google.</span>
              <span className="mt-1 block text-sm text-near-black/70">
                {data.reviewCount.toLocaleString("en-IE")} {data.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </span>
          </p>
          <p className="mt-5 flex items-center gap-2 text-[13px] text-near-black/70">
            <GoogleLogo />
            <span>
              Reviews from <span className="font-semibold text-near-black">Google</span>
            </span>
          </p>
          <div className="mt-auto pt-7">
            <Button link={data.mapsUrl} external variant="secondary" size="sm">
              Read all reviews on Google
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </div>
        </li>

        {reviews.map((review, i) => (
          <li
            key={i}
            className="relative w-[85%] flex-none snap-start rounded-[16px] border border-border-subtle bg-bright-cream p-6 shadow-[0_-4px_16px_0_rgba(23,25,23,0.04)] md:w-auto"
          >
            <article>
              <header className="mb-4 flex items-center gap-3">
                <Avatar review={review} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-near-black">
                    {review.authorUrl ? (
                      <a
                        href={review.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline-offset-2 hover:underline"
                      >
                        {review.authorName}
                        <span className="sr-only"> on Google (opens in a new tab)</span>
                      </a>
                    ) : (
                      review.authorName
                    )}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-near-black/65">
                    <Stars rating={review.rating} size={13} />
                    <span className="sr-only">Rated {review.rating} out of 5.</span>
                    {review.relativeTime && <span>{review.relativeTime}</span>}
                  </p>
                </div>
                <span className="ml-auto self-start" title="Posted on Google">
                  <GoogleLogo size={16} />
                  <span className="sr-only">Posted on Google</span>
                </span>
              </header>
              {review.text && <GoogleReviewText text={review.text} />}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
