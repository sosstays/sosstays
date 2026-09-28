import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { SHOP_PRODUCT_BY_ID_QUERY, SHOP_DELIVERY_PROPERTIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { Logo } from "@/components/Logo";
import { PaymentBadge } from "@/components/checkout/PaymentBadge";
import { ShopCheckoutForm } from "@/components/shop/ShopCheckoutForm";
import type { ShopProduct } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Checkout | Sos Stays",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ product?: string; qty?: string }>;
};

const shell = (children: React.ReactNode) => (
  <main className="min-h-screen overflow-x-hidden bg-cream font-sans text-near-black">
    <div className="bg-deep-forest">
      <header className="flex items-center justify-between px-8 py-[22px] sm:px-14">
        <Link href="/" className="flex items-center">
          <Logo className="h-[30px] w-auto text-cream" />
        </Link>
        <PaymentBadge className="text-sage-300" />
      </header>
    </div>
    <section className="mx-auto max-w-3xl px-8 pt-10 pb-20 sm:px-14">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-near-black/55">
        <Link href="/shop" className="hover:text-near-black">
          Shop
        </Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-near-black">Checkout</span>
      </nav>
      {children}
    </section>
  </main>
);

export default async function ShopCheckoutPage({ searchParams }: Props) {
  const { product: productId, qty: qtyParam } = await searchParams;

  if (!productId) {
    return shell(
      <p className="text-near-black/70">
        Pick something from the{" "}
        <Link href="/shop" className="text-forest-green underline">
          shop
        </Link>{" "}
        first.
      </p>
    );
  }

  const raw = await client.fetch(SHOP_PRODUCT_BY_ID_QUERY, { id: productId });
  if (!raw) {
    return shell(
      <p className="text-near-black/70">
        This item isn&apos;t available anymore.{" "}
        <Link href="/shop" className="text-forest-green underline">
          Back to the shop
        </Link>
        .
      </p>
    );
  }

  const product: ShopProduct = {
    ...raw,
    image: raw.image ? { src: urlFor(raw.image).width(700).url(), alt: raw.image.alt ?? raw.name } : null,
  };

  const properties = product.kind === "goods" ? await client.fetch(SHOP_DELIVERY_PROPERTIES_QUERY) : [];

  const qtyRaw = Number(qtyParam);
  const initialQuantity =
    Number.isInteger(qtyRaw) && qtyRaw >= 1 && qtyRaw <= product.maxQuantity ? qtyRaw : 1;

  return shell(
    <>
      <div className="mb-8 flex items-center gap-4 rounded-[14px] border border-sage-grey/25 bg-bright-cream p-4">
        {product.image ? (
          <div className="relative h-16 w-16 flex-none overflow-hidden rounded-[10px]">
            <Image src={product.image.src} alt={product.image.alt} fill className="object-cover" />
          </div>
        ) : null}
        <div>
          <span className="text-[11px] font-bold tracking-widest text-forest-green/70 uppercase">
            {product.badge}
          </span>
          <h1 className="font-serif text-xl font-bold text-deep-forest">{product.name}</h1>
          <p className="text-[13.5px] text-near-black/55">{product.tagline}</p>
        </div>
      </div>

      <ShopCheckoutForm product={product} properties={properties} initialQuantity={initialQuantity} />
    </>
  );
}
