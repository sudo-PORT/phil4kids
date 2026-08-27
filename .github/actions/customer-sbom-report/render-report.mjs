import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredEnvironment = [
  "CUSTOMER_REPORT_SBOM_PATH",
  "CUSTOMER_REPORT_TRIVY_PATH",
  "CUSTOMER_REPORT_OUTPUT_DIRECTORY",
  "CUSTOMER_REPORT_PROJECT_NAME",
  "CUSTOMER_REPORT_RELEASE_VERSION",
  "CUSTOMER_REPORT_SOURCE_SHA",
  "CUSTOMER_REPORT_REPOSITORY_URL",
  "CUSTOMER_REPORT_MANUFACTURER_NAME",
  "CUSTOMER_REPORT_MANUFACTURER_URL",
  "CUSTOMER_REPORT_SECURITY_CONTACT",
  "CUSTOMER_REPORT_CLASSIFICATION",
  "CUSTOMER_REPORT_LOGO_PATH",
];

for (const name of requiredEnvironment) {
  if (!process.env[name] || /[\r\n]/u.test(process.env[name])) {
    throw new Error(`${name} must be a non-empty single-line value`);
  }
}

const paths = {
  sbom: resolve(process.env.CUSTOMER_REPORT_SBOM_PATH),
  trivy: resolve(process.env.CUSTOMER_REPORT_TRIVY_PATH),
  output: resolve(process.env.CUSTOMER_REPORT_OUTPUT_DIRECTORY),
  logo: resolve(process.env.CUSTOMER_REPORT_LOGO_PATH),
};
for (const [label, path] of Object.entries({ sbom: paths.sbom, trivy: paths.trivy, logo: paths.logo })) {
  if (!existsSync(path)) {
    throw new Error(`${label} input not found: ${path}`);
  }
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sbom = readJson(paths.sbom);
const trivy = readJson(paths.trivy);
if (sbom.bomFormat !== "CycloneDX" || typeof sbom.specVersion !== "string") {
  throw new Error("The customer report requires a valid CycloneDX JSON document");
}

const components = Array.isArray(sbom.components) ? sbom.components : [];
const services = Array.isArray(sbom.services) ? sbom.services : [];
const dependencies = Array.isArray(sbom.dependencies) ? sbom.dependencies : [];
const vulnerabilities = (Array.isArray(trivy.Results) ? trivy.Results : []).flatMap((result) =>
  Array.isArray(result.Vulnerabilities) ? result.Vulnerabilities : [],
);
const severities = Object.fromEntries(
  ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"].map((severity) => [
    severity,
    vulnerabilities.filter((item) => String(item.Severity || "UNKNOWN").toUpperCase() === severity).length,
  ]),
);
const blockingFindings = severities.CRITICAL + severities.HIGH;
const status = blockingFindings === 0 ? "Freigabegate erfüllt" : "Freigabe blockiert";
const statusClass = blockingFindings === 0 ? "pass" : "blocked";

const ecosystemCounts = new Map();
for (const component of components) {
  const purl = typeof component.purl === "string" ? component.purl : "";
  const match = /^pkg:([^/]+)/u.exec(purl);
  const ecosystem = match ? match[1] : component.type || "other";
  ecosystemCounts.set(ecosystem, (ecosystemCounts.get(ecosystem) || 0) + 1);
}
const ecosystems = [...ecosystemCounts.entries()]
  .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  .slice(0, 8);

const licenseIds = new Set();
for (const component of components) {
  for (const licenseEntry of Array.isArray(component.licenses) ? component.licenses : []) {
    const value = licenseEntry.expression || licenseEntry.license?.id || licenseEntry.license?.name;
    if (value) licenseIds.add(String(value));
  }
}

