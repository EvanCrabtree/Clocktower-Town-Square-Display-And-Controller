const http = require('http');
const fs = require('fs');
const path = require('path');

const IP = process.argv[2] || 'localhost';
const PORT = 8000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = new URL(req.url, `http://${IP}:${PORT}`);
  let pathname = parsedUrl.pathname;
  
  // Default to display file if root is requested
  if (pathname === '/') {
    pathname = `/display_${IP.replace(/\./g, '_')}.html`;
  }
  
  // Construct full file path
  const filePath = path.join(__dirname, pathname);
  
  // Check if file exists and is one of our IP-specific files
  if (fs.existsSync(filePath) && (pathname.includes(`display_${IP.replace(/\./g, '_')}.html`) || pathname.includes(`controller_${IP.replace(/\./g, '_')}.html`))) {
    // Get file extension
    const ext = path.parse(filePath).ext;
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  } else {
    // File not found or not allowed
    res.writeHead(404);
    res.end('File not found or access denied');
  }
});

server.listen(PORT, IP, () => {
  console.log(`HTTP server running at http://${IP}:${PORT}`);
  console.log(`Serving only IP-specific files for ${IP}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('HTTP server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('HTTP server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
