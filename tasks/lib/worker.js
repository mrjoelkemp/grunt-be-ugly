#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    grunt = require('grunt'),
    uglify = require('./uglify').init(grunt);

process.on('message', function(data) {
  var files = data.files,
      options = data.options;

  console.log('Worker ', process.pid, ' got ' + files.length + ' files');

  files.forEach(function (f) {
    var ext = '.js',
        inputPath = path.resolve(options.root, f) + ext,
        outputPath = path.resolve(options.dir, f) + ext,
        result;

    try {
      result = uglify.minify([inputPath], null, options);
    }
    catch (e) {
      console.log(e);
      var err = new Error('Uglification failed.');

      if (e.message) {
        err.message += '\n' + e.message + '. \n';
        if (e.line) {
          err.message += 'Line ' + e.line + ' in ' + f + '\n';
        }
      }

      err.origError = e;
      process.send('error');
      throw err;
    }

    fs.writeFileSync(outputPath, result.min);
    console.log('Uglified ' + f);
  });

  // Indicate that we're done
  process.send('');
});