const generatedAt = new Date().toISOString();
const product = process.env.CUSTOMER_REPORT_PROJECT_NAME;
const version = process.env.CUSTOMER_REPORT_RELEASE_VERSION;
const sourceSha = process.env.CUSTOMER_REPORT_SOURCE_SHA;
const repositoryUrl = process.env.CUSTOMER_REPORT_REPOSITORY_URL;
const manufacturer = process.env.CUSTOMER_REPORT_MANUFACTURER_NAME;
const manufacturerUrl = process.env.CUSTOMER_REPORT_MANUFACTURER_URL;
const securityContact = process.env.CUSTOMER_REPORT_SECURITY_CONTACT;
const classification = process.env.CUSTOMER_REPORT_CLASSIFICATION;
const sbomDigest = sha256(paths.sbom);
const trivyDigest = sha256(paths.trivy);
const serialNumber = sbom.serialNumber || "nicht vergeben";
const logoSvg = readFileSync(paths.logo, "utf8").replace(/<\?xml[^>]*>/u, "");
const documentId = `SBOM-${sourceSha.slice(0, 12).toUpperCase()}`;

const ecosystemRows =
  ecosystems.length > 0
    ? ecosystems
        .map(
          ([name, count]) =>
            `<tr><td>${escapeHtml(name)}</td><td class="number">${count.toLocaleString("de-DE")}</td></tr>`,
        )
        .join("")
    : '<tr><td>Keine klassifizierbaren Komponenten</td><td class="number">0</td></tr>';

