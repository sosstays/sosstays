import Image from "next/image";
import { Poppins, Bricolage_Grotesque } from "next/font/google";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { HeroNav } from "@/components/HeroNav";
import { ContactForm } from "@/components/ContactForm";
import { ContactPromiseBubble } from "@/components/ContactPromiseBubble";
import { SITE_NAV_LINKS } from "@/lib/navLinks";

// This page recreates a specific reference design that calls for Poppins
// throughout — scoped to just this route rather than swapping the site's
// brand fonts (Playfair/Inter, set in layout.tsx) everywhere.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// "Contact Us" heading uses Bricolage Grotesque in the theme's forest-green,
// distinct from the Poppins body copy everywhere else on this page.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const revalidate = 60;

export const metadata = {
  title: "Contact Us | Sos Stays",
  description: "Get in touch with Sos Stays — questions about a stay, or want us to manage your property.",
};

export default async function ContactPage() {
  const siteSettings = await client.fetch(SITE_SETTINGS_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className={`${poppins.className} min-h-screen bg-cream text-near-black`}>
        <div className="grid grid-cols-1 gap-10 px-5 py-10 sm:px-10 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-24 lg:px-[60px]">
          {/* IMAGE — stacked below the form on smaller screens, to the side on lg+ */}
          <div className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage-grey/20 sm:aspect-[16/9] lg:order-1 lg:aspect-[4/5]">
            <Image
              src="https://plus.unsplash.com/premium_photo-1677529485307-34dc32286a21?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Two friends smiling together, warm portrait light"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 35vw, 90vw"
              priority
            />
            <div className="absolute right-4 bottom-4 left-4 z-10 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px]">
              <ContactPromiseBubble />
            </div>
          </div>

          {/* CONTENT */}
          <div className="order-1 lg:order-2">
            <h1 className={`${bricolage.className} mb-5 text-4xl font-bold tracking-tight text-forest-green sm:text-5xl`}>
              Contact Us
            </h1>

            <div className="border-t border-sage-grey/50 pt-12">
              <ContactForm contactEmail={siteSettings?.contactEmail} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
