import Image from "next/image";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { buildMetadata } from "@/sanity/metadata";
import { HeroNav } from "@/components/HeroNav";
import { ContactForm } from "@/components/ContactForm";
import { ContactPromiseBubble } from "@/components/ContactPromiseBubble";
import { getGuestSiteNavLinks } from "@/lib/navLinks";
import { Reveal } from "@/components/Reveal";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(
    {
      title: "Contact Sos Stays | Drogheda, Co. Louth",
      description:
        "Contact Sos Stays in Drogheda. Email hello@sosstays.com, WhatsApp +353 89 480 1345, or send the form. Irish company, CRO 746631.",
    },
    "/contact",
  );
}

export default async function ContactPage() {
  const [siteSettings, siteNavLinks] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    getGuestSiteNavLinks(),
  ]);

  return (
    <>
      <HeroNav links={siteNavLinks} ctaHref="/#stays" ctaLabel="Find your break" sticky />
      <main className="min-h-screen bg-cream text-near-black">
        <div className="grid grid-cols-1 gap-10 px-5 py-10 sm:px-10 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-24 lg:px-[60px]">
          {/* IMAGE — stacked below the form on smaller screens, to the side on lg+ */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-sage-grey/20 sm:aspect-[16/9] lg:aspect-[4/5]">
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

            <Reveal delay={300} className="mt-6 rounded-2xl bg-pale-sage p-6 sm:p-7">
              <h2 className="font-serif mb-3 text-lg font-bold text-deep-forest">Get in touch</h2>
              <p className="text-[15px] leading-relaxed text-near-black/80">
                Sos Stays Power Rangers Ltd, CRO 746631
                <br />
                The Mill Enterprise Centre
                <br />
                Drogheda, Co. Louth
                <br />
                Ireland
              </p>
              <div className="mt-4 flex items-center gap-5">
                <a
                  href="mailto:hello@sosstays.com"
                  aria-label="Email hello@sosstays.com"
                  className="flex items-center gap-2 font-semibold text-forest-green underline"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
                    <path d="M4.125 4.875h15.75c1.035 0 1.875.84 1.875 1.875v10.5c0 1.035-.84 1.875-1.875 1.875H4.125a1.875 1.875 0 0 1-1.875-1.875V6.75c0-1.035.84-1.875 1.875-1.875Zm-.375 2.415v9.96c0 .207.168.375.375.375h15.75a.375.375 0 0 0 .375-.375V7.29l-7.905 5.27a.75.75 0 0 1-.84 0L3.75 7.29Zm.6-.915 7.65 5.1 7.65-5.1H4.35Z" />
                  </svg>
                  hello@sosstays.com
                </a>
                <a
                  href="https://wa.me/353894801345"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp +353 89 480 1345"
                  className="flex items-center gap-2 font-semibold text-forest-green underline"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4a7.94 7.94 0 0 0-6.9 11.87L4 20l4.24-1.11a7.9 7.9 0 0 0 3.78.96h.01a7.95 7.95 0 0 0 5.6-13.53ZM12.02 18.4a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.58 6.58 0 0 1 10.35-8.05 6.53 6.53 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.69 6.47Zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.43.05-.2-.1-.83-.31-1.58-.98a5.9 5.9 0 0 1-1.1-1.36c-.11-.2 0-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.62 0 .96.7 1.88.8 2.01.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z" />
                  </svg>
                  +353 89 480 1345
                </a>
              </div>
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