const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(product)} ${escapeHtml(version)} – Software Transparency Report</title>
  <style>
    :root {
      --ink: #0f172a;
      --text: #1e293b;
      --muted: #475569;
      --faint: #64748b;
      --line: #cbd5e1;
      --paper: #ffffff;
      --soft: #f8fafc;
      --green: #047857;
      --green-light: #059669;
      --teal: #0d9488;
      --teal-light: #14b8a6;
      --cyan: #5eead4;
      --danger: #b42318;
    }
    * { box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body {
      margin: 0;
      color: var(--text);
      background: #e2e8f0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      font-size: 10.4pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 8mm;
      padding: 18mm 18mm 16mm;
      background: var(--paper);
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }
    .cover {
      color: var(--text);
      background:
        radial-gradient(circle at 87% 16%, rgba(20,184,166,.13), transparent 27%),
        radial-gradient(circle at 8% 82%, rgba(16,185,129,.09), transparent 30%),
        linear-gradient(180deg, #ffffff 0%, #fbfefd 70%, #f8fafc 100%);
    }
    .cover::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(15,23,42,.025) .2mm, transparent .2mm),
        linear-gradient(90deg, rgba(15,23,42,.025) .2mm, transparent .2mm);
      background-size: 12mm 12mm;
      mask-image: linear-gradient(to bottom, transparent 8%, #000 36%, transparent 92%);
    }
    .network-art {
      position: absolute;
      inset: 28mm -42mm auto auto;
      width: 176mm;
      height: 112mm;
      opacity: .46;
      z-index: 0;
    }
    .brand { width: 60mm; position: relative; z-index: 2; }
    .brand svg { width: 100%; height: auto; display: block; }
    .eyebrow {
      position: relative;
      z-index: 2;
      margin-top: 30mm;
      color: var(--green);
      font-size: 8pt;
      font-weight: 750;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    .eyebrow::before { content: ""; display: inline-block; width: 8mm; margin: 0 3mm 1.1mm 0; border-top: .45mm solid var(--green-light); }
    h1 {
      position: relative;
      z-index: 2;
      max-width: 150mm;
      margin: 5mm 0 4mm;
      color: var(--ink);
      font-family: Sora, Inter, "Segoe UI", Arial, sans-serif;
      font-size: 38pt;
      line-height: 1.02;
      letter-spacing: -.05em;
    }
    h1 span { color: var(--green-light); }
    .subtitle { position: relative; z-index: 2; max-width: 132mm; color: var(--muted); font-size: 12.5pt; }
    .product-card {
      position: relative;
      z-index: 2;
      margin-top: 14mm;
      padding: 0 6mm 6mm;
      width: 146mm;
      overflow: hidden;
      border: .3mm solid rgba(15,23,42,.1);
      border-radius: 4mm;
      background: rgba(255,255,255,.94);
      box-shadow: 0 7mm 18mm rgba(15,23,42,.13);
    }
    .terminal-bar { display: flex; align-items: center; gap: 3mm; height: 12mm; margin: 0 -6mm 5mm; padding: 0 5mm; border-bottom: .3mm solid rgba(15,23,42,.08); color: var(--faint); font-family: "SFMono-Regular", Consolas, monospace; font-size: 7.2pt; }
    .terminal-dots { display: flex; gap: 1.6mm; }
    .terminal-dots i { width: 2.2mm; height: 2.2mm; border-radius: 50%; background: #ef4444; }
    .terminal-dots i:nth-child(2) { background: #f59e0b; }
    .terminal-dots i:nth-child(3) { background: #10b981; }
    .terminal-command { color: var(--faint); font-family: "SFMono-Regular", Consolas, monospace; font-size: 7.5pt; }
    .product-name { margin-top: 3mm; color: var(--ink); font-family: Sora, Inter, sans-serif; font-size: 17pt; font-weight: 750; }
    .product-version { margin-top: 1mm; color: var(--muted); }
    .terminal-status { display: grid; grid-template-columns: 1fr auto; gap: 2mm 6mm; margin-top: 4mm; padding-top: 4mm; border-top: .3mm solid rgba(15,23,42,.07); color: var(--muted); font-family: "SFMono-Regular", Consolas, monospace; font-size: 7.2pt; }
    .terminal-status strong { color: var(--green); font-weight: 700; }
    .cover-meta {
      position: absolute;
      left: 18mm;
      right: 18mm;
      bottom: 17mm;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6mm;
      z-index: 2;
      color: var(--faint);
      font-size: 8pt;
    }
    .cover-meta div { padding-top: 3mm; border-top: .45mm solid rgba(15,118,110,.22); }
    .cover-meta strong { display: block; margin-top: 1mm; color: var(--ink); font-size: 8.8pt; }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 6mm;
      border-bottom: .35mm solid var(--line);
    }
    .wordmark {
      color: var(--ink);
      font-size: 15pt;
      font-weight: 800;
      letter-spacing: -.04em;
    }
    .wordmark::before { content: ">·"; margin-right: 1mm; color: var(--green-light); }
    .wordmark span { color: var(--teal); }
    .doc-ref { color: var(--muted); font-size: 8pt; text-align: right; }
    h2 {
      margin: 13mm 0 3mm;
      color: var(--ink);
      font-family: Sora, Inter, "Segoe UI", Arial, sans-serif;
      font-size: 22pt;
      line-height: 1.1;
      letter-spacing: -.025em;
    }
    h3 { margin: 8mm 0 3mm; color: var(--ink); font-family: Sora, Inter, sans-serif; font-size: 12pt; }
    .lead { max-width: 157mm; color: var(--muted); font-size: 11.2pt; }
    .status {
      margin-top: 9mm;
      padding: 7mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 3mm;
      border: .35mm solid;
      box-shadow: 0 2mm 6mm rgba(15,23,42,.045);
    }
    .status.pass { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
    .status.blocked { color: #8f1d14; background: #fff0ee; border-color: #f2b8b3; }
    .status-title { font-size: 15pt; font-weight: 800; }
    .status-mark {
      display: grid;
      width: 15mm;
      height: 15mm;
      place-items: center;
      border: .7mm solid currentColor;
      border-radius: 3mm;
      font-size: 17pt;
      font-weight: 800;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm;
      margin-top: 8mm;
    }
    .metric {
      padding: 5mm;
      min-height: 28mm;
      border: .3mm solid var(--line);
      border-radius: 2.5mm;
      background: #fff;
      box-shadow: 0 2mm 5mm rgba(15,23,42,.035);
    }
    .metric strong { display: block; font-size: 21pt; line-height: 1; color: var(--green); }
    .metric span { display: block; margin-top: 2.5mm; color: var(--muted); font-size: 8.5pt; }
    .severity-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 2.5mm;
      margin-top: 4mm;
    }
    .severity { padding: 4mm 2mm; border: .3mm solid var(--line); border-radius: 2.5mm; background: #fff; text-align: center; }
    .severity strong { display: block; font-size: 16pt; }
    .severity span { color: var(--muted); font-size: 7.3pt; letter-spacing: .06em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 3mm 2.5mm; border-bottom: .3mm solid var(--line); text-align: left; }
    th { color: var(--muted); background: var(--soft); font-size: 8pt; text-transform: uppercase; letter-spacing: .06em; }
    td.number { text-align: right; font-variant-numeric: tabular-nums; }
    .facts { margin-top: 5mm; }
    .facts div {
      display: grid;
      grid-template-columns: 42mm 1fr;
      gap: 4mm;
      padding: 3mm 0;
      border-bottom: .3mm solid var(--line);
    }
    .facts dt { color: var(--muted); }
    .facts dd { margin: 0; overflow-wrap: anywhere; font-family: "SFMono-Regular", Consolas, monospace; font-size: 8.5pt; }
    .callout {
      margin-top: 8mm;
      padding: 5mm 6mm;
      border-left: 1.2mm solid var(--teal);
      background: var(--soft);
    }
    .steps { counter-reset: item; margin: 6mm 0 0; padding: 0; list-style: none; }
    .steps li {
      counter-increment: item;
      display: grid;
      grid-template-columns: 10mm 1fr;
      gap: 3mm;
      margin: 0 0 5mm;
    }
    .steps li::before {
      content: counter(item);
      display: grid;
      width: 8mm;
      height: 8mm;
      place-items: center;
      color: white;
      background: var(--green);
      border-radius: 2mm;
      font-size: 8pt;
      font-weight: 700;
    }
    .signature {
      margin-top: 11mm;
      padding: 7mm;
      border-radius: 3mm;
      color: white;
      background: #0f172a;
      box-shadow: inset 1.2mm 0 0 var(--teal-light);
    }
    .signature strong { display: block; font-size: 14pt; }
    .signature a { color: var(--cyan); text-decoration: none; }
    .compact h2 { margin-top: 9mm; }
    .compact .steps { margin-top: 4mm; }
    .compact .steps li { margin-bottom: 3.2mm; }
    .compact th, .compact td { padding-top: 2mm; padding-bottom: 2mm; }
    .compact .signature { margin-top: 6mm; padding: 5mm 6mm; }
    .compact .callout { margin-top: 5mm; padding-top: 4mm; padding-bottom: 4mm; }
    .footer {
      position: absolute;
      left: 18mm;
      right: 18mm;
      bottom: 8mm;
      display: flex;
      justify-content: space-between;
      color: #7f918a;
      font-size: 7pt;
    }
    @media print {
      body { background: white; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>
  <section class="page cover">
    <div class="brand">${logoSvg}</div>
    <svg class="network-art" viewBox="0 0 1000 650" aria-hidden="true">
      <g fill="none" stroke="#14b8a6" stroke-width="2">
        <path d="M20 305 180 205 332 292 500 122 667 242 815 115 982 205"/>
        <path d="M180 205 248 470 420 382 590 505 742 345 982 430"/>
        <path d="M332 292 420 382 500 122M667 242 742 345 815 115"/>
      </g>
      <g fill="#14b8a6">
        <circle cx="20" cy="305" r="7"/><circle cx="180" cy="205" r="9"/><circle cx="248" cy="470" r="7"/>
        <circle cx="332" cy="292" r="7"/><circle cx="420" cy="382" r="9"/><circle cx="500" cy="122" r="8"/>
        <circle cx="590" cy="505" r="8"/><circle cx="667" cy="242" r="7"/><circle cx="742" cy="345" r="10"/>
        <circle cx="815" cy="115" r="7"/><circle cx="982" cy="205" r="8"/><circle cx="982" cy="430" r="7"/>
      </g>
    </svg>
    <div class="eyebrow">Software Transparency · Customer Assurance</div>
    <h1>Software Bill<br>of <span>Materials.</span></h1>
    <p class="subtitle">Nachvollziehbare Software-Lieferkette und dokumentierter Schwachstellenstatus für einen eindeutig identifizierten Release.</p>
    <div class="product-card">
      <div class="terminal-bar"><span class="terminal-dots"><i></i><i></i><i></i></span><span>release.evidence</span></div>
      <div class="terminal-command">$ sudo port sbom --release ${escapeHtml(version)}</div>
      <div class="product-name">${escapeHtml(product)}</div>
      <div class="product-version">Release ${escapeHtml(version)}</div>
      <div class="terminal-status">
        <span>✓ CycloneDX-Dokument</span><strong>validiert</strong>
        <span>✓ Integritätsnachweis</span><strong>erstellt</strong>
        <span>◆ Schwachstellenstatus</span><strong>${blockingFindings === 0 ? "freigegeben" : "blockiert"}</strong>
      </div>
    </div>
    <div class="cover-meta">
      <div>Dokument-ID<strong>${escapeHtml(documentId)}</strong></div>
      <div>Erstellt<strong>${escapeHtml(generatedAt.slice(0, 10))}</strong></div>
      <div>Klassifizierung<strong>${escapeHtml(classification)}</strong></div>
    </div>
  </section>

  <section class="page">
    <header class="topbar">
      <div class="wordmark">sudo<span>/PORT.</span></div>
      <div class="doc-ref">${escapeHtml(documentId)}<br>${escapeHtml(product)} · ${escapeHtml(version)}</div>
    </header>
    <h2>Management Summary</h2>
    <p class="lead">Dieses Dokument übersetzt die maschinenlesbare CycloneDX-SBOM in einen verständlichen Freigabenachweis. Alle Angaben sind an denselben Quellstand und dieselben Prüfsummen wie das Release gebunden.</p>

    <div class="status ${statusClass}">
      <div>
        <div class="status-title">${status}</div>
        <div>${blockingFindings === 0 ? "Keine Critical- oder High-Befunde im konfigurierten Release-Gate." : `${blockingFindings} blockierende Critical-/High-Befunde müssen vor einer Freigabe behandelt werden.`}</div>
      </div>
      <div class="status-mark">${blockingFindings === 0 ? "✓" : "!"}</div>
    </div>

    <div class="metrics">
      <div class="metric"><strong>${components.length.toLocaleString("de-DE")}</strong><span>identifizierte Komponenten</span></div>
      <div class="metric"><strong>${services.length.toLocaleString("de-DE")}</strong><span>dokumentierte Services</span></div>
      <div class="metric"><strong>${dependencies.length.toLocaleString("de-DE")}</strong><span>Abhängigkeitsbeziehungen</span></div>
      <div class="metric"><strong>${ecosystemCounts.size.toLocaleString("de-DE")}</strong><span>Komponenten-Ökosysteme</span></div>
      <div class="metric"><strong>${licenseIds.size.toLocaleString("de-DE")}</strong><span>erkannte Lizenzangaben</span></div>
      <div class="metric"><strong>1.6</strong><span>CycloneDX-Zielformat</span></div>
    </div>

    <h3>Schwachstellenstatus zum Prüfzeitpunkt</h3>
    <div class="severity-grid">
      ${["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]
        .map(
          (severity) =>
            `<div class="severity"><strong>${severities[severity]}</strong><span>${severity}</span></div>`,
        )
        .join("")}
    </div>

    <div class="callout"><strong>Einordnung:</strong> Eine SBOM ist ein fortlaufend zu pflegender Transparenznachweis. Neue Schwachstellen können nach dem Erstellungszeitpunkt bekannt werden. Unterstützte Versionen werden deshalb während ihres Supportzeitraums kontinuierlich überwacht.</div>
    <footer class="footer"><span>${escapeHtml(manufacturer)} · Software Transparency Report</span><span>Seite 2</span></footer>
  </section>

  <section class="page">
    <header class="topbar">
      <div class="wordmark">sudo<span>/PORT.</span></div>
      <div class="doc-ref">${escapeHtml(documentId)}<br>Technischer Nachweis</div>
    </header>
    <h2>Release-Identität und Integrität</h2>
    <p class="lead">Die folgenden Werte ermöglichen die eindeutige Zuordnung und unabhängige Integritätsprüfung der beigefügten Nachweise.</p>

    <dl class="facts">
      <div><dt>Produkt</dt><dd>${escapeHtml(product)}</dd></div>
      <div><dt>Version</dt><dd>${escapeHtml(version)}</dd></div>
      <div><dt>Quell-Commit</dt><dd>${escapeHtml(sourceSha)}</dd></div>
      <div><dt>Repository</dt><dd>${escapeHtml(repositoryUrl)}</dd></div>
      <div><dt>SBOM-Format</dt><dd>CycloneDX JSON ${escapeHtml(sbom.specVersion)}</dd></div>
      <div><dt>SBOM-Seriennummer</dt><dd>${escapeHtml(serialNumber)}</dd></div>
      <div><dt>SBOM SHA-256</dt><dd>${escapeHtml(sbomDigest)}</dd></div>
      <div><dt>Scan-Nachweis SHA-256</dt><dd>${escapeHtml(trivyDigest)}</dd></div>
      <div><dt>Erstellungszeitpunkt</dt><dd>${escapeHtml(generatedAt)}</dd></div>
    </dl>

    <h3>Größte Komponenten-Ökosysteme</h3>
    <table>
      <thead><tr><th>Ökosystem / Komponententyp</th><th style="text-align:right">Anzahl</th></tr></thead>
      <tbody>${ecosystemRows}</tbody>
    </table>

    <div class="callout"><strong>Verifikation:</strong> Die Datei SHA256SUMS gegen die beigefügte sbom.cdx.json prüfen. Eine vorhandene Sigstore-Attestierung bestätigt zusätzlich die Herkunft über den freigegebenen GitHub-Workflow.</div>
    <footer class="footer"><span>${escapeHtml(manufacturer)} · Software Transparency Report</span><span>Seite 3</span></footer>
  </section>

  <section class="page compact">
    <header class="topbar">
      <div class="wordmark">sudo<span>/PORT.</span></div>
      <div class="doc-ref">${escapeHtml(documentId)}<br>Verwendung und Kontakt</div>
    </header>
    <h2>Verwendung des Kundenpakets</h2>
    <p class="lead">Das Paket kombiniert lesbare Dokumentation und maschinenverarbeitbare Nachweise. Dadurch kann es sowohl in Audits als auch in automatisierten Lieferkettenkontrollen verwendet werden.</p>

    <ol class="steps">
      <li><div><strong>Dokumentidentität prüfen</strong><br>Produkt, Version und Commit mit Release Notes beziehungsweise Liefergegenstand abgleichen.</div></li>
      <li><div><strong>Integrität bestätigen</strong><br>SHA-256-Prüfsummen prüfen und, sofern beigefügt, die Sigstore-Attestierung verifizieren.</div></li>
      <li><div><strong>SBOM importieren</strong><br>sbom.cdx.json in ein CycloneDX-kompatibles Asset-, GRC- oder Schwachstellenmanagement übernehmen.</div></li>
      <li><div><strong>Aktualisierungen verfolgen</strong><br>Security Advisories, VEX-Entscheidungen und neue Produkt-Releases während des vereinbarten Supportzeitraums berücksichtigen.</div></li>
      <li><div><strong>Schwachstellen vertraulich melden</strong><br>Keine sensiblen Details in öffentliche Issues einstellen, sondern den unten genannten Security-Kontakt verwenden.</div></li>
    </ol>

    <h3>Lieferumfang</h3>
    <table>
      <thead><tr><th>Datei</th><th>Zweck</th></tr></thead>
      <tbody>
        <tr><td>customer-security-report.pdf</td><td>Lesbarer Kunden- und Auditbericht</td></tr>
        <tr><td>customer-security-report.html</td><td>Barrierearme digitale Berichtsfassung</td></tr>
        <tr><td>sbom.cdx.json</td><td>Maschinenlesbare CycloneDX-SBOM</td></tr>
        <tr><td>SHA256SUMS</td><td>Integritätsprüfung der SBOM</td></tr>
        <tr><td>customer-package.json</td><td>Metadaten und Prüfsummen des Kundenpakets</td></tr>
      </tbody>
    </table>

    <div class="signature">
      <strong>${escapeHtml(manufacturer)}</strong>
      <div>Secure software engineering · transparent by design</div>
      <div style="margin-top:3mm"><a href="${escapeHtml(manufacturerUrl)}">${escapeHtml(manufacturerUrl)}</a> · <a href="mailto:${escapeHtml(securityContact)}">${escapeHtml(securityContact)}</a></div>
    </div>
    <footer class="footer"><span>${escapeHtml(classification)}</span><span>Seite 4</span></footer>
  </section>
</body>
</html>`;

mkdirSync(paths.output, { recursive: true, mode: 0o755 });
const htmlPath = resolve(paths.output, "customer-security-report.html");
const pdfPath = resolve(paths.output, "customer-security-report.pdf");
const manifestPath = resolve(paths.output, "customer-package.json");
writeFileSync(htmlPath, html, { mode: 0o644 });

if (process.env.CUSTOMER_REPORT_SKIP_PDF !== "true") {
  const browserCandidates = [
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const browser = browserCandidates.find((candidate) => existsSync(candidate));
  if (!browser) {
    throw new Error("No supported Chrome or Chromium binary found for PDF rendering");
  }
  execFileSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--allow-file-access-from-files",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "inherit", timeout: 120_000 },
  );
  if (!existsSync(pdfPath)) throw new Error("Chrome did not create the customer PDF");
}

const manifest = {
  schemaVersion: 1,
  documentId,
  classification,
  manufacturer: { name: manufacturer, url: manufacturerUrl, securityContact },
  product: { name: product, version, sourceSha, repositoryUrl },
  generatedAt,
  status: {
    releaseGate: blockingFindings === 0 ? "passed" : "blocked",
    blockingFindings,
    severities,
  },
  inventory: {
    components: components.length,
    services: services.length,
    dependencies: dependencies.length,
    ecosystems: ecosystemCounts.size,
    licenses: licenseIds.size,
  },
  evidence: {
    sbom: { format: "CycloneDX JSON", specVersion: sbom.specVersion, sha256: sbomDigest },
    vulnerabilityScan: { tool: "Trivy", sha256: trivyDigest },
    htmlReport: { file: "customer-security-report.html", sha256: sha256(htmlPath) },
    ...(existsSync(pdfPath)
      ? { pdfReport: { file: "customer-security-report.pdf", sha256: sha256(pdfPath) } }
      : {}),
  },
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o644 });

const readme = `sudo/PORT Software Transparency Package

Product: ${product}
Version: ${version}
Source commit: ${sourceSha}
Document ID: ${documentId}
Generated: ${generatedAt}

Start with customer-security-report.pdf. Verify sbom.cdx.json using SHA256SUMS.
Report security concerns confidentially to ${securityContact}.
`;
writeFileSync(resolve(paths.output, "CUSTOMER-README.txt"), readme, { mode: 0o644 });

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(
    process.env.GITHUB_OUTPUT,
    `html-path=${htmlPath}\npdf-path=${pdfPath}\nmanifest-path=${manifestPath}\n`,
    { flag: "a" },
  );
}
console.log(`Rendered branded customer SBOM report for ${product} ${version}`);
