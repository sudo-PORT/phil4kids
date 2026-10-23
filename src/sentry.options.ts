// Keep diagnostics in this customer web project and remove application/customer values before transport.
import type { ErrorEvent } from "@sentry/nextjs";
export function validGlitchTipDsn(value: string | undefined) {
  if (typeof value !== "string" || !value || value !== value.trim())
    return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "bug.sudoport.de" &&
      !url.port &&
      !url.password &&
      /^[a-f0-9]{32}$/i.test(url.username) &&
      url.pathname === "/4" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function scrubSensitiveTelemetry(event: ErrorEvent) {
  for (const field of [
    "request",
    "user",
    "extra",
    "contexts",
    "breadcrumbs",
    "transaction",
    "server_name",
    "fingerprint",
    "tags",
  ] as const)
    delete event[field];
  if (event.message) event.message = "Unerwarteter Anwendungsfehler";
  if (event.exception?.values)
    event.exception.values = event.exception.values.map((value) => ({
      type:
        typeof value.type === "string" &&
        /^[A-Za-z_$][A-Za-z0-9_.$:-]{0,127}$/.test(value.type)
          ? value.type
          : "Error",
      value: "Unerwarteter Anwendungsfehler",
      stacktrace: value.stacktrace
        ? {
            frames: (value.stacktrace.frames || []).map((frame) => ({
              filename:
                typeof frame.filename === "string"
                  ? frame.filename.split(/[?#]/)[0]
                  : undefined,
              abs_path:
                typeof frame.abs_path === "string"
                  ? frame.abs_path.split(/[?#]/)[0]
                  : undefined,
              function: frame.function,
              module: frame.module,
              lineno: frame.lineno,
              colno: frame.colno,
              in_app: frame.in_app,
            })),
          }
        : undefined,
      mechanism: value.mechanism
        ? { type: value.mechanism.type, handled: value.mechanism.handled }
        : undefined,
    }));
  return event;
}

const configuredDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const validDsn = validGlitchTipDsn(configuredDsn);
export const glitchTipOptions = {
  dsn: validDsn ? configuredDsn : undefined,
  enabled: validDsn,
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  tracePropagationTargets: [],
  enableLogs: false,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  integrations: (integrations: Array<{ name: string }>) =>
    integrations.filter(
      (integration) =>
        !/BrowserSession|RequestSession|Replay|Profil|Tracing/.test(
          integration.name,
        ),
    ),
  ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND"],
  beforeSend: scrubSensitiveTelemetry,
  beforeSendTransaction: () => null,
  beforeSendLog: () => null,
};
