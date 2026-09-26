// Shown wherever a guest's chosen dates fall short of Uplisting's
// minimum-length-of-stay rule for that check-in — DateGuestsFields' own
// calendar popover (picking an invalid check-out) and RoomBookingBar's
// bottom bar (a stale selection, or the pre-booking re-check). Points the
// guest at WhatsApp rather than just blocking them, since the room may
// still be worth having staff waive the rule for.
export function MinStayNotice({ minNights, whatsappUrl }: { minNights: number; whatsappUrl?: string }) {
  return (
    <div className="rounded-2xl border border-error-red/30 bg-cream p-4 text-left shadow-[0_8px_24px_-8px_rgba(23,25,23,0.25)]">
      <p className="text-sm font-semibold text-near-black">A {minNights}-night minimum applies</p>
      <p className="mt-1 text-[13px] leading-relaxed text-near-black/70">
        {`These dates need a minimum stay of ${minNights} nights. Try adjusting your dates, or reach out to us directly on WhatsApp and we'll help sort something.`}
      </p>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest-green px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-deep-forest"
        >
          Message us on WhatsApp
        </a>
      )}
    </div>
  );
}
