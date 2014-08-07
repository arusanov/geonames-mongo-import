#! /usr/bin/env node

'use strict';

var GeonamesImport = require('./lib/geonames-import');
var userArgs = process.argv;
var searchParam = userArgs[2];

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1) {
    return console.log('input stream with csv output as mongodb export file');
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}


var importer = new GeonamesImport();
importer
  .from(process.stdin)
  .convert().pipe(process.stdout);
