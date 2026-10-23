// Capture browser errors before hydration without Replay, sessions or profiling.
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.options";

Sentry.init({
  ...sentryOptions,
  integrations: (integrations) =>
    integrations.filter((integration) => integration.name !== "BrowserSession"),
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
