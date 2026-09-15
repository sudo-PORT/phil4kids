# Changelog

## Unreleased

- DE: Der öffentliche Pull-Request- und Wochen-Security-Lauf verwendet jetzt repo-lokal vendorte,
  fest gepinnte Gitleaks-, Semgrep- und Trivy-Jobs mit fail-closed Enforcement, statt einen für
  öffentliche Repositories nicht erreichbaren internen Workflow aufzurufen. Die deduplizierte
  Issue-Triage läuft nur geplant oder manuell und erhält als einziger Job Schreibrechte.
- EN: The public pull-request and weekly security runs now use repository-local, pinned Gitleaks,
  Semgrep, and Trivy jobs with fail-closed enforcement instead of calling an internal workflow
  that public repositories cannot access. Deduplicated issue triage runs only on schedules or
  manual dispatches and is the only job with write permission.
- DE: Der vendorte CRA-/SBOM-Workflow wartet nach dem Upload jetzt fail-closed auf die
  abgeschlossene Dependency-Track-BOM-Verarbeitung und lehnt ungültige Verarbeitungstoken oder
  Statusantworten ab.
- EN: The vendored CRA/SBOM workflow now waits fail-closed for Dependency-Track to finish BOM
  processing after upload and rejects invalid processing tokens or status responses.

## 2026-08-30 – Eindeutiges Dependency-Track-Projekt

- Der vendorte SBOM-Workflow schreibt alle Branch-, Tag- und Release-Läufe nur
  noch nach `phil4kids/main`; abweichende Projektversionen werden fail-closed
  abgewiesen. Unveränderliche Release-Historie bleibt in den SBOM-Artefakten
  und Attestierungen erhalten, ohne neue Dependency-Track-Projekte anzulegen.

## 2026-08-27 – Sicherheitsaktualisierung der Web-Plattform

- Next.js auf 16.3.3 sowie die zugehörige ESLint-Konfiguration aktualisiert und
  dynamische Routen auf die asynchrone Parameter-API migriert.
- Der lokale HIGH-/CRITICAL-Scan ist ohne offene produktive Befunde; Lint und
  Produktions-Build laufen mit dem aktualisierten Lockfile erfolgreich.

<!-- cra-evidence-gate-2026-08-27 -->
## 2026-08-27 – Verbindliches CRA-Evidenz-Gate

- Den im oeffentlichen Repository vendorten SBOM-Workflow auf den qualifizierten
  Zentralstand `3563a31df3d53e66de2d8245b04e179a315cb720` aktualisiert und fuer
  Pull Requests sowie jeden freigegebenen `main`-Stand aktiviert.
- Dependency-Track-Upload und Sigstore-Attestierung sind fuer Release-Staende
  verpflichtend; vorhandene Produktionsdeployments starten erst nach dem
  erfolgreichen, commitgebundenen CRA-Gate.
- Der woechentliche Secret-, SAST- und Schwachstellenscan laeuft fail-closed;
  Befunde erzeugen oder aktualisieren automatisch den zentralen Security-
  Arbeitsauftrag und werden erst nach einem sauberen Lauf geschlossen.
- Das gebrandete Kundenpaket enthaelt nun sowohl CycloneDX JSON 1.6 als auch
  SPDX JSON 2.3 samt gemeinsamer Commitbindung und SHA-256-Nachweisen.

<!-- cra-sbom-public-workflow-2026-08-27 -->
## 2026-08-27 – Öffentlicher CRA-SBOM-Workflow

- Den geprüften CRA-SBOM-Workflowstand samt minimal benötigtem Report-Renderer
  repo-lokal eingebunden, weil öffentliche GitHub-Repositories keine internen
  wiederverwendbaren Workflows aufrufen können. Tool-Prüfsummen, Action-SHAs,
  Fail-closed-Richtlinie, Kundenpaket und Dependency-Track-Identität bleiben
  unverändert.

<!-- cra-sbom-release-2026-08-27 -->
## 2026-08-27 – CRA-SBOM-Standard

- Einen auf den geprüften Zentralworkflow `4c532553a480e7ecfba33c914ae9b8ae819a2848`
  gepinnten Release-Caller ergänzt. Hauptbranch-Läufe aktualisieren
  `phil4kids/main` als neuesten Dependency-Track-Stand; das Kundenpaket enthält CycloneDX-SBOM,
  Prüfnachweise sowie den gebrandeten PDF-, HTML- und ZIP-Bericht.

<!-- sudoport-project-page-2026-08-23 -->
## 2026-08-23 — Projektseite

- eigenständige GitHub-Projektseite für Phil4Kids ergänzt
- Zweck, Zielgruppe, Funktionsschwerpunkte, Status und Repository-Grenze dokumentiert
- Projektseite aus dem README-Kopf verlinkt

<!-- sudo-security-rollout-2026-08-25 -->
## 2026-08-25 – Wöchentliche Security-Automation

- Einen SHA-gepinnten Wochenlauf für Gitleaks, Semgrep Community Edition und Trivy aktiviert.
- Befunde werden ohne Secret-Werte in einem deduplizierten `security-scan`-Issue nachverfolgt; ein sauberer Lauf schließt nur dieses Bot-Issue.
