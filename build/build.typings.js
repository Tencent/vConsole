const fs = require('fs');
const { execSync } = require('child_process');
const vendorConfig = require('./vendor.json');

const main = () => {
  console.group('\nEmitting type declarations...');
  const distFile = './dist/vconsole.min.d.ts';
  if (fs.existsSync(distFile)) {
    fs.unlinkSync(distFile);
  }
  execSync('tsc --build ./tsconfig.type.json');
  let distContent = fs.readFileSync(distFile, 'utf8');
  for (const name of vendorConfig.name) {
    distContent = distContent.replace(new RegExp(`['"]${name}['"]`, 'g'), `"vendor/${name}"`);
  }
  const vendorContent = '/// <reference path="../build/vendor.d.ts" />\n\n';
  fs.writeFileSync(distFile, vendorContent + distContent, 'utf8');
  console.groupEnd();
};

main();