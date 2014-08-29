'use strict';

module.exports = function(grunt) {
  'use strict';

  var uglify = require('./lib/uglify').init(grunt);
  var async = require('async');
  var path = require('path');

  /**
   * Serially minifies the given files
   *
   * @param  {String[]} files
   * @param  {Object} options - build config
   * @param  {String} options.root - the input directory
   * @param  {String} options.dir - the output directory
   */
  function minify(files, options) {
    files.forEach(function (f) {
      var inputPath = path.resolve(options.root, f) + '.js';
      var outputPath = path.resolve(options.dir, f) + '.js';
      var result;

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
        grunt.log.warn('Uglifying source "' + f + '" failed.');
        grunt.fail.warn(err);
      }

      grunt.file.write(outputPath, result.min);
    });
  }

  grunt.registerMultiTask('be_ugly', 'Parallel uglification', function () {
    var options = this.options({
      limit: require('os').cpus().length,
      uglify2: {
        output: {
          beautify: false
        }
      },
      // Directory to build to
      dir: '',
      banner: '',
      footer: '',
      compress: {
        warnings: false
      },
      mangle: {},
      report: false,
      warnings: false
    });

    var done = this.async();

    if (!this.data.root) {
      grunt.warn('root not supplied');
    }

    // Data mapping from build config to uglify
    options.root = this.data.root;
    options.dir = this.data.buildRoot || this.data.root;
    options.beautify = options.uglify2.output.beautify || options.beautify;

    var bundles;

    // If we want to uglify a user-specified set of files
    if(this.files && this.files.length) {
      // Make js files look like bundle names
      bundles = this.files.map(function(fileObj) {
        // Dest already has the name without the root
        return fileObj.dest.replace('.js', '');
      });
    }
    // Or we just want to uglify the bundles/modules
    else {
      var bundles = options.modules.map(function(bundle) {
        return bundle.name
      });
    }

    if (options.limit > bundles.length) {
      options.limit = bundles.length;
    }

    var files = [];
    for (var i = 0; i !== options.limit; ++i) {
      files.push([]);
    }

    bundles.forEach(function (filename, index) {
      files[index % options.limit].push(filename);
    }, this);

    var tasks = files.map(function(batch) {
      return function(callback) {
        minify(batch, options);
        callback();
      };
    });

    async.parallel(tasks, function() {
      console.log('Done uglifying');
      done();
    });
  });
};
