# PRIM Funkloch

Ein strategisches Planungstool zur Verwaltung von Trupps und Einsätzen in einem postapokalyptischen Szenario. Visualisiert ein Funknetzwerk und ermöglicht das Aufbauen und Aufrechterhalten von Kommunikationsbrücken zwischen wichtigen Orten unter Berücksichtigung verschiedener Risikostufen und Truppeneigenschaften.

## 🌐 Live Demo

[![richtext](https://github.com/lumsen/PRIM_Funkloch/raw/main/resources/demo-link.png)](https://lumsen.github.io/PRIM_Funkloch/)

**Direktlink:** [Prim Funkloch spielen](https://lumsen.github.io/PRIM_Funkloch/)

Die Anwendung läuft vollständig im Browser und erfordert keine Installation.

## ✨ Features

- **Interaktive Netzwerk-Visualisierung:** Graph der Funkverbindungen und Trupp-Bewegungen mit D3.js
- **Geografische Karte:** Eingebettete Google Maps zur räumlichen Übersicht
- **Mission-Planning:** Planung von Trupp-Einsätzen mit Ressourcen-Management (Batterien) und Risiko-Bewertung
- **Truppen-Management:** Tabelle zur Verwaltung verschiedener Trupp-Typen mit einzigartigen Attributen
- **Einsatz-Verfolgung:** Übersicht aktiver und geplanter Missionen mit Zeit- und Standortdaten
- **Zeitliche Visualisierung:** Slider zur Anzeige der Netzwerk-Aktivität über Zeit

## 🚀 Installation & Ausführung

### Lokale Entwicklung

1. Repository klonen:
   ```bash
   git clone https://github.com/lumsen/PRIM_Funkloch.git
   cd PRIM_Funkloch
   ```

2. Lokalen Webserver starten:
   ```bash
   # Mit Python (empfohlen)
   python -m http.server 8000

   # Oder mit Node.js
   npx http-server . -p 8000
   ```

3. Anwendung im Browser öffnen: [http://localhost:8000](http://localhost:8000)

### GitHub Pages Deployment

Das Projekt kann automatisch auf GitHub Pages deployed werden:

1. Repository-Einstellungen öffnen
2. Unter **Pages** den Branch `main` und Ordner `/root` auswählen
3. Änderungen committen und pushen - Deployment erfolgt automatisch

## 🛠️ Technologien

- **HTML5** & **CSS3** für Struktur und Styling
- **JavaScript ES Modules** für modulare Architektur
- **D3.js** für Graph-Vizualisierungen
- **Google Maps Embed API** für Kartenintegration

## 📁 Projektstruktur

```
PRIM_Funkloch/
├── index.html                 # Hauptdatei
├── src/
│   ├── css/style.css          # Stylesheets
│   └── js/
│       ├── script.js          # Hauptskript
│       ├── classes/           # Klassen (Trupp, Einsatz)
│       ├── data/              # Daten-Strukturen
│       ├── event-listeners/   # Event-Handler
│       ├── logic/             # Planungslogik
│       ├── ui/                # UI-Komponenten
│       └── utils/             # Hilfsfunktionen
└── README.md                  # Diese Datei
```

## 📄 Spielregeln

Siehe `Spielanleitung.txt` für detaillierte Spielregeln und Anweisungen.

## 📄 License

Dieses Projekt ist unter der MIT-License lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🤝 Contributing

Beiträge willkommen! Bitte erstelle ein Issue oder Pull Request für Verbesserungen.
