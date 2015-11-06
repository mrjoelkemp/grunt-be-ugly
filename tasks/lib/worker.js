#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    grunt = require('grunt'),
    uglify = require('./uglify').init(grunt),
    mkdirp = require('mkdirp');

process.on('message', function(data) {
  var files = data.files,
      options = data.options;

  console.log('Worker ', process.pid, ' got ' + files.length + ' files');

  files.forEach(function (f) {
    var ext = '.js',
        inputPath = path.resolve(options.root, f) + ext,
        outputPath = path.resolve(options.dir, f) + ext,
        dirName = path.dirname(outputPath),
        result;

    try {
      result = uglify.minify([inputPath], null, options);
    }
    catch (e) {
      // TODO: Replace this with the real error processing when es6 support lands
      console.log(inputPath);
      console.log(e);
      return;
    }

    mkdirp.sync(dirName);

    fs.writeFileSync(outputPath, result.min);
    console.log('Uglified ' + f);
  });

  // Indicate that we're done
  process.send('');
});
