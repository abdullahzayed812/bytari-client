const fs = require('fs');
const path = require('path');

// metro packages that @expo/cli / @expo/metro-config access via internal paths
const packages = [
  'metro',
  'metro-cache',
  'metro-config',
  'metro-core',
  'metro-transform-worker',
];

for (const pkg of packages) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', pkg, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.log(`${pkg}: not found, skipping`);
    continue;
  }

  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!json.exports) {
    console.log(`${pkg}: no exports field, skipping`);
    continue;
  }

  if (json.exports['./src/*'] && json.exports['./src/*.js']) {
    console.log(`${pkg}@${json.version}: already patched, skipping`);
    continue;
  }

  // './src/*.js' must come first so imports that already end in .js are matched
  // exactly (preventing double-.js). './src/*' catches bare extension-less imports
  // and appends .js so Node can find the file.
  const patched = {};
  for (const [k, v] of Object.entries(json.exports)) {
    patched[k] = v;
  }
  patched['./src/*.js'] = './src/*.js';
  patched['./src/*'] = './src/*.js';

  json.exports = patched;
  fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`Patched ${pkg}@${json.version}: added ./src/*.js and ./src/* to exports`);
}
