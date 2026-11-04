// Baut aus dem Projekt eine einzelne HTML-Datei (alles eingebettet, läuft offline).
// Aufruf: node build.mjs   ->  public/index.html (komplette Seite, zum Hosten)
//                              dist/artifact.html (Fragment für claude.ai-Artifacts)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
const read = p => readFileSync(new URL(p, import.meta.url), "utf8");
const readBin = p => readFileSync(new URL(p, import.meta.url));

// KaTeX-CSS: nur woff2 behalten und als data-URI einbetten
let katexCss = read("vendor/katex/katex.min.css");
katexCss = katexCss.replace(/src:\s*url\(([^)]*?\.woff2)\)\s*format\("woff2"\)[^;}]*/g, (m, u) => {
  const file = u.replace(/['"]/g, "");
  const b64 = readBin("vendor/katex/" + file).toString("base64");
  return `src:url(data:font/woff2;base64,${b64}) format("woff2")`;
});
const css = katexCss + "\n" + read("css/style.css");
const js = ["vendor/katex/katex.min.js", "vendor/katex/auto-render.min.js", "js/config.js", "js/cards.js", "js/diagrams.js", "js/trainer.js", "js/quiz.js", "js/sheets.js", "js/app.js", "js/methods.js", "js/sims.js", "js/sims2.js"]
  .map(read).join("\n;\n")
  .replace(/<\/script/g, "<\\/script");

let body = read("index.html").match(/<body>([\s\S]*?)<script src=/)[1];
const title = "Physik Q1 – Elektrisches Feld";
const noSw = js.replace(/if \("serviceWorker" in navigator[\s\S]*?\n  }\n/, ""); // kein Service Worker in Einzeldatei

mkdirSync(new URL("dist/", import.meta.url), { recursive: true });
mkdirSync(new URL("public/", import.meta.url), { recursive: true });
copyFileSync(new URL("icon.svg", import.meta.url), new URL("public/icon.svg", import.meta.url));
copyFileSync(new URL("manifest.webmanifest", import.meta.url), new URL("public/manifest.webmanifest", import.meta.url));
writeFileSync(new URL("public/index.html", import.meta.url),
`<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title><link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0e1117"><style>${css}</style></head><body>${body}<script>${noSw}</script></body></html>`);

const noSync = noSw.replace(/window\.PHYS_SYNC = \{[\s\S]*?\};/, "window.PHYS_SYNC = null;");
writeFileSync(new URL("dist/artifact.html", import.meta.url),
`<meta name="claude:viewport-fit-sides" content="cover">
<title>${title}</title>
<style>${css}</style>
${body}<script>${noSync}</script>`);
console.log("fertig: public/index.html, dist/artifact.html");
