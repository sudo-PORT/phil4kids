# GlitchTip

Die öffentliche `NEXT_PUBLIC_SENTRY_DSN` muss zur eigenen Instanz
`https://bug.sudoport.de` und exakt zum Kunden-Web-Projekt `4` gehören.
Ohne passende DSN bleibt die Erfassung inaktiv.
Die DSN muss vor dem Browser-Build gesetzt sein; ein Neustart eines alten Builds
ersetzt keine neue Browser-Konfiguration. Native Apps erhalten ein eigenes Projekt.

Browser, Node.js und Edge verwenden dieselbe Grenze vor dem Transport:
Requests einschließlich Headern, Cookies, Abfragen und Bodies, Benutzer,
Extras, Kontext, Breadcrumbs, Tags und ursprüngliche Fehlerwerte werden entfernt.
Fehlertyp, technische Stackpositionen und Event-ID bleiben zur Diagnose erhalten.
Replay, automatische Sessions, Tracing, Profiling und Logs sind deaktiviert.

Optionale Source-Map-Uploads benötigen `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` und
`SENTRY_PROJECT` ausschließlich in der autorisierten Buildumgebung. Sie senden
nur an `https://bug.sudoport.de`; Tokens gehören weder in Browser noch Runtime.

`node scripts/test-glitchtip-config.mjs` führt die tatsächliche gemeinsame Grenze
mit allen drei Konfigurationen aus. Synthetische Formulardaten, falsche Projekt-DSNs
und fremde Hosts prüfen Bereinigung und Routing ohne Netzwerkverkehr.
Nach Deployment sind Browser- und Serverfehler aus der tatsächlichen Anwendung
im richtigen Kundenprojekt nachzuweisen. Die vorbereitete Konfiguration ist
allein noch kein Betriebsnachweis.

Der bestehende Pages-Workflow betreibt nur den Browser. Server-Abnahme benötigt
einen tatsächlich laufenden Next.js-Server.
