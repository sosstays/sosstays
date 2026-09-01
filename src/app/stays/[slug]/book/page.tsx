import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/client";
import { PROPERTY_PAGE_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { BookingFlow } from "@/components/BookingFlow";

type Props = { params: Promise<{ slug: string }> };

export default async function BookPropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await client.fetch(PROPERTY_PAGE_QUERY, { slug });

  if (!property || !property.uplistingPropertyId) notFound();

  return (
    <main className="min-h-screen bg-cream font-sans text-near-black">
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />

      <section className="mx-auto max-w-3xl px-8 py-12 sm:px-14">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-near-black/55">
          <Link href="/" className="hover:text-near-black">
            Home
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={`/stays/${slug}`} className="hover:text-near-black">
            {property.name}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-near-black">Book</span>
        </nav>

        <h1 className="mb-1 font-serif text-3xl leading-tight font-extrabold tracking-tight text-near-black">
          Book {property.name}
        </h1>
        <p className="mb-10 text-[15px] text-near-black/60">{property.location}</p>

        <BookingFlow propertyId={property.uplistingPropertyId} maxGuests={property.sleeps ?? undefined} />
      </section>
    </main>
  );
}
