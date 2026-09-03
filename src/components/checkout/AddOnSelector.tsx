import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { formatCurrency } from "@/lib/utils";

export type CheckoutAddOn = {
  _id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: ({ alt?: string } & Record<string, unknown>) | null;
};

// Toggleable extras shown between the guest-details fields and the pay
// button on /stays/[slug]/book — e.g. a Funtasia day-pass package. Purely
// controlled: BookingCheckout owns the selection so it can total the price
// into what actually gets charged.
export function AddOnSelector({
  addOns,
  selectedIds,
  onToggle,
  currency,
}: {
  addOns: CheckoutAddOn[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  currency: string;
}) {
  if (addOns.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-near-black">Add to your stay</span>
      {addOns.map((addOn) => {
        const checked = selectedIds.includes(addOn._id);
        return (
          <label
            key={addOn._id}
            className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3.5 transition-colors ${
              checked ? "border-forest-green bg-light-forest-green/30" : "border-sage-grey/50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(addOn._id)}
              className="mt-1 h-4 w-4 accent-forest-green"
            />
            {addOn.image && (
              <div className="relative h-14 w-14 flex-none overflow-hidden rounded-[6px]">
                <Image
                  src={urlFor(addOn.image).width(112).height(112).url()}
                  alt={addOn.image.alt ?? addOn.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-medium text-near-black">{addOn.name}</span>
                <span className="flex-none text-[15px] text-forest-green">
                  +{formatCurrency(addOn.price, currency)}
                </span>
              </div>
              {addOn.description && (
                <p className="mt-0.5 text-[13px] text-near-black/60">{addOn.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
