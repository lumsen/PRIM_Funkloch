# PRIM Funkloch

PRIM Funkloch is a strategic planning tool designed for managing squads and missions within a post-apocalyptic scenario. The application visualizes a radio network, allowing users to establish and maintain communication bridges between key locations while considering various risk levels and squad capabilities.

## Features

*   **Radio Network Visualization:** Interactive graph displaying communication links and squad movements, powered by D3.js.
*   **Geographical Map Integration:** Embedded Google Maps for a spatial overview of the operational area.
*   **Mission Planning:** Tools to plan and manage squad deployments, including resource management (batteries) and risk assessment.
*   **Squad Management:** Interface to add, view, and manage different types of squads with unique attributes (strength, range, speed, equipment).
*   **Mission Tracking:** Table to monitor ongoing and planned missions, including start/end times and locations.
*   **Timeline Visualization:** A slider to visualize network activity and squad movements over time.

## Technologies Used

*   HTML
*   CSS
*   JavaScript (ES Modules)
*   D3.js (for graph visualization)

## 🌐 **Live Demo**

PRIM Funkloch ist **live verfügbar** auf GitHub Pages:

➡️ **[Start PRIM Funkloch](https://lumsen.github.io/PRIM_Funkloch/)** ←️

Die Anwendung läuft vollständig im Browser und erfordert keine Installation.

## 🚀 Lokale Entwicklung

Für lokale Entwicklung empfehlen wir einen lokalen Webserver:

1.  **Webserver starten:**
    ```bash
    # Mit Node.js (falls verfügbar)
    npx http-server . -p 8080

    # Mit Python 3
    python -m http.server 8080

    # Oder verwenden Sie den integrierten Server Ihrer IDE (z.B. VS Code Live Server)
    ```

2.  **Anwendung öffnen:**
    Navigieren Sie zu: `http://localhost:8080`

3.  **GitHub Pages Deployment:**
    Das Projekt ist **sofort GitHub Pages ready** mit relativen Pfaden und optimiertem Asset-Loading.

## File Structure

*   `index.html`: The main HTML file.
*   `src/css/style.css`: Stylesheets for the application.
*   `src/js/`: Contains all JavaScript logic.
    *   `data/`: Stores application data (graph, squads, missions).
    *   `event-listeners/`: Handles user interactions.
    *   `logic/`: Core mission planning logic.
    *   `ui/`: UI components for rendering tables, graphs, etc.
    *   `utils/`: Utility functions.
*   `Spielanleitung.txt`: Game instructions.
*   `eslint.config.js`: ESLint configuration.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `LICENSE`: Project license information.
*   `package.json` / `package-lock.json`: Node.js package management files.

## Automatic Deployment to GitHub Pages

This project can be automatically deployed to GitHub Pages. Follow these steps:

1.  **Enable GitHub Pages:**
    *   Navigate to your repository's **Settings** on GitHub.
    *   In the left sidebar, click on **Pages**.
    *   Under the "Source" section, select the branch you want to deploy from. For this project, it is recommended to use the `main` branch.
    *   Choose the root folder (`/`) as the source.
    *   Click **Save**.

2.  **Commit and Push Changes:**
    *   Ensure all your latest changes are committed to your local repository.
    *   Push your changes to the `main` branch:
        ```bash
        git add .
        git commit -m "Add README and deployment instructions"
        git push origin main
        ```
    *   After pushing, GitHub Pages will automatically build and deploy your site. It may take a few minutes for the deployment to become active.

3.  **Access Your Deployed Site:**
    *   Your site will be available at the URL: `https://lumsen.github.io/PRIM_Funkloch/`
    *   Der Link ist auch oben in der Live Demo Sektion verlinkt.

## 🔧 GitHub Pages Optimierungen

Dieses Projekt wurde speziell für GitHub Pages optimiert:

### ✅ Bereits umgesetzt:
- **Relative Pfade** statt absoluter Pfade für alle Ressourcen
- **Kein Base Path** erforderlich (spitzt auf Root-Ebene)
- **Modulare JavaScript Architektur** mit ES6 Modulen
- **CORS-freundliche** Ressourcen-Struktur
- **LocalStorage** für Daten-Persistenz
- **Error Boundaries** mit userfreundlichen Meldungen
- **Performance Optimierungen** mit Debouncing und Memoization

### 🚀 Bereit für Deploy:
1. Aktivieren Sie **GitHub Pages** in den Repository-Einstellungen
2. Wählen Sie den `main` Branch und Root-Folder als Quelle
3. Das Projekt wird **automatisch deployed** und ist sofort verfügbar

### Entwicklungshinweise:
- **Alle Tests** erfolgreich in Standards-Browsern
- **Keine externen Abhängigkeiten** außer D3.js (CDN)
- **Kompatibel** mit GitHub Pages Security-Einschränkungen
- **Fallback-Mechanismen** für fehlende Features
