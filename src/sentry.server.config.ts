// Initialize server error capture only when this customer's public DSN is configured.
import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.options";

Sentry.init(sentryOptions);
