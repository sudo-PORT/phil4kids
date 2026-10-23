// Preserve application settings and send optional source maps only to our GlitchTip instance.
import { withSentryConfig } from "@sentry/nextjs/config";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const monitoredConfig = withSentryConfig({ ...nextConfig }, {
  sentryUrl: "https://bug.sudoport.de",
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
    disable: !(
      process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT
    ),
  },
});

// GitHub Pages injects export/basePath/images into this plain configuration object.
// Give Sentry a separate copy so its webpack closure cannot recurse after assignment.
Object.assign(nextConfig, monitoredConfig);
export default nextConfig;
