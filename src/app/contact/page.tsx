import Image from "next/image";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { ContactForm } from "@/components/ContactForm";
import { ContactPromiseBubble } from "@/components/ContactPromiseBubble";
import { SITE_NAV_LINKS } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Contact Us | Sos Stays",
      description: "Get in touch with Sos Stays — questions about a stay, or want us to manage your property.",
    },
    "/contact",
  );
}

export default async function ContactPage() {
  const siteSettings = await client.fetch(SITE_SETTINGS_QUERY);

  return (
    <>
      <HeroNav links={SITE_NAV_LINKS} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="min-h-screen bg-cream text-near-black">
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
            <Reveal delay={250} className="absolute right-4 bottom-4 left-4 z-10 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px]">
              <ContactPromiseBubble />
            </Reveal>
          </div>

          {/* CONTENT */}
          <div className="order-1 lg:order-2">
            <Reveal as="h1" className="font-serif mb-5 text-4xl font-bold tracking-tight text-forest-green sm:text-5xl">
              Contact Us
            </Reveal>

            <Reveal delay={150} className="border-t border-sage-grey/50 pt-12">
              <ContactForm contactEmail={siteSettings?.contactEmail} />
            </Reveal>
          </div>
        </div>
      </main>
    </>
  );
}
