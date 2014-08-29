# grunt-be-ugly

> Parallel uglification

## Getting Started
This plugin requires Grunt `~0.4.5`

```shell
npm install grunt-be-ugly --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-be-ugly');
```

### Usage

```js
grunt.initConfig({
  be_ugly: {
    options: grunt.file.readJSON('path/to/my/build/config.json'),
    app: {
      // Required
      root: 'path/to/my/js',
      // Optional
      buildRoot: 'where/my/built/js/should/go'
    }
  }
});
```

### Options

#### options
Type: `Object`

Your Requirejs build configuration settings.

This plugin specifically cares about the following options:

###### options.uglify2

```js
uglify2: {
  output: {
    beautify: true
  }
}
```

###### options.modules

The list of modules that should be built by r.js

#### target.root (target is called `app` in the example usage)
Type: `String`

The path to your JS codebase

#### target.buildRoot
Type: `String`

Default: The value supplied to target.root

The path to where you uglified JS should be stored. Defaults
to the location of your codebase if not specified – uglifying files in place.

#### target.files
*Optional*

Type: `String[]`

Default: `undefined`

The list of files to uglify, if you don't want to just bundle the r.js config's modules.
This list of files takes priority over the bundles.

You can glob too:

```js
files: [{
  expand: true,
  cwd: 'path/to/my/js',
  src: '**/*.js'
}]
```

---

Inspired by the [grunt-parallel-uglify](https://github.com/magicsky/grunt-uglify-parallel) project.
