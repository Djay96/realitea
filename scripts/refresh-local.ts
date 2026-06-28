/**
 * Triggers the manual refresh endpoint against a locally running dev server.
 * Usage: `netlify dev` in one terminal, then `npm run refresh:local` in another.
 */
const base = process.env.LOCAL_URL || "http://localhost:8888";
const token = process.env.REFRESH_TOKEN || "change-me-to-a-random-string";

async function main() {
  const res = await fetch(`${base}/api/refresh`, {
    method: "POST",
    headers: { "x-refresh-token": token },
  });
  const body = await res.text();
  console.log(`HTTP ${res.status}`);
  console.log(body);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
