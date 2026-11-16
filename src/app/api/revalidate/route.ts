import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Called by a Sanity webhook whenever a document is created, updated or
// deleted, so a publish shows up on the site straight away instead of
// waiting out each page's `revalidate` window. Every page (and the
// sitemap) shares the root layout, so revalidating it refreshes the whole
// site — one publish can touch a post, the blog index, a related stay or
// area guide and the sitemap all at once, and the site is small enough
// that regenerating pages on their next visit is cheap.
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: string }>(req, secret);
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");

  return NextResponse.json({ revalidated: true, type: body?._type ?? null, slug: body?.slug ?? null });
}
