// Execute the real shared privacy boundary and every runtime hook with synthetic events, never network traffic.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
const root = process.cwd();
const projectId = "4";
const productionOnly = false;
const runtimeRoot = existsSync(path.join(root, "src/sentry.options.ts"))
  ? path.join(root, "src")
  : root;
function source(file) {
  let text = readFileSync(file, "utf8");
  if (file.endsWith(".ts"))
    text = stripTypeScriptTypes(text, { mode: "transform" });
  return text
    .replace(/^import .*;\r?\n/gm, "")
    .replaceAll("import.meta.url", JSON.stringify(pathToFileURL(file).href));
}
const shared = ["ts", "js"]
  .map((ext) => path.join(runtimeRoot, `sentry.options.${ext}`))
  .find(existsSync);
for (const runtime of ["client", "server", "edge"]) {
  const file =
    ["ts", "js"]
      .map((ext) => path.join(runtimeRoot, `sentry.${runtime}.config.${ext}`))
      .find(existsSync) || path.join(runtimeRoot, "instrumentation-client.ts");
  for (const dsn of [
    undefined,
    "",
    `https://00000000000000000000000000000000@bug.sudoport.de/${projectId}`,
    `https://00000000000000000000000000000000@bug.sudoport.de/99999`,
    `https://00000000000000000000000000000000@example.invalid/${projectId}`,
    "invalid",
  ]) {
    for (const environment of ["production", "development"]) {
      let options;
      const context = {
        URL,
        process: {
          env: { NODE_ENV: environment, NEXT_PUBLIC_SENTRY_DSN: dsn },
        },
        Sentry: {
          init(value) {
            options = value;
          },
          replayIntegration() {
            throw Error("Replay must not initialize");
          },
        },
      };
      vm.runInNewContext(
        source(shared)
          .replace(/^export function /gm, "function ")
          .replace(
            "export const glitchTipOptions",
            "globalThis.glitchTipOptions",
          ),
        context,
      );
      vm.runInNewContext(
        source(file).replace(
          "export const onRouterTransitionStart",
          "globalThis.onRouterTransitionStart",
        ),
        context,
      );
      const valid =
        dsn ===
        `https://00000000000000000000000000000000@bug.sudoport.de/${projectId}`;
      assert.equal(
        options.enabled,
        valid && (!productionOnly || environment === "production"),
      );
      assert.equal(options.dsn, valid ? dsn : undefined);
      assert.equal(options.sendDefaultPii, false);
      assert.equal(options.tracesSampleRate, 0);
      assert.equal(options.tracePropagationTargets.length, 0);
      assert.equal(options.enableLogs, false);
      assert.equal(options.replaysSessionSampleRate, 0);
      assert.equal(options.replaysOnErrorSampleRate, 0);
      assert.equal(options.beforeSendTransaction({}), null);
      assert.equal(options.beforeSendLog({}), null);
      assert.equal(
        options
          .integrations(
            [
              "BrowserSession",
              "RequestSession",
              "Replay",
              "BrowserProfiling",
              "GlobalHandlers",
            ].map((name) => ({ name })),
          )
          .map((item) => item.name)
          .join(","),
        "GlobalHandlers",
      );
      const sensitive = "synthetic-sensitive-value";
      const event = {
        type: undefined,
        arbitraryField: sensitive,
        logentry: { message: sensitive },
        threads: [{ name: sensitive }],
        event_id: "a".repeat(32),
        request: {
          headers: { authorization: sensitive },
          cookies: sensitive,
          query_string: sensitive,
          data: { message: sensitive },
        },
        user: { id: sensitive, email: sensitive },
        extra: { form: sensitive },
        contexts: { customer: { name: sensitive } },
        breadcrumbs: [{ message: sensitive }],
        tags: { customer: sensitive },
        transaction: sensitive,
        server_name: sensitive,
        fingerprint: [sensitive],
        message: sensitive,
        exception: {
          values: [
            {
              type: "TypeError",
              value: sensitive,
              mechanism: {
                type: sensitive,
                handled: false,
                data: { customer: sensitive },
              },
              stacktrace: {
                frames: [
                  {
                    filename: `https://example.invalid/assets/form.js?token=${sensitive}`,
                    lineno: 42,
                    function: sensitive,
                    module: sensitive,
                    vars: { body: sensitive },
                    context_line: sensitive,
                  },
                ],
              },
            },
          ],
        },
      };
      const cleaned = options.beforeSend(event);
      assert.notEqual(cleaned, event);
      assert.equal(event.arbitraryField, sensitive);
      assert.equal(cleaned.arbitraryField, undefined);
      assert.equal(cleaned.logentry, undefined);
      assert.equal(cleaned.threads, undefined);
      assert.equal(cleaned.exception.values[0].mechanism.type, "generic");
      assert.equal(
        cleaned.exception.values[0].stacktrace.frames[0].module,
        undefined,
      );
      assert.equal(cleaned.event_id, "a".repeat(32));
      assert.equal(cleaned.exception.values[0].type, "TypeError");
      assert.equal(cleaned.exception.values[0].stacktrace.frames[0].lineno, 42);
      assert.equal(
        cleaned.exception.values[0].stacktrace.frames[0].function,
        undefined,
      );
      assert.equal(
        cleaned.exception.values[0].stacktrace.frames[0].filename,
        "https://example.invalid/assets/form.js",
      );
      assert.ok(
        !JSON.stringify(cleaned).includes(sensitive),
        `${runtime} retains no form, request or original error value`,
      );
      for (const field of [
        "request",
        "user",
        "extra",
        "contexts",
        "breadcrumbs",
        "tags",
        "transaction",
        "server_name",
        "fingerprint",
      ])
        assert.equal(cleaned[field], undefined);
    }
  }
}
console.log(
  "PASS: exact customer DSN gating, all-runtime error scrubbing and error-only SDK options.",
);

