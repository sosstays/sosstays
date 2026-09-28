// Inline "message us on WhatsApp" link dropped into the various "nothing
// available" messages (global search, a property's whole-house/room
// search, and RoomBookingBar's pre-booking re-check) — a dead end
// shouldn't be the end of the conversation when staff might be able to
// sort something manually. Renders nothing without a configured URL.
export function WhatsAppContactLink({
  whatsappUrl,
  className = "font-semibold underline underline-offset-2",
}: {
  whatsappUrl?: string;
  className?: string;
}) {
  if (!whatsappUrl) return null;
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={className}>
      message us on WhatsApp
    </a>
  );
}
