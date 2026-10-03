"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/Button";

export type ShopProduct = {
  _id: string;
  kind: "voucher" | "goods";
  name: string;
  tagline: string;
  badge: string;
  price: number;
  unit: string;
  maxQuantity: number;
  image: { src: string; alt: string } | null;
  shortDescription: string;
  description: string;
  includes: string[];
  deliveryNote: string;
  allowStayDelivery: boolean;
  allowAddressDelivery: boolean;
};

export type ShopProperty = { _id: string; name: string; slug: string };

const money = (n: number) => `€${n}`;

export function ShopClient({
  products,
  vouchersBlurb,
  goodsBlurb,
}: {
  products: ShopProduct[];
  vouchersBlurb: string;
  goodsBlurb: string;
}) {
  const [world, setWorld] = useState<"voucher" | "goods">("voucher");
  const [query, setQuery] = useState("");
  const [openProduct, setOpenProduct] = useState<ShopProduct | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.kind === world)
      .filter((p) => !q || `${p.name} ${p.tagline} ${p.shortDescription}`.toLowerCase().includes(q));
  }, [products, world, query]);

  const isVoucherWorld = world === "voucher";

  return (
    <section
      className="relative transition-colors duration-500"
      style={{ background: isVoucherWorld ? "#22301f" : "#e4ebd9" }}
    >
      <div
        className="sticky top-0 z-40 border-b px-8 py-5 backdrop-blur-md transition-colors duration-500 sm:px-14"
        style={{
          background: isVoucherWorld ? "rgba(34,48,31,0.93)" : "rgba(228,235,217,0.94)",
          borderColor: isVoucherWorld ? "rgba(254,254,227,0.22)" : "rgba(74,93,72,0.2)",
        }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-5">
          <div
            className="flex gap-1.5 rounded-full border p-1.5"
            style={{
              borderColor: isVoucherWorld ? "rgba(254,254,227,0.22)" : "rgba(74,93,72,0.2)",
              background: isVoucherWorld ? "rgba(254,254,227,0.08)" : "rgba(254,254,227,0.75)",
            }}
          >
            <button
              type="button"
              onClick={() => setWorld("voucher")}
              className="rounded-full px-6 py-3 text-[14.5px] font-semibold transition-colors duration-300"
              style={{
                background: isVoucherWorld ? "#acc196" : "transparent",
                color: isVoucherWorld ? "#22301f" : "rgba(34,48,31,0.72)",
              }}
            >
              eVouchers
            </button>
            <button
              type="button"
              onClick={() => setWorld("goods")}
              className="rounded-full px-6 py-3 text-[14.5px] font-semibold transition-colors duration-300"
              style={{
                background: isVoucherWorld ? "transparent" : "#4a5d48",
                color: isVoucherWorld ? "rgba(254,254,227,0.72)" : "#fefee3",
              }}
            >
              Real things
            </button>
          </div>

          <div className="relative max-w-[420px] flex-1" style={{ minWidth: "260px" }}>
            <Search
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 opacity-60"
              color="#4a5d48"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the shop…"
              aria-label="Search the shop"
              className="w-full rounded-xl border border-forest-green/30 bg-cream py-3.5 pr-4.5 pl-11 text-[15px] text-near-black outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(172,193,150,0.55)]"
            />
          </div>

          <span
            className="text-[13px] font-semibold tracking-widest uppercase"
            style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
          >
            {list.length} {list.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-8 pt-10 pb-28 sm:px-14">
        <p
          className="mb-8 max-w-[56ch] text-[16.5px] leading-relaxed"
          style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
        >
          {isVoucherWorld ? vouchersBlurb : goodsBlurb}
        </p>

        {list.length === 0 ? (
          <p
            className="my-10 text-[17px]"
            style={{ color: isVoucherWorld ? "rgba(254,254,227,0.68)" : "rgba(34,48,31,0.68)" }}
          >
            Nothing matches that search — try a different word, or switch shelf.
          </p>
        ) : isVoucherWorld ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <VoucherCard key={p._id} product={p} onOpen={() => setOpenProduct(p)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <GoodsCard key={p._id} product={p} onOpen={() => setOpenProduct(p)} />
            ))}
          </div>
        )}
      </div>

      {openProduct && <ProductModal product={openProduct} onClose={() => setOpenProduct(null)} />}
    </section>
  );
}

