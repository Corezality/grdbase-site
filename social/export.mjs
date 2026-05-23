import puppeteer from 'puppeteer';
import { readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlDir = join(__dirname, 'html');
const outDir = join(__dirname, 'output');

const SIZES = {
  'linkedin': { width: 1200, height: 627 },
  'story': { width: 1080, height: 1920 },
  'default': { width: 1080, height: 1080 },
};

function sizeForFile(name) {
  if (name.includes('linkedin')) return SIZES.linkedin;
  if (name.includes('story')) return SIZES.story;
  return SIZES.default;
}

async function main() {
  const files = (await readdir(htmlDir)).filter((f) => f.endsWith('.html')).sort();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const file of files) {
    const { width, height } = sizeForFile(file);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(join(htmlDir, file)).href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.evaluate(() => document.fonts.ready);
    const outName = basename(file, '.html') + '.png';
    await page.screenshot({
      path: join(outDir, outName),
      type: 'png',
      clip: { x: 0, y: 0, width, height },
    });
    console.log(`✓ ${outName} (${width}×${height})`);
  }

  await browser.close();
  console.log(`\nExported ${files.length} images to social/output/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
