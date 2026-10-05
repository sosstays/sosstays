import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { AccountBookings, type AccountBooking } from "@/app/account/AccountBookings";

type BookingRow = {
  id: string;
  check_in: string;
  check_out: string;
  status: string | null;
  revenue: number | null;
  uplisting_reservation_id: string;
  properties: { name: string } | null;
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  // RLS scopes every query below to the signed-in guest's own rows — see
  // migration 0008 ("guests read own profile/bookings").
  const { data: guest } = await supabase
    .from("guests")
    .select("first_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, status, revenue, uplisting_reservation_id, properties(name)")
    .order("check_in", { ascending: false })
    .returns<BookingRow[]>();

  const today = new Date().toISOString().slice(0, 10);
  const toCard = (b: BookingRow): AccountBooking => ({
    id: b.id,
    propertyName: b.properties?.name ?? "Property",
    checkIn: b.check_in,
    checkOut: b.check_out,
    status: b.status ?? "confirmed",
    revenue: b.revenue,
    reference: b.uplisting_reservation_id,
  });
  const bookings = (bookingsData ?? []).map(toCard);
  const upcoming = bookings.filter((b) => b.checkOut >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.checkOut < today || b.status === "cancelled");

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream font-sans text-near-black">
      <header className="flex items-center justify-between border-b border-border-subtle px-8 py-[22px] sm:px-14">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-[26px] w-auto text-forest-green" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-near-black/60">{user.email}</span>
          <form action="/account/logout" method="post">
            <button type="submit" className="text-sm font-semibold text-near-black/60 underline-offset-4 hover:text-near-black hover:underline">
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="relative overflow-hidden border-b border-border-subtle">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "url('/images/sos-mark-pattern.svg')",
            backgroundSize: "150px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/60 to-cream" />
        <div className="relative mx-auto max-w-4xl px-8 pt-11 pb-8 sm:px-14">
          <h1 className="mb-2 font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] font-extrabold tracking-tight text-near-black">
            {guest?.first_name ? `Your breaks, ${guest.first_name}` : "Your breaks"}
          </h1>
          <p className="text-lg text-near-black/70">Everywhere you&apos;ve been out, and where you&apos;re headed next.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 pt-7 pb-24 sm:px-14">
        <AccountBookings upcoming={upcoming} past={past} />
      </div>
    </main>
  );
}
