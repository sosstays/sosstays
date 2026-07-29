import { PortableText } from "next-sanity";

export function LandlordPageContent({ page }: { page: any }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold text-[#1C1C1C]">{page.heroStatement}</h1>

      {page.proofPoints?.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {page.proofPoints.map((point: string, i: number) => (
            <li key={i} className="rounded-md bg-[#E8F5F0] px-4 py-3 text-sm text-[#0F6E56]">
              {point}
            </li>
          ))}
        </ul>
      )}

      {page.body && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <PortableText value={page.body} />
        </div>
      )}

      {page.ctaUrl && (
        <a
          href={page.ctaUrl}
          className="mt-8 inline-block rounded-md bg-[#0F6E56] px-6 py-3 font-medium text-white hover:bg-[#0A5540]"
        >
          {page.ctaLabel || "Send your SOS"}
        </a>
      )}
    </main>
  );
}
