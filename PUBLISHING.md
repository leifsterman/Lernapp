# Veröffentlichung der Lern-App

## Aktueller Stand

Die Webseite ist vollständig gebaut und wird bei jedem Commit in `main` durch `.github/workflows/prepare-gh-pages.yml` mit Node 22 und allen Tests auf den **`gh-pages`-Branch** geschrieben.

Der bisherige artefaktbasierte GitHub-Pages-Workflow wurde wegen eines wiederkehrenden GitHub-internen Deployment-Timeouts auf manuelle Ausführung begrenzt. Das Problem liegt **nach** erfolgreichem Build und Upload; es wurde auch nach Beseitigung des alten hängenden Deployment-Eintrags beobachtet. Die App selbst baut erfolgreich.

## Einmalige GitHub-Einstellung

Im Repository auf **Settings → Pages → Build and deployment** gehen:

- **Source:** Deploy from a branch
- **Branch:** `gh-pages`
- **Folder:** `/(root)`
- **Save**

Direktlink: https://github.com/leifsterman/Lernapp/settings/pages

Die fertig gebauten Dateien `index.html`, `entladung.html`, `icon.svg`, `manifest.webmanifest`, `sw.js` und `.nojekyll` sind bereits im `gh-pages`-Branch vorhanden.

Website: https://leifsterman.github.io/Lernapp/

**Wichtige Einschränkung:** GitHub dokumentiert, dass ein `gh-pages`-Push durch einen Workflow mit `GITHUB_TOKEN` **nicht** automatisch den Pages-Build auslöst. Die Änderung der Pages-Quelle auf diesen Branch kann die erste Veröffentlichung anstoßen; spätere Versionswechsel benötigen ggf. einen Push durch einen Nutzer mit bestätigter E-Mail, einen dafür berechtigten GitHub-App-Token, oder wieder den manuellen artefaktbasierten Pages-Workflow, sobald GitHub Pages stabil arbeitet.

Dokumentation: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
