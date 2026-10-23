# GlitchTip

Die öffentliche Projekt-DSN wird beim Build über `NEXT_PUBLIC_SENTRY_DSN` gesetzt.
Ohne DSN bleibt das SDK inaktiv. `NEXT_PUBLIC_SENTRY_ENVIRONMENT` kann die Umgebung benennen.
Fehler werden in Browser, Node.js und Edge erfasst; Performance, Replay, automatische
Browser-Sessions und Profiling sind deaktiviert. Request-Bodies, Header, Cookies,
URL-Abfragen, Benutzerkontext, Extras und Breadcrumbs werden vor dem Versand entfernt.

`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` und optional `SENTRY_RELEASE` gehören
nur in die autorisierte Build-Umgebung. Source Maps werden nur bei vollständiger
Upload-Konfiguration zu `https://bug.sudoport.de` gesendet. Keine Token in Browser oder Git.

Der aktuelle Workflow `.github/workflows/nextjs.yml` exportiert nach GitHub Pages;
dort ist nur der Browser aktiv. Eine Serverabnahme setzt einen tatsächlich betriebenen
Next.js-Server voraus. Nach dem Build einen synthetischen Browserfehler im richtigen
GlitchTip-Projekt nachweisen; dies ist noch kein durchgeführter Betriebsnachweis.
