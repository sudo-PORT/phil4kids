// Shared runtime error settings; public DSN selects the customer project without build credentials.
import type { ErrorEvent } from "@sentry/nextjs";

export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend(event: ErrorEvent) {
    delete event.user;
    delete event.extra;
    delete event.breadcrumbs;
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
      delete event.request.data;
      delete event.request.query_string;
      if (event.request.url)
        event.request.url = event.request.url.split(/[?#]/)[0];
    }
    return event;
  },
};
