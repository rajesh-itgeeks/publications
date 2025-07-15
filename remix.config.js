// Fix: Replace HOST with SHOPIFY_APP_URL to prevent Remix crash during local dev
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_singleFetch: true,
  },
  server: "@remix-run/vercel",
  serverBuildPath: "api/index.js", // ✅ this is the key fix
  serverDependenciesToBundle: ["@shopify/shopify-api"], // only if needed
  dev: {
    port: process.env.HMR_SERVER_PORT || 8002,
  },
};

export default config;
