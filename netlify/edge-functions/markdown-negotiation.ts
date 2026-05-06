// P2 PLACEHOLDER - Markdown Content Negotiation Edge Function
// Status: NOT ACTIVE - requires Phase 2 implementation
//
// Purpose: Serve markdown version of content when client sends Accept: text/markdown header
// Use case: AI agents requesting raw markdown instead of HTML SPA
//
// TODO Phase 2:
// 1. Prerender markdown versions of key pages to /api/md/<route>.md during build
//    (e.g. /api/md/index.md, /api/md/programpartnerski.md)
// 2. Uncomment _redirects rule:
//    /* /netlify/functions/markdown-negotiation 200! Accept=text/markdown
// 3. Implement this edge function to serve prerendered .md files
// 4. Add build step in package.json: "build:md" that runs scripts/generate-md-variants.mjs
//
// Deno / Netlify Edge Function runtime

// import type { Context } from "https://edge.netlify.com";
//
// export default async function handler(req: Request, context: Context): Promise<Response> {
//   const accept = req.headers.get("accept") ?? "";
//   const url = new URL(req.url);
//
//   if (!accept.includes("text/markdown")) {
//     return context.next();
//   }
//
//   const mdPath = `/api/md${url.pathname === "/" ? "/index" : url.pathname}.md`;
//   const mdUrl = new URL(mdPath, req.url);
//   const mdResponse = await fetch(mdUrl.toString());
//
//   if (!mdResponse.ok) {
//     return context.next();
//   }
//
//   const mdContent = await mdResponse.text();
//   return new Response(mdContent, {
//     headers: {
//       "Content-Type": "text/markdown; charset=utf-8",
//       "Cache-Control": "public, max-age=3600",
//       "Vary": "Accept",
//     },
//   });
// }
//
// export const config = { path: "/*" };

export default function placeholder() {
  // Placeholder - not active
  // Remove this file and uncomment above when Phase 2 is implemented
}
