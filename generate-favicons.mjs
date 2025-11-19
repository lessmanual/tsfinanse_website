import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'favicon.svg');
const publicDir = join(__dirname, 'public');

// Read SVG file
const svgBuffer = readFileSync(svgPath);

// Sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

console.log('🎨 Generating favicons from SVG...\n');

// Generate PNG files
for (const { name, size } of sizes) {
  const outputPath = join(publicDir, name);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅ Generated ${name} (${size}x${size})`);
}

// Generate favicon.ico (multi-resolution ICO with 16, 32, 48)
console.log('\n🔧 Generating favicon.ico...');

// Create 16x16, 32x32, 48x48 for ICO
const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

// For ICO file, we'll use the 32x32 as the main icon
// (Full ICO generation requires additional library, so we use 32x32 PNG as .ico)
writeFileSync(join(publicDir, 'favicon.ico'), ico32);
console.log('✅ Generated favicon.ico (32x32 base)');

console.log('\n✨ All favicons generated successfully!');
console.log('\n📋 Generated files:');
sizes.forEach(({ name }) => console.log(`   - public/${name}`));
console.log('   - public/favicon.ico');
