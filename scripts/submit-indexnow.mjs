// Submits every URL in the live sitemap to IndexNow (api.indexnow.org), which
// fans out to Bing, Yandex and other participating search engines so they
// pick up new/changed pages without waiting on their own crawl schedule.
//
// Run after deploying (the key file must already be live at the site root):
//   node scripts/submit-indexnow.mjs
//   node scripts/submit-indexnow.mjs https://sosstays.in   (another market)
//   node scripts/submit-indexnow.mjs https://sosstays.com /blog/some-post /stays/some-slug
//     (submit specific URLs instead of the whole sitemap)

const KEY = "51c19d85331c921c4338847eb1772de8";

const args = process.argv.slice(2);
const host = (args[0] && args[0].startsWith("http") ? args[0] : "https://sosstays.com").replace(/\/$/, "");
const explicitPaths = args[0] && args[0].startsWith("http") ? args.slice(1) : args;

async function getSitemapUrls() {
  const res = await fetch(`${host}/sitemap.xml`);
  if (!res.ok) throw new Error(`Failed to fetch ${host}/sitemap.xml: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const urlList = explicitPaths.length > 0 ? explicitPaths.map((p) => new URL(p, host).toString()) : await getSitemapUrls();

  if (urlList.length === 0) {
    console.error("No URLs to submit.");
    process.exit(1);
  }

  const hostName = new URL(host).host;
  const body = {
    host: hostName,
    key: KEY,
    keyLocation: `${host}/${KEY}.txt`,
    urlList,
  };

  console.log(`Submitting ${urlList.length} URL(s) for ${hostName} to IndexNow…`);

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  console.log(`Response: ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
