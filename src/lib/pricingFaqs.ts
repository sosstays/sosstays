import { COMMISSION_PLAIN, COMMISSION_RANGE, MAINTENANCE_AUTHORITY_EUR } from "@/lib/businessFacts";

// Shown on /pricing and mirrored into its FAQPage schema from this one
// list, so what a search engine reads is exactly what a visitor sees.
// Every figure comes from businessFacts; nothing here promises income.
export const PRICING_FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does Sos Stays charge?",
    answer: `${COMMISSION_PLAIN} Your exact rate depends on property type and location, and we confirm it in writing before you sign. There is no setup fee, no monthly retainer and no booking fee.`,
  },
  {
    question: "When do I pay?",
    answer:
      "Only when your property earns. Commission comes out of booking revenue, so nothing is owed on empty nights.",
  },
  {
    question: "What does the commission cover?",
    answer:
      "Your listing across Airbnb, Booking.com and our own direct booking channel, dynamic pricing, guest messages and check-in support, cleaning coordination, maintenance coordination and a clear monthly statement.",
  },
  {
    question: "Who looks after repairs and cleaning?",
    answer: `We coordinate both. You can keep your own cleaner or use one from our network. We can arrange repairs up to €${MAINTENANCE_AUTHORITY_EUR} without checking with you first. Above that, we call you before doing anything.`,
  },
  {
    question: "Can I still use the property myself?",
    answer:
      "Yes. Block off your own dates whenever you like. There is no minimum commitment, so you stay as long as it works for you.",
  },
  {
    question: "Do I need to register my short-term let?",
    answer:
      "Short-term lets in Ireland need to be registered on the national Short-Term Letting Register, and some properties also need planning permission. We walk you through what applies to your property. Our register guide has the latest dates and steps.",
  },
  {
    question: "What can I expect to earn?",
    answer:
      "We don't promise income. What a property earns depends on its location, size, condition and the season. Our county pages show AirDNA market data for comparable local listings where we have it, and the free earnings estimate uses your own property's details.",
  },
  {
    question: "Which areas do you cover?",
    answer: `We manage short lets across Ireland and Northern Ireland. Pick your county on this page to see local pricing detail. The commission range, ${COMMISSION_RANGE}, is the same everywhere.`,
  },
];
