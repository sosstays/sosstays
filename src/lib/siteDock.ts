import "server-only";
import { client } from "@/sanity/client";
import { DOCK_AREAS_QUERY } from "@/sanity/queries";
import { filterLinksForMarket } from "@/lib/marketLinks";
import type { DockMenu } from "@/components/home/HomeDock";

type CmsDockMenu = {
  label?: string | null;
  links?: { label?: string | null; href?: string | null; note?: string | null }[] | null;
};

// The site-wide bottom menu's content: the menus set in the Sanity
// "Homepage" document (dockMenus) when there are any, otherwise the
// defaults below. Either way the links are market-filtered and a menu left
// with no links is dropped. Called from the root layout, which already has
// the Homepage document in hand and passes its menus in.
export async function getDockMenus(cmsDockMenus: CmsDockMenu[] | null | undefined): Promise<DockMenu[]> {
  const cmsMenus: DockMenu[] = (cmsDockMenus ?? [])
    .filter((menu) => menu?.label)
    .map((menu) => ({
      label: menu.label!,
      links: (menu.links ?? [])
        .filter((link) => link?.label && link?.href)
        .map((link) => ({ label: link.label!, href: link.href!, note: link.note })),
    }));

  let menus = cmsMenus;
  if (menus.length === 0) {
    const areas = await client.fetch<{ areaName: string; slug: string }[]>(DOCK_AREAS_QUERY);
    menus = [
      {
        label: "Stays",
        links: [
          { label: "Browse all stays", href: "/stays" },
          { label: "Check availability", href: "/search", note: "Dates and guests" },
          { label: "Gift vouchers", href: "/shop", note: "From the shop" },
          { label: "Bespoke Ireland trip", href: "/bespoke-ireland-trip" },
        ],
      },
      {
        label: "Areas",
        links: [
          ...(areas ?? []).map((area) => ({ label: area.areaName, href: `/areas/${area.slug}`, note: "Guide" })),
          { label: "All area guides", href: "/areas" },
        ],
      },
      {
        label: "Owners",
        links: [
          { label: "Property management", href: "/landlords" },
          { label: "Pricing", href: "/pricing" },
          { label: "Revenue estimate", href: "/landlords#calculator", note: "Calculator" },
          { label: "List for corporate stays", href: "/corporate-stays/list-your-property" },
        ],
      },
      {
        label: "More",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Corporate stays", href: "/corporate-stays" },
          { label: "Partners", href: "/partners" },
          { label: "Contact us", href: "/contact" },
        ],
      },
    ];
  }

  return (
    await Promise.all(menus.map(async (menu) => ({ ...menu, links: await filterLinksForMarket(menu.links) })))
  ).filter((menu) => menu.links.length > 0);
}
