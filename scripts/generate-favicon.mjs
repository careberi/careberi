import sharp from "sharp";
import { mkdirSync } from "fs";

// Tight square crop around just the circle cluster (no ears), matching the
// scope of the original inline-SVG favicon, padded evenly on all sides.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="31 86 220 220">
  <g stroke="#FFFFFF" stroke-width="3">
    <circle cx="117" cy="120" r="24" fill="#5AA9DE" />
    <circle cx="165" cy="120" r="24" fill="#2A5D9F" />
    <circle cx="93" cy="158" r="24" fill="#2F80C2" />
    <circle cx="141" cy="158" r="24" fill="#16265C" />
    <circle cx="189" cy="158" r="24" fill="#5AA9DE" />
    <circle cx="93" cy="196" r="24" fill="#2A5D9F" />
    <circle cx="141" cy="196" r="24" fill="#2F80C2" />
    <circle cx="189" cy="196" r="24" fill="#16265C" />
    <circle cx="117" cy="234" r="24" fill="#16265C" />
    <circle cx="165" cy="234" r="24" fill="#2F80C2" />
    <circle cx="141" cy="272" r="24" fill="#2A5D9F" />
  </g>
</svg>
`;

mkdirSync("app", { recursive: true });

const svgBuffer = Buffer.from(svg);

await sharp(svgBuffer, { density: 384 })
  .resize(512, 512)
  .png()
  .toFile("app/icon.png");

await sharp(svgBuffer, { density: 384 })
  .resize(180, 180)
  .png()
  .toFile("app/apple-icon.png");

console.log("Generated app/icon.png and app/apple-icon.png");
