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
  unquoteNumbers: true
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

  if (options.unquoteColors) res = sassVars.unquoteColors(res);
  if (options.unquoteNumbers) res = sassVars.unquoteNumbers(res);

  return res;
};

// color names regular expression
var cssColors = require('css-color-names');
var colorNamesRe = '"(' + Object.keys(cssColors).join('|') + ')"';
colorNamesRe = new RegExp(colorNamesRe, 'g');

// unquote css color values in a string,
// so they can be used properly in sass
sassVars.unquoteColors = function(str) {
  var colors = [];

  // find color values in json
  var colors = []
    // Hex color codes
    .concat(str.match(/"(#([0-9a-f]{3}){1,2})"/g) || [])
    // rgb(a) & hsl(a) colors
    .concat(str.match(/"(rgb|rgba|hsl|hsla)\((\d{1,3}), (\d{1,3}), (\d{1,3})(, 0?\.?\d+)?\)"/g) || [])
    // css color names
    .concat(str.match(colorNamesRe) || []);

  if (colors.length) {
    colors.forEach(function(color) {
      str = str.replace(color, color.slice(1, -1));
    });
  }

  return str;
};

// numbers
var units = require('./css-units');
var lengthRe = new RegExp('"[0-9\.]+(' + units['length'].join('|') + ')"', 'g');
var angleRe = new RegExp('"[0-9\.]+(' + units['angle'].join('|') + ')"', 'g');
var timeRe = new RegExp('"[0-9\.]+(' + units['time'].join('|') + ')"', 'g');

// unquotes css lengths
sassVars.unquoteNumbers = function(str) {
  // find numbers in the json string
  var numbers = []
    .concat(str.match(lengthRe) || [])
    .concat(str.match(angleRe) || [])
    .concat(str.match(timeRe) || []);

  // unquote all numbers found
  if (numbers.length) {
    numbers.forEach(function(number) {
      str = str.replace(number, number.slice(1, -1));
    });
  }

  return str;
};

// removes unit from px lengths in a string, so they can be used
// as numbers in javascript (after `JSON.parse`)
sassVars.floatPixels = function(str) {
  // remove quoted px lengths
  var quotedPx = str.match(/"[0-9\.]+px"/g);
  if (quotedPx) {
    quotedPx.forEach(function(length) {
      str = str.replace(length, length.slice(1, -3));
    });
  }

  // remove plain px lengths
  var plainPx = str.match(/[0-9\.]+px/g);
  if (plainPx) {
    plainPx.forEach(function(length) {
      str = str.replace(length, length.slice(0, -2));
    });
  }

  return str;
};



