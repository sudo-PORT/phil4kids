// Execute runtime hooks with synthetic data; never send a test event to a real customer project.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import vm from "node:vm";
const root = process.cwd();
const src = existsSync(path.join(root, "src/sentry.options.ts"))
  ? path.join(root, "src")
  : root;
function code(file) {
  return stripTypeScriptTypes(readFileSync(file, "utf8"), {
    mode: "transform",
  }).replace(/^import .*;\r?\n/gm, "");
}
for (const dsn of [
  undefined,
  "https://00000000000000000000000000000000@bug.sudoport.de/4",
]) {
  const context = {
    process: { env: { NODE_ENV: "development", NEXT_PUBLIC_SENTRY_DSN: dsn } },
  };
  const scrubFile = path.join(root, "lib/glitchtip-event.ts");
  if (existsSync(scrubFile))
    vm.runInNewContext(
      code(scrubFile).replace(
        "export function scrubTelemetry",
        "globalThis.scrubTelemetry = function scrubTelemetry",
      ),
      context,
    );
  vm.runInNewContext(
    code(path.join(src, "sentry.options.ts")).replace(
      "export const sentryOptions",
      "globalThis.sentryOptions",
    ),
    context,
  );
  for (const file of [
    "instrumentation-client.ts",
    "sentry.server.config.ts",
    "sentry.edge.config.ts",
  ]) {
    let options;
    context.Sentry = {
      init(value) {
        options = value;
      },
      captureRouterTransitionStart() {},
    };
    vm.runInNewContext(
      code(path.join(src, file)).replace(
        "export const onRouterTransitionStart",
        "globalThis.onRouterTransitionStart",
      ),
      context,
    );
    assert.equal(options.enabled, Boolean(dsn));
    assert.equal(options.sendDefaultPii, false);
    assert.equal(options.tracesSampleRate, 0);
    const event = {
      type: undefined,
      user: { email: "person@example.invalid" },
      request: {
        url: "https://example.invalid/path?credential=synthetic",
        headers: { authorization: "synthetic" },
        data: { document: "synthetic" },
      },
      extra: { credential: "synthetic" },
      breadcrumbs: [{ message: "synthetic" }],
    };
    const cleaned = options.beforeSend(event);
    assert.equal(cleaned.user, undefined);
    assert.equal(cleaned.extra, undefined);
    assert.equal(cleaned.breadcrumbs, undefined);
    assert.equal(cleaned.request?.headers, undefined);
    assert.equal(cleaned.request?.data, undefined);
    assert.ok(!JSON.stringify(cleaned).includes("credential"));
    if (file === "instrumentation-client.ts") {
      assert.equal(options.replaysOnErrorSampleRate, 0);
      assert.equal(options.replaysSessionSampleRate, 0);
      assert.equal(
        options
          .integrations([
            { name: "BrowserSession" },
            { name: "GlobalHandlers" },
          ])
          .map((item) => item.name)
          .join(","),
        "GlobalHandlers",
      );
    }
  }
}
console.log(
  "PASS: SDK hooks require a DSN, remove sensitive synthetic context, and disable tracing, Replay and browser sessions.",
);
