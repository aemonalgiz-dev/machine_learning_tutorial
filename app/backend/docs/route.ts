// The compute API's interactive documentation loads third-party scripts, which must
// not run on this origin beside the account cookies. These static routes are matched
// before the /backend rewrite, so the pages are never proxied.
export function GET() {
  return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
}
