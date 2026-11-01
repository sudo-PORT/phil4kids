# Umsetzung auf der laufenden WordPress-Website

Stand: 1. November 2026. Diese Dateien sind **Redaktionsvorlagen**, keine Behauptung einer Veröffentlichung oder einer insgesamt vollständigen Datenschutzerklärung.

Die öffentliche Website läuft auf WordPress. Der GitHub-Bestand ist ein abweichender Next.js-Entwurf; ein Deployment dieses Bestands wäre kein nachgewiesenes Update des laufenden CMS. Bestehende Shops, Medien und Kontaktwege müssen erhalten bleiben.

## Konkrete Textkorrekturen

- `impressum-inhalt.html`: Anbieter als natürliche Person eindeutig nennen, Kontaktdaten konsistent verlinken, redaktionell Verantwortlichen nach § 18 Abs. 2 MStV ergänzen. Bestehende Lizenz-, Foto- und Designnachweise aus dem CMS unverändert zusätzlich erhalten.
- `datenschutz-hosting-glitchtip.html`: bestätigte Hosting- und Fehlerdiagnoseangaben an passender Stelle in die bestehende Erklärung integrieren; doppelte oder widersprechende Hostingabschnitte entfernen. Kein ungeprüftes Versprechen über Filter, Replay, Löschjob oder AV-Vertragsabschluss.
- Veraltete OS-Plattform und falsche Haftungsverweise auf §§ 7–10 DDG entfernen, soweit vorhanden. Verbraucherschlichtung ist davon getrennt; eine veröffentlichte Teilnahmeerklärung darf ohne Sachklärung nicht umgekehrt werden.

## Vor Veröffentlichung im CMS abzugleichen

- Aktive Plugins, eingebundene Drittdienste, Cookies und deren tatsächliche Zwecke/Laufzeiten auslesen und mit der bestehenden Datenschutzerklärung abgleichen; eine Ergänzung nur um Hosting/GlitchTip genügt nicht für eine Gesamtabnahme.
- Hosting-/Mail-/GlitchTip-Verträge und tatsächliche Löschfristen dokumentieren. GlitchTip-Konfiguration des WordPress-Systems gesondert prüfen; die Filter der Next.js-Projekte sind dafür kein Nachweis.
- Anbieter ist Philipp Greifenberg. Datenschutzkontakt in der derzeitigen Erklärung: phil_gee@gmx.de. Das Impressum zeigt info@playground-music.de, verlinkt aber auf phil_gee@gmx.de. Vorlage nutzt die bereits veröffentlichte Datenschutzadresse; Erreichbarkeit und gewünschte einheitliche Hauptadresse vor CMS-Speicherung prüfen.
- YouTube wird beim Erstaufruf vor einer Auswahl geladen. In Complianz/Theme bis zur Freigabe externer Medien blockieren, einschließlich externer Vorschau-Bilder. Neue Sitzung ohne Auswahl, Ablehnung, Zustimmung und Widerruf prüfen.
- WooCommerce-Shop nicht durch den Next.js-Entwurf ersetzen. Cookies `sbjs_*` für Besucher-/Bestellattribution gesondert prüfen und bei optionalem Tracking erst nach passender Einwilligung setzen. Warenkorb und Kasse getrennt auf notwendige Cookies und Zahlungs-/Versandempfänger abgleichen.
- Adobe Typekit und externe Schriftabrufe tatsächlich prüfen. Nur mit nachgewiesenem Nutzungsrecht lokal hosten oder auf lokal vorhandene/Systemschriften umstellen; sonst passende Einwilligung und Anbieterhinweise. Keine beliebige Adobe-Schrift herunterladen und selbst weiterverteilen.
- Datenschutzlink im Kontaktformular muss auf /datenschutz/ zeigen; kein Root-/404-Ziel. Kontakthinweis ist keine pauschale Werbeeinwilligung.

## Veröffentlichung und Abnahme

Im bestehenden CMS bearbeiten und die bisherige Revision zur Rückkehr erhalten. Anschließend öffentliche Impressum-/Datenschutz-URLs sowie Footer- und Formularlinks prüfen, mobile/weite Ansichten rendern und Netzwerkanfragen/Cookies in vier Consent-Zuständen nachweisen. Keine echten Bestellungen, Kontaktanfragen oder Fehlerereignisse erzeugen. Die fehlende CMS-Anmeldung ist eine Zugriffsgrenze, keine Freigabe zum Ersetzen der gesamten Website.
