import type { CountyFaq, Region } from "@/lib/pricingCounties";

// The template every county page's FAQ section is built from — generic
// enough to hold for any county with just the name swapped in, so every
// county gets a real FAQ section even without its own Sanity content.
// A county that needs something beyond this (a local quirk, a different
// register rule) gets it added as extra faqs on its countyPricingStats
// document in Sanity — CountyPageContent appends those after this set
// rather than replacing it.
export function buildGenericCountyFaqs(countyName: string, region: Region): CountyFaq[] {
  const registrationFaq: CountyFaq =
    region === "roi"
      ? {
          question: `Do I need to register my ${countyName} property for short-term letting?`,
          answer:
            "Ireland's Short-Term Letting Register opens for registration on 1 December 2026, with a compliance deadline of 31 December 2026. We'll guide you through what's needed as your registration date approaches.",
        }
      : {
          question: `Do I need certification for my ${countyName} property?`,
          answer:
            "In Northern Ireland, tourist accommodation must be certified by Tourism NI. We'll guide you through certification as part of onboarding.",
        };

  return [
    {
      question: `How much does SOS Stays charge in Co. ${countyName}?`,
      answer:
        "Commission starts from 15% of gross rental revenue (nightly rate, not cleaning fees), varying by property type and exact location. No setup fee or monthly retainer — you only pay when the property earns.",
    },
    registrationFaq,
    {
      question: "What's included in the commission?",
      answer:
        "Listing across Airbnb, Booking.com and our own direct booking channel, dynamic pricing, guest communication and check-in support, cleaning coordination, and clear monthly statements — end to end.",
    },
    {
      question: "Do I need to find my own cleaner?",
      answer: "No — keep your existing cleaner if you'd like, or we can source one from our network.",
    },
    {
      question: "Can I still use the property myself?",
      answer: "Yes. Block off personal-use dates any time you like. There's no minimum commitment.",
    },
    {
      question: "What happens after I get in touch?",
      answer:
        "A short call, then an in-person walkthrough, a plain-terms agreement, and handover — your listing typically goes live within about a week.",
    },
  ];
}

// A county's Sanity faqs are meant to be additions on top of the generic
// template, but nothing stops someone re-entering a question the template
// already covers (as happened when the template was written from Louth's
// existing Sanity content) — drop any Sanity faq whose question already
// appears in the generic set rather than showing it twice.
export function mergeCountyFaqs(generic: CountyFaq[], fromSanity: CountyFaq[]): CountyFaq[] {
  const genericQuestions = new Set(generic.map((f) => f.question.trim().toLowerCase()));
  const extra = fromSanity.filter((f) => !genericQuestions.has(f.question.trim().toLowerCase()));
  return [...generic, ...extra];
}