function VoucherCard({ product, onOpen }: { product: ShopProduct; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex cursor-pointer overflow-hidden rounded-2xl bg-cream text-left shadow-[0_6px_20px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.24)]"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative h-[170px] overflow-hidden bg-pale-sage">
          {product.image && (
            <Image src={product.image.src} alt={product.image.alt || product.name} fill className="object-cover" />
          )}
          <span className="absolute top-3.5 left-3.5 rounded-full bg-deep-forest/90 px-3 py-1.5 text-[11px] font-bold tracking-widest text-cream uppercase">
            {product.badge}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-5 py-5">
          <h3 className="font-serif text-[22px] leading-tight font-bold text-deep-forest">{product.name}</h3>
          <p className="mt-1.5 text-[14px] font-medium text-near-black/55">{product.tagline}</p>
          <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-near-black/72">{product.shortDescription}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-forest-green">
            Details and quantity
          </span>
        </div>
      </div>
      <div className="flex w-[84px] flex-none flex-col items-center justify-center gap-2.5 border-l-2 border-dashed border-forest-green/30 bg-forest-green">
        <span className="font-condensed text-[24px] font-bold text-cream">{money(product.price)}</span>
        <span
          className="font-condensed text-[10px] font-bold tracking-widest text-cream/65 uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Sos eVoucher
        </span>
      </div>
    </div>
  );
}

function GoodsCard({ product, onOpen }: { product: ShopProduct; onOpen: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-forest-green/18 bg-cream text-left shadow-[0_2px_10px_rgba(34,48,31,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(34,48,31,0.18)]"
    >
      <div className="relative h-[210px] overflow-hidden bg-pale-sage">
        {product.image && (
          <Image
            src={product.image.src}
            alt={product.image.alt || product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-cream/95 px-3 py-1.5 text-[11px] font-bold tracking-widest text-deep-forest uppercase">
          {product.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5.5 py-5">
        <div className="flex items-baseline justify-between gap-3.5">
          <h3 className="font-serif text-[21px] leading-tight font-bold text-deep-forest">{product.name}</h3>
          <span className="font-condensed text-[19px] font-bold text-forest-green">{money(product.price)}</span>
        </div>
        <p className="mt-1.5 text-[14px] font-medium text-near-black/55">{product.tagline}</p>
        <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-near-black/72">{product.shortDescription}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-forest-green">
          Details and quantity
        </span>
      </div>
    </article>
  );
}

// The popup is just a look, a description, and a quantity pick — it hands
// off to a dedicated /shop/checkout page (see that route) for the buyer's
// name/contact details and the card entry, rather than swapping in a
// second step inside this same dialog.
function ProductModal({ product, onClose }: { product: ShopProduct; onClose: () => void }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-6">
      <div onClick={onClose} className="absolute inset-0 bg-[rgba(23,28,22,0.62)]" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative grid max-h-[88vh] w-full max-w-[940px] grid-cols-1 overflow-auto rounded-[22px] bg-cream shadow-[0_40px_90px_rgba(23,28,22,0.45)] sm:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="relative min-h-[220px] bg-pale-sage sm:min-h-[340px]">
          {product.image && (
            <Image src={product.image.src} alt={product.image.alt || product.name} fill className="object-cover" />
          )}
          <span className="absolute top-4.5 left-4.5 rounded-full bg-deep-forest/90 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-cream uppercase">
            {product.badge}
          </span>
        </div>

        <div className="px-7 py-8 sm:px-9">
          <div className="flex items-start justify-between gap-4.5">
            <div>
              <h2 className="font-serif text-[30px] leading-[1.05] font-bold text-deep-forest">{product.name}</h2>
              <p className="mt-2 text-[15px] font-medium text-near-black/55">{product.tagline}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full border border-forest-green/30 text-deep-forest transition-colors hover:bg-light-sage/40"
            >
              <X size={17} />
            </button>
          </div>

          <p className="mt-5 text-[15.5px] leading-relaxed text-near-black/75">{product.description}</p>

          <div className="mt-5.5 flex flex-col gap-2.5">
            {product.includes.map((line) => (
              <div key={line} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-near-black/72">
                <span className="mt-2 h-1.75 w-1.75 flex-none rounded-full bg-light-sage" />
                <span>{line}</span>
              </div>
            ))}
          </div>

          <div className="mt-5.5 rounded-xl bg-light-sage/30 px-4.5 py-3.5 text-[14px] leading-relaxed text-deep-forest">
            {product.deliveryNote}
          </div>

          <div className="mt-6 flex items-center gap-3.5">
            <div className="flex items-center gap-1 rounded-full border border-forest-green/30 p-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-deep-forest transition-colors hover:bg-light-sage/45"
              >
                <Minus size={16} />
              </button>
              <span className="font-condensed min-w-[28px] text-center text-[17px] font-bold text-deep-forest">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.maxQuantity, q + 1))}
                aria-label="Increase quantity"
                className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-deep-forest transition-colors hover:bg-light-sage/45"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-[13.5px] text-near-black/55">{product.unit}</span>
            <span className="font-condensed ml-auto text-[24px] font-bold text-deep-forest">
              {money(product.price * qty)}
            </span>
          </div>

          <Button
            type="button"
            onClick={() => router.push(`/shop/checkout?product=${product._id}&qty=${qty}`)}
            variant="primary"
            size="custom"
            className="mt-6 self-start px-8 py-3 text-[15px] font-semibold"
          >
            {`Buy now — ${money(product.price * qty)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
