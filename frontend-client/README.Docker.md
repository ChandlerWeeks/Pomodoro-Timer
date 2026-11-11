# Frontend development container

From the repository root, run `docker compose up --build -d --wait` to start
both services. Open http://localhost:5173.

To start only the frontend, run `docker compose up --build -d --wait` in this
folder. The browser expects the API at http://localhost:3000.

Source and configuration files are mounted for live reload. After changing
package.json or package-lock.json, run the build command again.

This image runs the Vite development server. See the root README for the full
environment setup and music library configuration.
