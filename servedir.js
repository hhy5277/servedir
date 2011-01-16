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
  '.aif': 'audio/x-aiff',
  '.aiff': 'audio/x-aiff',
  '.atom': 'application/atom+xml',
  '.bmp': 'image/bmp',
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.ics': 'text/calendar',
  ',jpe': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jsonp': 'text/javascript',
  '.mathml': 'application/mathml+xml',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  '.ogg': 'application/ogg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.rb': 'text/plain',
  '.rtf': 'application/rtf',
  '.sh': 'application/x-sh',
  '.svg': 'image/svg+xml',
  '.swf': 'application/x-shockwave-flash',
  '.tar': 'application/x-tar',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.txt': 'text/plain',
  '.wav': 'audio/x-wav',
  '.xht': 'application/xhtml+xml',
  '.xhtml': 'application/xhtml+xml',
  '.xml': 'text/xml',
  '.xsl': 'application/xml',
  '.xslt': 'application/xslt+xml',
  '.zip': 'application/zip'
},

// Configure the root directory, port, and default MIME type.
root = process.argv[2], port = process.argv[3],
defaultMime = 'application/octet-stream';

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
        var length;
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
              res.writeHead(200, {'Content-Type': mime[path.extname(file)] ||
                // Unrecognized extension; use the default MIME type.
                defaultMime});
              res.write(contents, 'binary');
            }
            // Close the connection.
            res.end();
          });
        } else {
          // Serve directories.
          length = pathname.length - 1;
          if (pathname.indexOf('/', length) !== length) {
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