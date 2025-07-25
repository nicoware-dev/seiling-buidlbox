const { src, dest, parallel } = require('gulp');

function copyIcons() {
  return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

function copyContracts() {
  return src('nodes/**/contracts/**/*.{json,txt,sol,md}').pipe(dest('dist/nodes'));
}

const buildAll = parallel(copyIcons, copyContracts);

exports.default = buildAll;
exports['build:icons'] = copyIcons;
exports['build:contracts'] = copyContracts;
exports['build:all'] = buildAll; 