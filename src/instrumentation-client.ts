// Capture browser errors before hydration using the exact customer project and shared privacy boundary.
import * as Sentry from "@sentry/nextjs";
import { glitchTipOptions } from "./sentry.options";

Sentry.init(glitchTipOptions);
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
