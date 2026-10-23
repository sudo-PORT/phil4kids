// Initialize error-only diagnostics with the same customer routing/privacy boundary in every runtime.
import * as Sentry from "@sentry/nextjs";
import { glitchTipOptions } from "./sentry.options";

Sentry.init(glitchTipOptions);
