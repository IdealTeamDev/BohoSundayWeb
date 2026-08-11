const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const sourceRoot = path.join(process.cwd(), 'public', 'images', 'editions');
const outputRoot = path.join(process.cwd(), 'public', 'images', 'editions-optimized');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getFiles(fullPath);
      }

      if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

async function optimizeImage(sourcePath) {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const parsed = path.parse(relativePath);
  const outputPath = path.join(outputRoot, parsed.dir, `${parsed.name}.webp`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const original = await fs.stat(sourcePath);

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: 1200,
      withoutEnlargement: true,
    })
    .webp({
      quality: 76,
      effort: 5,
    })
    .toFile(outputPath);

  const optimized = await fs.stat(outputPath);

  return {
    file: path.relative(process.cwd(), outputPath),
    originalBytes: original.size,
    optimizedBytes: optimized.size,
  };
}

async function main() {
  const files = await getFiles(sourceRoot);
  const results = await Promise.all(files.map(optimizeImage));

  const originalTotal = results.reduce((sum, item) => sum + item.originalBytes, 0);
  const optimizedTotal = results.reduce((sum, item) => sum + item.optimizedBytes, 0);
  const saved = originalTotal - optimizedTotal;
  const ratio = originalTotal > 0 ? (saved / originalTotal) * 100 : 0;

  console.log(`Optimized ${results.length} images`);
  console.log(`Original: ${(originalTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized: ${(optimizedTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${(saved / 1024 / 1024).toFixed(2)} MB (${ratio.toFixed(1)}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
