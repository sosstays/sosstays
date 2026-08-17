// One-time setup: registers this app's webhook route for Uplisting's
// `availability_changed` event and prints the secret to store as
// UPLISTING_WEBHOOK_SECRET. Re-running registers a duplicate hook —
// check `GET /hooks` (or the Uplisting dashboard) before re-running.
//
// Usage: UPLISTING_API_KEY=xxx node scripts/register-uplisting-webhook.mjs https://your-site.com/api/webhooks/uplisting

const apiKey = process.env.UPLISTING_API_KEY;
const targetUrl = process.argv[2];

if (!apiKey) {
  console.error("Set UPLISTING_API_KEY in the environment first.");
  process.exit(1);
}
if (!targetUrl) {
  console.error("Usage: node scripts/register-uplisting-webhook.mjs <target-url>");
  process.exit(1);
}

const baseUrl = process.env.UPLISTING_API_BASE_URL || "https://connect.uplisting.io";

const res = await fetch(new URL("/hooks", baseUrl), {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ target_url: targetUrl, event: "availability_changed" }),
});

if (!res.ok) {
  console.error(`Registration failed (${res.status}):`, await res.text());
  process.exit(1);
}

const body = await res.json();
console.log("Registered webhook:", body);
console.log(
  body.secret
    ? `\nStore this as UPLISTING_WEBHOOK_SECRET: ${body.secret}`
    : "\nNo secret in the response — check the Uplisting dashboard for it."
);
