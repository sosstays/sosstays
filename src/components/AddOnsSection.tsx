import { AddOnsPreview } from "@/components/AddOnsPreview";
import type { CheckoutAddOn } from "@/components/checkout/AddOnSelector";
import { MARKET } from "@/lib/market";

// "Add to your stay" block shared by the property page and each room page.
// Details only — add-ons are chosen and paid for at checkout.
export function AddOnsSection({ addOns, propertyName }: { addOns: CheckoutAddOn[]; propertyName: string }) {
  if (addOns.length === 0) return null;

  return (
    <section id="add-ons" className="mx-auto max-w-6xl scroll-mt-24 px-8 pb-14 sm:px-14">
      <h2 className="mb-2 font-serif text-2xl font-bold tracking-tight text-forest-green">Add to your stay</h2>
      <p className="mb-5 text-[15px] text-near-black/60">
        Optional extras you can add when you book {propertyName}.
      </p>
      <AddOnsPreview addOns={addOns} currency={MARKET === "in" ? "INR" : "EUR"} />
    </section>
  );
}
