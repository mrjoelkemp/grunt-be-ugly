var path = require('path'),
    fork = require('child_process').fork,
    q = require('q');

module.exports = function(grunt) {
  var defaultOptions = {
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
      };

  grunt.registerMultiTask('be_ugly', 'Parallel uglification', function () {
    var options = this.options(defaultOptions),
        done = this.async(),
        workers = [],
        bundles;

    if (!this.data.root) {
      grunt.warn('root not supplied');
    }

    // Data mapping from build config to uglify
    options.root = this.data.root;
    options.dir = this.data.buildRoot || this.data.root;
    options.beautify = options.uglify2.output.beautify || options.beautify;

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
      bundles = options.modules.map(function(bundle) {
        return bundle.name;
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

    q.all(files.map(function(batch) {
      var deferred = q.defer(),
          workerPath = __dirname + '/lib/worker.js',
          worker = fork(workerPath);

      workers.push(worker);

      worker.send({
        files: batch,
        options: options
      });

      worker.on('message', function(error) {
        if (error) {
          deferred.reject();
        }
        else {
          deferred.resolve();
          worker.kill();
        }
      });

      return deferred.promise;
    }))
    .done(function() {
      console.log('Done uglifying');
      done();
    },
    function() {
      workers.forEach(function(worker) {
        worker.kill();
      });
      done(false);
    });
  });
};
