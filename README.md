# ZAP-Archiv

Statische Website für das Archiv der ZAP-Prüfungen des Langgymnasiums mit Prüfungsunterlagen, Lösungen, Notenrechnern und Mehrsprachigkeit in Deutsch, Englisch, Französisch und Italienisch.

## Website

[Website](https://adrai.github.io/zap-archiv)

## Projektstruktur

- `index.html` enthält die komplette Seitenstruktur.
- `lib/main.js` steuert Downloads, Notenrechner, Tabellen und Diagramm.
- `lib/style.css` enthält das gesamte Styling.
- `archiv/` enthält die PDF-Dateien pro Jahrgang.
- `locales/` enthält die Übersetzungen für alle unterstützten Sprachen.

## Lokal testen

Da das Projekt keine Build-Pipeline nutzt, reicht ein einfacher statischer Server oder das direkte Öffnen von `index.html` im Browser.

Beispiele:

```bash
python3 -m http.server 8000
```

oder

```bash
npx serve .
```

Danach die Seite unter `http://localhost:8000` oder der vom Tool ausgegebenen URL öffnen.

## Funktionalität

- Jahreskarten mit Einzel-Downloads und ZIP-Download pro Jahr
- Gesamter Archiv-Download als ZIP
- Beispieltabellen und Diagramm für Mathematik und Deutsch
- Spezifische und generische Notenrechner
- Rechner für die Gesamtnote
- Lokalisierung über `i18nextify`

## Hinweise für Beiträge

- Die Seite ist bewusst ohne Frameworks und Build-Schritte gehalten.
- Änderungen an Texten sollten immer in allen Dateien unter `locales/` nachvollzogen werden.
- Neue PDF-Dateien müssen der bestehenden Namenskonvention unter `archiv/<jahr>/` folgen.