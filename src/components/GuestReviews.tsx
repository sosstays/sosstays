export type GuestReview = {
  _id: string;
  guestFirstName?: string | null;
  stayMonth?: number | null;
  stayYear?: number | null;
  rating?: number | null;
  text?: string | null;
  source?: "direct" | "google" | "airbnb" | "booking" | null;
  sourceUrl?: string | null;
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Sos Stays guest",
  google: "Google",
  airbnb: "Airbnb",
  booking: "Booking.com",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function stayDate(review: GuestReview) {
  const month = review.stayMonth ? MONTHS[review.stayMonth - 1] : null;
  return [month, review.stayYear].filter(Boolean).join(" ");
}

// Approved guest reviews for a stay page, each labelled with where it was
// left. Renders nothing until a property has at least one.
export function GuestReviews({ reviews }: { reviews?: GuestReview[] | null }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-8 pb-14 sm:px-14">
      <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight text-forest-green">Guest reviews</h2>
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {reviews.map((review) => {
          const label = SOURCE_LABELS[review.source ?? "direct"] ?? review.source;
          const date = stayDate(review);
          return (
            <li key={review._id} className="rounded-[10px] border border-sage-grey/40 p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-near-black">
                  {review.guestFirstName || "Guest"}
                  {date && <span className="font-normal text-near-black/55"> · stayed {date}</span>}
                </p>
                {review.rating ? (
                  <p className="text-sm font-semibold text-forest-green" aria-label={`Rated ${review.rating} out of 5`}>
                    {review.rating}/5
                  </p>
                ) : null}
              </div>
              {review.text && <p className="text-[15px] leading-relaxed text-near-black/80">{review.text}</p>}
              <p className="mt-4 text-xs text-near-black/55">
                {review.source === "direct" ? "Review left directly with " : "Review from "}
                {review.sourceUrl ? (
                  <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {review.source === "direct" ? "Sos Stays" : label}
                  </a>
                ) : review.source === "direct" ? (
                  "Sos Stays"
                ) : (
                  label
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
