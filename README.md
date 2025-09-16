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

## Getting Started

To run this project locally, you have two main options:

### Option 1: Open `index.html` Directly (Simple, but may have limitations)

1.  Navigate to the root directory of the project (`c:\Repo\PRIM_Funkloch`).
2.  Open the `index.html` file directly in your web browser.

*Note: This method might encounter issues with loading modules or certain browser security restrictions.*

### Option 2: Use a Local Web Server (Recommended)

Using a local web server is the recommended way to run this project, as it handles module loading and other web-related functionalities correctly.

1.  **Install a local web server (if you don't have one):**
    *   If you have Node.js and npm installed, you can install a simple HTTP server globally:
        ```bash
        npm install -g http-server
        ```
    *   Alternatively, many code editors (like VS Code with the "Live Server" extension) provide built-in options.

2.  **Start the web server:**
    *   Open your terminal or command prompt.
    *   Navigate to the project's root directory:
        ```bash
        cd c:\Repo\PRIM_Funkloch
        ```
    *   Start the HTTP server. If you installed `http-server`, run:
        ```bash
        http-server
        ```
        (This will typically start a server on `http://localhost:8080` or a similar port.)

3.  **Access the application:**
    *   Open your web browser and go to the address provided by the web server (e.g., `http://localhost:8080`).

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
    *   Your site will be available at the URL: `https://<your-username>.github.io/<your-repo-name>/`
    *   Replace `<your-username>` with your GitHub username and `<your-repo-name>` with the name of your repository.
