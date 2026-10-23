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

type TechnicalException = NonNullable<
  NonNullable<ErrorEvent["exception"]>["values"]
>[number];
type TechnicalFrame = NonNullable<
  NonNullable<TechnicalException["stacktrace"]>["frames"]
>[number];

function technicalLocation(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const location = value.split(/[?#]/, 1)[0] ?? "";
  return /^[A-Za-z0-9_./:@+%()[\]-]{1,512}$/.test(location)
    ? location
    : undefined;
}

// Construct a positive schema: new SDK/application fields never enter transport implicitly.
export function scrubSensitiveTelemetry(event: ErrorEvent): ErrorEvent | null {
  if (!event || typeof event !== "object" || event.type) return null;
  const clean: ErrorEvent = { type: undefined };
  if (
    typeof event.event_id === "string" &&
    /^[a-f0-9]{32}$/i.test(event.event_id)
  )
    clean.event_id = event.event_id;
  if (typeof event.timestamp === "number" && Number.isFinite(event.timestamp))
    clean.timestamp = event.timestamp;
  if (
    typeof event.level === "string" &&
    ["error", "fatal", "warning"].includes(event.level)
  )
    clean.level = event.level;
  if (
    typeof event.environment === "string" &&
    ["production", "staging", "development", "test"].includes(event.environment)
  )
    clean.environment = event.environment;
  if (
    typeof event.release === "string" &&
    /^[a-f0-9]{40}$/i.test(event.release)
  )
    clean.release = event.release;
  if (
    typeof event.platform === "string" &&
    ["javascript", "node", "nodejs"].includes(event.platform)
  )
    clean.platform = event.platform;
  if (event.message) clean.message = "Unerwarteter Anwendungsfehler";
  if (Array.isArray(event.exception?.values)) {
    clean.exception = {
      values: event.exception.values.slice(0, 20).map((value) => {
        const error: TechnicalException = {
          type:
            typeof value?.type === "string" &&
            /^[A-Za-z_$][A-Za-z0-9_.$:-]{0,127}$/.test(value.type)
              ? value.type
              : "Error",
          value: "Unerwarteter Anwendungsfehler",
        };
        if (Array.isArray(value?.stacktrace?.frames)) {
          error.stacktrace = {
            frames: value.stacktrace.frames.slice(-200).map((frame) => {
              const result: TechnicalFrame = {};
              for (const key of ["filename", "abs_path"] as const) {
                const location = technicalLocation(frame?.[key]);
                if (location) result[key] = location;
              }
              for (const key of ["lineno", "colno"] as const) {
                if (
                  typeof frame?.[key] === "number" &&
                  Number.isSafeInteger(frame?.[key]) &&
                  frame[key] >= 0
                )
                  result[key] = frame[key];
              }
              if (typeof frame?.in_app === "boolean")
                result.in_app = frame.in_app;
              return result;
            }),
          };
        }
        if (value?.mechanism)
          error.mechanism = {
            type: "generic",
            handled: value.mechanism.handled === true,
          };
        return error;
      }),
    };
  }
  return clean;
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