// Verify the installed SDK's final envelope with synthetic data and no network transport.
const installedSdk = await import("@sentry/nextjs");
const actualSdk = installedSdk.default || installedSdk;
const actualBoundary = await import(
  "data:text/javascript;base64," +
    Buffer.from(source(shared)).toString("base64")
);
const envelopes = [];
actualSdk.init({
  dsn: `https://${"0".repeat(32)}@bug.sudoport.de/${projectId}`,
  enabled: true,
  environment: "test",
  defaultIntegrations: false,
  registerEsmLoaderHooks: false,
  skipOpenTelemetrySetup: true,
  integrations: [],
  sendDefaultPii: false,
  tracesSampleRate: 0,
  enableLogs: false,
  beforeSend: actualBoundary.scrubSensitiveTelemetry,
  transport: () => ({
    send(envelope) {
      envelopes.push(envelope);
      return Promise.resolve({ statusCode: 200 });
    },
    flush() {
      return Promise.resolve(true);
    },
  }),
});
const privateProbe = "KundenprojektAlphaBesprechung";
actualSdk.captureEvent({
  message: privateProbe,
  arbitraryField: privateProbe,
  logentry: { message: privateProbe },
  exception: {
    values: [
      {
        type: "TypeError",
        value: privateProbe,
        mechanism: { type: privateProbe, handled: true },
        stacktrace: {
          frames: [
            {
              filename:
                "/.next/server/chunks/[root-of-the-server]__abc.mjs?memo=" +
                privateProbe,
              function: privateProbe,
              module: privateProbe,
              lineno: 42,
            },
          ],
        },
      },
    ],
  },
});
await actualSdk.flush(1000);
assert.equal(envelopes.length, 1);
assert.ok(!JSON.stringify(envelopes).includes(privateProbe));
const sentError = envelopes[0][1].find(
  ([header]) => header.type === "event",
)[1];
assert.equal(sentError.exception.values[0].type, "TypeError");
assert.equal(sentError.exception.values[0].stacktrace.frames[0].lineno, 42);
await actualSdk.close(1000);
console.log(
  "PASS: installed SDK final envelope uses positive technical fields and memory transport only.",
);
