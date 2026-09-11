// Renders scripts/og-image.html to app/opengraph-image.png using headless Edge (Windows).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const WIDTH = 1200;
const HEIGHT = 630;

const work = mkdtempSync(join(tmpdir(), "og-image-"));
const raw = join(work, "raw.png");

try {
  execFileSync(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--user-data-dir=${join(work, "profile")}`,
      // Taller than the card so browser chrome can never clip it; cropped below.
      `--window-size=${WIDTH},${HEIGHT + 200}`,
      // Gives web fonts and the tagline fit time to settle before the capture.
      "--virtual-time-budget=10000",
      `--screenshot=${raw}`,
      pathToFileURL(resolve("scripts/og-image.html")).href,
    ],
    { stdio: "ignore" }
  );

  await sharp(raw)
    .extract({ left: 0, top: 0, width: WIDTH, height: HEIGHT })
    .png({ compressionLevel: 9 })
    .toFile("app/opengraph-image.png");
  console.log(`Generated app/opengraph-image.png (${WIDTH}x${HEIGHT})`);
} finally {
  try {
    rmSync(work, { recursive: true, force: true });
  } catch {
    // Edge can hold its profile open for a moment after exit; the OS temp cleaner gets it.
  }
}
