/**
 * Copies bundled UI assets for offline Tailwind tfilot page (postinstall).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const fontsDir = path.join(root, 'assets', 'fonts');
const imagesDir = path.join(root, 'assets', 'images');

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFont() {
  mkdirp(fontsDir);
  const candidates = [
    path.join(
      root,
      'node_modules',
      '@fontsource-variable',
      'work-sans',
      'files',
      'work-sans-latin-wght-normal.woff2'
    ),
    path.join(
      root,
      'node_modules',
      '@fontsource-variable',
      'work-sans',
      'files',
      'work-sans-latin-ext-wght-normal.woff2'
    ),
  ];
  const dest = path.join(fontsDir, 'WorkSans-VariableFont_wght.woff2');
  for (const src of candidates) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log('copy-tfilot-assets: copied Work Sans to', dest);
      return;
    }
  }
  console.warn(
    'copy-tfilot-assets: Work Sans woff2 not found; run npm install devDependencies.'
  );
}

function downloadIfMissing(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      resolve(false);
      return;
    }
    mkdirp(path.dirname(dest));
    const file = fs.createWriteStream(dest);
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'tfila-build/1.0 (offline asset fetch)',
          },
        },
        (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          downloadIfMissing(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('copy-tfilot-assets: downloaded background to', dest);
          resolve(true);
        });
      })
      .on('error', (err) => {
        try {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
        } catch (_) {}
        reject(err);
      });
  });
}

async function ensureBackgroundImage() {
  mkdirp(imagesDir);
  const dest = path.join(imagesDir, 'jerusalem-stone-bg.jpg');
  try {
    await downloadIfMissing(
      'https://upload.wikimedia.org/wikipedia/commons/4/4e/Jerusalem_Stone_wall.jpg',
      dest
    );
  } catch (e) {
    console.warn(
      'copy-tfilot-assets: could not download jerusalem-stone-bg.jpg:',
      e.message
    );
    writePlaceholderStoneJpeg(dest);
  }
}

/** Warm neutral JPEG (bundled bytes) so offline installs always have a local texture. */
function writePlaceholderStoneJpeg(dest) {
  const jpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAUGBAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDQoY//2Q==',
    'base64'
  );
  mkdirp(path.dirname(dest));
  fs.writeFileSync(dest, jpeg);
  console.log('copy-tfilot-assets: wrote bundled placeholder jerusalem-stone-bg.jpg');
}

async function main() {
  copyFont();
  await ensureBackgroundImage();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
