# sass-vars

Convert between json, scss, and plain javascript objects. Forks the `parseJson` function from [node-sass-import-once](https://github.com/at-import/node-sass-import-once).
If `options.unquoteColors` is set to true, the color values in the sass variable will be unquoted so they can be used properly in your stylesheets.

**Caution**: this module has not been properly tested yet. Use at your own risks.

## Features

- parses Yaml buffers/strings
- parses JSON buffers/strings
- parses plain javascript literals and hashes
- unquote color values (hex, rgb, rgba, hsl, hsla, named CSS colors)

### Coming Soon

- unquote length values (px, em, rem, mm, cm, ...)
- unquote time values (ms, s)
- read files asyncrhoneously (returns a promise)

### Under Consideration

- option to write to a file directly
- indenting resulting sass code (more readable)
- option to get sass syntax output (instead of scss)
- resolving commonjs modules to json before converting

if `options.unquoteLengths` is set to true, the color values in the sass variable will be unquoted so they can be used properly in your stylesheets.

## API

#### `sassVars(data, options)`

    var sassVars = require('sass-vars');

    // values to convert
    var obj = { foo: 'bar', bar: 10, baz: '#f49842' }
    var json = JSON.stringify(obj);
    var ile = 'path/to/js/file'
    var ymlFile = '/path/to/yaml/file.yml'

    sassVars(obj, { name: 'my-obj' });
    sassVars(json, { name: 'my-obj', type: 'json' });
    // => '$my-obj: ("foo": "bar", "bar": 10, "baz": #f429842)';

    // can convert from a .yml, .js or .json file
    // - reads file syncroneously and uses filename by default
    sassVars(file, { isFile: true });
    sassVars(ymlFile, { isFile: true });
    // => '$file: ( ... )';

    // also accepts a buffer
    sassVars(fs.readFileSync(file));
    sassVars(fs.readFileSync(ymlFile));
    // => '$file: ( ... )';

### options

- `name` (string) the name to give to the sass variable. if `isFile` is set to `true`, this will default to the file's name.

- `default` (bool) whether to end the variable declaration with ' !default;' instead of ';'.

- `type`: (string) the type of the data that needs to be converted. if `isFile` is set to true, sassVars will guess it based on the given path. In case a json string is given, setting this option to `'json'` avoids an extra call to `JSON.stringify()`

- `isFile`: (bool) whether a file path was given. If true, sassVars will load the file synchroneously and convert its contents. Defaults to `false`.

- `encoding`: (string) what encoding to use to read file's content. Defaults to 'utf8'.

- `unquoteColors` (bool) whether to unquote color values in the sass variable declaration. Defaults to `true`.
