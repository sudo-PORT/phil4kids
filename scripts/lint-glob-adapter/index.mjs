// Preserve the Next ESLint plugin's directory-glob contract without the vulnerable braces dependency.
// This private build tool supports only the API used by the pinned plugin; new APIs fail visibly.
import assert from "node:assert/strict";
import path from "node:path";
import { globSync as glob } from "tinyglobby";

export const globSync = (patterns, options) => {
  assert.deepEqual(options, { onlyDirectories: true });
  assert.equal(typeof patterns, "string");
  // tinyglobby otherwise expands literal directories recursively and retains trailing separators.
  return glob(patterns, {
    ...options,
    expandDirectories: false,
    absolute: path.isAbsolute(patterns),
  }).map((value) => (value.length > 1 ? value.replace(/\/$/, "") : value));
};
