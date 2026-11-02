// Builds the web app into ./dist (served by the Worker as static assets).
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(here, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "assets"), { recursive: true });

const js = await build({
  entryPoints: [join(here, "web/main.tsx")],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  alias: { "@": root },
  nodePaths: [join(root, "node_modules")],
  define: { "process.env.NODE_ENV": '"production"' },
  write: false,
  logLevel: "warning",
});
const jsText = js.outputFiles[0].text;

const cssIn = join(here, "web/app.css");
const cssOut = join(dist, "assets/tmp.css");
execFileSync(join(root, "node_modules/.bin/tailwindcss"), ["-c", join(here, "tailwind.config.cjs"), "-i", cssIn, "-o", cssOut, "--minify"], { cwd: root, stdio: "pipe" });
const cssText = readFileSync(cssOut, "utf8");
rmSync(cssOut);

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const jsName = `assets/app.${hash(jsText)}.js`;
const cssName = `assets/app.${hash(cssText)}.css`;
writeFileSync(join(dist, jsName), jsText);
writeFileSync(join(dist, cssName), cssText);

for (const f of ["icon-180.png", "icon-512.png", "manifest.webmanifest"]) copyFileSync(join(here, "web/public", f), join(dist, f));
writeFileSync(
  join(dist, "index.html"),
  readFileSync(join(here, "web/index.html"), "utf8").replace("%CSS%", "/" + cssName).replace("%JS%", "/" + jsName),
);
writeFileSync(join(dist, "_headers"), "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/index.html\n  Cache-Control: no-cache\n");
console.log(`built ${jsName} (${(jsText.length / 1024).toFixed(0)} KB), ${cssName} (${(cssText.length / 1024).toFixed(0)} KB)`);
