// Verify the real Next ESLint consumer resolves project roots and still enforces navigation rules.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import { ESLint } from "eslint";
const require = createRequire(import.meta.url);
const {
  getRootDirs,
} = require("@next/eslint-plugin-next/dist/utils/get-root-dirs.js");
const plugin = require("@next/eslint-plugin-next");
const pluginRequire = createRequire(
  require.resolve("@next/eslint-plugin-next"),
);

test("Next resolves literal, wildcard, brace and array roots without including files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "reko-lint-roots-"));
  try {
    for (const directory of [
      "apps/first/pages",
      "apps/second/pages",
      "apps/.hidden/pages",
    ])
      await mkdir(path.join(root, directory), { recursive: true });
    await writeFile(path.join(root, "apps/plain.txt"), "synthetic");
    const roots = (rootDir) =>
      getRootDirs({ cwd: root, settings: { next: { rootDir } } }).sort();
    const first = path.join(root, "apps/first"),
      second = path.join(root, "apps/second");
    assert.deepEqual(roots(undefined), [root]);
    assert.deepEqual(roots(first), [first]);
    const relative = path.relative(process.cwd(), first);
    assert.deepEqual(roots(relative), [relative]);
    assert.deepEqual(roots(first + "/"), [first]);
    assert.deepEqual(roots(path.join(root, "apps/*")), [first, second]);
    assert.deepEqual(roots(path.join(root, "apps/{first,second}")), [
      first,
      second,
    ]);
    assert.deepEqual(roots([first, second, false]), [first, second]);
    assert.deepEqual(roots(path.join(root, "missing/*")), []);
    assert.throws(() => pluginRequire("fast-glob").globSync("*", {}));
    assert.throws(() => pluginRequire("braces"), { code: "MODULE_NOT_FOUND" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the real Next navigation rule still rejects internal plain anchors", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "reko-lint-rule-"));
  try {
    await mkdir(path.join(root, "pages"));
    await writeFile(
      path.join(root, "pages/about.js"),
      "export default function Page() {}",
    );
    const lint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: {
        files: ["**/*.jsx"],
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "@next/next": plugin },
        settings: { next: { rootDir: root } },
        rules: { "@next/next/no-html-link-for-pages": "error" },
      },
    });
    const [bad] = await lint.lintText(
      'const link = <a href="/about">About</a>;',
      { filePath: "synthetic.jsx" },
    );
    assert.equal(bad.errorCount, 1);
    assert.equal(bad.messages[0].ruleId, "@next/next/no-html-link-for-pages");
    const [good] = await lint.lintText(
      'const link = <a href="https://example.invalid/about">About</a>;',
      { filePath: "synthetic.jsx" },
    );
    assert.equal(good.errorCount, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
