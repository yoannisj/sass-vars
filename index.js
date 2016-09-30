'use-strict';

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

// options:
// - format: {string:'scss'}
// - name: {string:path.name} [undefined]
// - type: {string:'json|yaml|js'} [undefined]
// - isFile: {bool:true|false} [undefined]
// - default: {bool:true|false}
// - unquoteColors: {bool:true|false} [true]
// - unquoteLengths: {bool:true|false} [true]

var defaults = {
  // format: 'scss',
  // name: undefined,
  default: false,
  // type: undefined,
  isFile: false,
  encodig: 'utf8',
  unquoteColors: true,
  // unquoteLengths: true
};

var sassVars = module.exports = function(data, options) {
  // inject default options
  options = Object.assign({}, defaults, options);

  // load file if filename is passed
  if (options.isFile && typeof data == 'string') {
    var extname = path.extname(data);
    // default to file extension for 'options.type'
    options.type = options.type || extname.substr(1);
    // default to file name for 'options.name'
    options.name = options.name || path.basename(data, extname);

    // retreive data from file contents
    data = data = fs.readFileSync(data, 'utf8');
  }

  // set type to 'js' if none given explicitly
  options.type = options.type || 'js';

  switch (options.type) {
  case 'yaml':
  case 'yml':
    return sassVars.parseYaml(data, options);
  case 'json':
    return sassVars.parseJson(data, options);
  default:
    return sassVars.parseJs(data, options);
  }

};

// parses a yaml string and converts it to represent a valid 'scss' variable
// - recognizes colors and unquotes them so they can be used in Sass.
sassVars.parseYaml = function(data, options) {
  // inject default options
  options = Object.assign({}, defaults, options);

  // convert buffer to string
  if (data instanceof Buffer) data.toString(options.encoding);

  // parse yaml file into javascript object
  data = yaml.safeLoad(data);

  // convert to json to parse the data
  return sassVars.parseJson( JSON.stringify(data), options );
};

// parses a js object and converts it to represent a valid 'scss' variable
sassVars.parseJs = function(data, options) {
  // inject default options
  options = Object.assign({}, defaults, options);

  // convert buffer to string
  if (data instanceof Buffer) data.toString(options.encoding);

  // convert to json to parse the data
  return sassVars.parseJson( JSON.stringify(data), options );
}

// parses a json string and converts it it to represent a valid 'scss' variable
// - recognizes colors and unquotes them so they can be used in Sass.
sassVars.parseJson = function(data, options) {
  // inject default options
  options = Object.assign({}, defaults, options);

  // convert buffer to string
  if (data instanceof Buffer) data.toString(options.encoding);

  // start sass variable declaration
  var res = '$' + options.name + ': ';

  // replace brackets
  data = data.replace(/\{/g, '(');
  data = data.replace(/\[/g, '(');
  data = data.replace(/\}/g, ')');
  data = data.replace(/\]/g, ')');

  res += data;

  // remove trailing linefeed
  if (res.substr(res.length - 1) === '\n') {
    res = res.slice(0, -1);
  }

  // complete sass variable declaration
  res += options.default ? ' !default;' : ';';

  if (options.unquoteColors) {
    res = sassVars.unquoteColors(res);
  }

  return res;
};

// color names regular expression
var cssColors = require('css-color-names');
var colorNamesRe = '"(' + Object.keys(cssColors).join('|') + ')"';
colorNamesRe = new RegExp(colorNamesRe, 'g');

sassVars.unquoteColors = function(val) {
  var colors;
  
  // Css color names
  // val = val.replace(cssColorNames, function(color) {
  //   return cssColors[color];
  // });

  // Hex colors
  colors = val.match(/"(#([0-9a-f]{3}){1,2})"/g);
  if (colors) {
    colors.forEach(function (color) {
      val = val.replace(color, color.slice(1, -1));
    });
  }

  // RGB/A Colors
  colors = val.match(/"(rgb|rgba)\((\d{1,3}), (\d{1,3}), (\d{1,3})\)"/g);
  if (colors) {
    colors.forEach(function (color) {
      val = val.replace(color, color.slice(1, -1));
    });
  }

  // HSL/A Colors
  colors = val.match(/"(hsl|hsla)\((\d{1,3}), (\d{1,3}), (\d{1,3})\)"/g);
  if (colors) {
    colors.forEach(function (color) {
      val = val.replace(color, color.slice(1, -1));
    });
  }

  // Css color names
  colors = val.match(colorNamesRe);
  if (colors) {
    colors.forEach(function(color) {
      val = val.replace(color, color.slice(1, -1));
    });
  }

  return val;
};