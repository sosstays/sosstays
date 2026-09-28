import { client } from "@/sanity/client";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ShopProductRecord = {
  kind: "voucher" | "goods";
  name: string;
  price: number;
  unit: string;
  maxQuantity: number;
};

export async function fetchShopProduct(productId: string): Promise<ShopProductRecord | null> {
  return client.fetch(
    `*[_type == "shopProduct" && _id == $id && enabled != false][0]{ kind, name, price, unit, maxQuantity }`,
    { id: productId }
  );
}

export function validateQuantity(quantity: unknown, product: ShopProductRecord): number | null {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > product.maxQuantity) return null;
  return qty;
}

export type ShopOrderFields = {
  buyerName: unknown;
  buyerEmail: unknown;
  buyerPhone: unknown;
  recipientName: unknown;
  recipientEmail: unknown;
  giftNote: unknown;
  propertySlug: unknown;
  arrivalDate: unknown;
};

export type ShopOrderResult =
  | { ok: true; buyerEmail: string; metadata: Record<string, string> }
  | { ok: false; error: string };

// Full validation for buyer + kind-specific fields, and the metadata a
// human needs to fulfil the order by hand (see shopProduct.ts — there's no
// automated voucher/delivery system yet). Shared between create (called
// with placeholder-free fields not required yet) and finalize (called
// right before payment confirmation, once everything must be present).
export async function buildShopOrderMetadata(
  product: ShopProductRecord,
  productId: string,
  qty: number,
  fields: ShopOrderFields
): Promise<ShopOrderResult> {
  const { buyerName, buyerEmail, buyerPhone, recipientName, recipientEmail, giftNote, propertySlug, arrivalDate } =
    fields;

  if (typeof buyerName !== "string" || !buyerName.trim()) {
    return { ok: false, error: "Let us know your name" };
  }
  if (typeof buyerEmail !== "string" || !EMAIL_PATTERN.test(buyerEmail.trim())) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const metadata: Record<string, string> = {
    orderType: "shop",
    productId,
    productName: product.name,
    productKind: product.kind,
    quantity: String(qty),
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim(),
    buyerPhone: typeof buyerPhone === "string" ? buyerPhone.trim() : "",
  };

  if (product.kind === "goods") {
    if (typeof propertySlug !== "string" || !propertySlug) {
      return { ok: false, error: "Pick which stay this is for" };
    }
    if (typeof arrivalDate !== "string" || !DATE_PATTERN.test(arrivalDate)) {
      return { ok: false, error: "Pick a valid arrival date" };
    }
    // Fulfillment needs at least until 2pm the day before (see
    // shopProduct.deliveryNote) — reject anything not strictly in the
    // future so an order can't land for a stay that's already started.
    const today = new Date().toISOString().slice(0, 10);
    if (arrivalDate <= today) {
      return { ok: false, error: "Arrival date must be in the future" };
    }

    const property = await client.fetch(`*[_type == "propertyPage" && slug.current == $slug][0]{ name }`, {
      slug: propertySlug,
    });
    if (!property) {
      return { ok: false, error: "That property couldn't be found" };
    }

    metadata.propertySlug = propertySlug;
    metadata.propertyName = property.name;
    metadata.arrivalDate = arrivalDate;
  } else {
    if (typeof recipientName === "string" && recipientName.trim()) {
      metadata.recipientName = recipientName.trim();
    }
    if (typeof recipientEmail === "string" && recipientEmail.trim()) {
      if (!EMAIL_PATTERN.test(recipientEmail.trim())) {
        return { ok: false, error: "Enter a valid recipient email" };
      }
      metadata.recipientEmail = recipientEmail.trim();
    }
    if (typeof giftNote === "string" && giftNote.trim()) {
      // Stripe metadata values are capped at 500 characters.
      metadata.giftNote = giftNote.trim().slice(0, 480);
    }
  }

  return { ok: true, buyerEmail: buyerEmail.trim(), metadata };
}
