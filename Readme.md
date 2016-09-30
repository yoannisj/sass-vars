# sass-vars

Convert between json, scss, and plain javascript objects. Forks the `parseJson` function from [node-sass-import-once](https://github.com/at-import/node-sass-import-once).
If `options.unquoteColors` is set to true, the color values in the sass variable will be unquoted so they can be used properly in your stylesheets.

## Features

- parses Yaml buffers/strings
- parses JSON buffers/strings
- parses plain javascript literals and hashes
- unquote color values (hex, rgb, rgba, hsl, hsla, named CSS colors)

### Coming Soon

- unquote length values (px, em, rem, mm, cm, ...)
- unquote time values (ms, s)

if `options.unquoteLengths` is set to true, the color values in the sass variable will be unquoted so they can be used properly in your stylesheets.