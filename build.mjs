// Build a single self-contained offline page for GitHub Pages.
// The older multi-topic modules remain in the repository for rollback,
// but only the focused discharge lesson is shipped.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
const read = p => readFileSync(new URL(p, import.meta.url), "utf8");
const readBin = p => readFileSync(new URL(p, import.meta.url));
const inlineScript = p => "<script>" + read(p).replace(/<\/script/gi, "<\\/script") + "</script>";

let katexCss = read("vendor/katex/katex.min.css");
katexCss = katexCss.replace(/src:\s*url\(([^)]*?\.woff2)\)\s*format\("woff2"\)[^;}]*/g, (match, u) => {
  const path = u.replace(/['"]/g, "");
  const encoded = readBin("vendor/katex/" + path).toString("base64");
  return "src:url(data:font/woff2;base64," + encoded + ') format("woff2")';
});
let html = read("index.html");
const substitutions = [
  ['<link rel="stylesheet" href="vendor/katex/katex.min.css">', "<style>" + katexCss + "</style>"],
  ['<link rel="stylesheet" href="css/entladung.css">', "<style>" + read("css/entladung.css") + "</style>"],
  ['<script src="vendor/katex/katex.min.js"></script>', inlineScript("vendor/katex/katex.min.js")],
  ['<script src="js/entladung.js"></script>', inlineScript("js/entladung.js")]
];
for (const [from, to] of substitutions) {
  if (!html.includes(from)) throw new Error("Missing asset reference: " + from);
  html = html.replace(from, () => to);
}
mkdirSync(new URL("public/", import.meta.url), { recursive: true });
mkdirSync(new URL("dist/", import.meta.url), { recursive: true });
for (const file of ["icon.svg", "manifest.webmanifest", "sw.js"]) {
  copyFileSync(new URL(file, import.meta.url), new URL("public/" + file, import.meta.url));
}
writeFileSync(new URL("public/index.html", import.meta.url), html);
writeFileSync(new URL("dist/artifact.html", import.meta.url), html);
console.log("Built discharge lesson: public/index.html and dist/artifact.html");
