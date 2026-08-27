# Changelog

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
