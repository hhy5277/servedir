/*!
 * servedir HTTP Server
 * http://github.com/rem/servedir
 *
 * Copyright 2011, Remy Sharp
 * http://remysharp.com
*/

// Convenience aliases.
var createServer = require('http').createServer, parse = require('url').parse,
path = require('path'), fs = require('fs'),

// Common MIME types.
mime = {
  'aiff': 'audio/x-aiff',
  'atom': 'application/atom+xml',
  'bmp': 'image/bmp',
  'css': 'text/css',
  'gif': 'image/gif',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'ics': 'text/calendar',
  'jpeg': 'image/jpeg',
  'js': 'text/javascript',
  'json': 'application/json',
  'mathml': 'application/mathml+xml',
  'midi': 'audio/midi',
  'mov': 'video/quicktime',
  'mp3': 'audio/mpeg',
  'mpeg': 'video/mpeg',
  'ogg': 'application/ogg',
  'pdf': 'application/pdf',
  'png': 'image/png',
  'rtf': 'application/rtf',
  'sh': 'application/x-sh',
  'svg': 'image/svg+xml',
  'swf': 'application/x-shockwave-flash',
  'tar': 'application/x-tar',
  'tiff': 'image/tiff',
  'txt': 'text/plain',
  'wav': 'audio/x-wav',
  'xhtml': 'application/xhtml+xml',
  'xml': 'text/xml',
  'xsl': 'application/xml',
  'xslt': 'application/xslt+xml',
  'zip': 'application/zip'
},

// Configure the root directory, port, and default MIME type.
root = process.argv[2], port = process.argv[3],
defaultMime = 'application/octet-stream';

// MIME type aliases for different extensions.
mime.aif = mime.aiff;
mime.htm = mime.html;
mime.jpe = mime.jpg = mime.jpeg;
mime.jsonp = mime.js;
mime.xht = mime.xhtml;
mime.tif = mime.tiff;
mime.mpg = mime.mpeg;
mime.mid = mime.midi;
mime.rb = mime.txt;

// Use port 8000 if the port was omitted.
if (!port) {
  port = 8000;
}

// Use the current directory if the root directory was omitted.
if (!root || (root = Math.ceil(root)) > -1) {
  // Port number specified.
  port = root || port;
  root = process.cwd();
}

// Create a new simple HTTP server.
createServer(function(req, res) {
  // Resolve the path to the requested file or folder.
  var pathname = parse(decodeURIComponent(req.url)).pathname,
  file = path.join(root, pathname);
  path.exists(file, function(exists) {
    if (!exists) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('The file ' + file + ' was not found.');
    } else {
      // Serve files and directories.
      fs.stat(file, function(err, stats) {
        if (err) {
          // Internal server error; avoid throwing an exception.
          res.writeHeader(500, {'Content-Type': 'text/plain'});
          res.end('An internal server error occurred: ' + err);
        } else if (stats.isFile()) {
          // Read and serve files.
          fs.readFile(file, 'binary', function(err, contents) {
            if (err) {
              // Internal server error; avoid throwing an exception.
              res.writeHeader(500, {'Content-Type': 'text/plain'});
              res.write('An internal server error occurred: ' + err);
            } else {
              // Set the correct MIME type using the extension.
              res.writeHead(200, {'Content-Type': mime[
                // Unrecognized extension; use the default MIME type.
                path.extname(file).slice(1)] || defaultMime});
              res.write(contents, 'binary');
            }
            // Close the connection.
            res.end();
          });
        } else {
          // Serve directories.
          if (pathname.charAt(pathname.length - 1) !== '/') {
            // Automatically append a trailing slash for directories.
            pathname += '/';
          }
          fs.readdir(file, function(err, files) {
            if (err) {
              res.writeHeader(500, {'Content-Type': 'text/plain'});
              res.write('An internal server error occurred: ' + err);
            } else {
              // Create a basic directory listing.
              files = files.map(function(name) {
                // URL-encode the path to each file or directory.
                return '<a href="' + encodeURIComponent(pathname + name) +
                  '">' + name + '</a>';
              });
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write('<ul><li>' + files.join('</li><li>') + '</li></ul>');
            }
            res.end();
          });
        }
      });
    }
  });
}).listen(port);

console.log('Serving %s on port %d...', root, port);