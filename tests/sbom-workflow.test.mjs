import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../.github/workflows/sbom-release.yml", import.meta.url);

test("vendored SBOM upload waits for Dependency-Track processing", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(
    workflow,
    /Dependency-Track processing gate aligned with sudo-PORT\/\.github@ea1ef4468482e1d79874f5c5682c9a5e0a3a846d\./,
  );
  assert.match(workflow, /\^\[0-9a-fA-F-\]\{36\}\$/);
  assert.match(workflow, /for attempt in \{1\.\.60\}; do/);
  assert.match(workflow, /\/api\/v1\/event\/token\/\$upload_token/);
  assert.match(workflow, /\.processing \| type == "boolean"/);
  assert.match(workflow, /did not finish BOM processing within five minutes/);
  assert.match(workflow, /Dependency-Track accepted and processed the SBOM/);
  assert.match(workflow, /Processing: \\`completed\\`/);
  assert.doesNotMatch(workflow, /accepted the SBOM for asynchronous processing/);
});

test("public weekly security workflow runs local pinned scanners and triage", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/security-schedule.yml", import.meta.url),
    "utf8",
  );

  assert.match(
    workflow,
    /Vendored from sudo-PORT\/\.github@ea1ef4468482e1d79874f5c5682c9a5e0a3a846d\./,
  );
  assert.match(workflow, /^  secrets:\n/m);
  assert.match(workflow, /^  semgrep:\n/m);
  assert.match(workflow, /^  trivy:\n/m);
  assert.match(workflow, /^  triage:\n/m);
  assert.match(workflow, /gitleaks_\$\{version\}_linux_x64\.tar\.gz/);
  assert.match(workflow, /semgrep\/semgrep:1\.173\.0@sha256:[0-9a-f]{64}/);
  assert.match(
    workflow,
    /expected="2ae6fe3ee734b7fdf11335663e18c75ea12dccc76062f09f164a3b0f8be4371a"/,
  );
  assert.match(workflow, /ISSUE_MARKER: "<!-- sudo-security-scan -->"/);
  assert.match(workflow, /on:\n  pull_request:\n  schedule:/);
  assert.match(workflow, /if: always\(\) && github\.event_name != 'pull_request'/);
  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.match(
    workflow,
    /triage:[\s\S]*permissions:\n      actions: read\n      contents: read\n      issues: write/,
  );
  assert.doesNotMatch(workflow, /secrets:\s+inherit/);
  assert.doesNotMatch(workflow, /sudo-PORT\/\.github\/\.github\/workflows/);
  assert.doesNotMatch(workflow, /deployments:\s*write/);
  assert.doesNotMatch(workflow, /^  deploy:/m);
});
