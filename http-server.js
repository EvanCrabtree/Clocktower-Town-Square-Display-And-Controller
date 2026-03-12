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
  
  console.log(`Request received: ${req.method} ${pathname}`);
  
  // Default to show both links if root is requested
  if (pathname === '/') {
    const displayFile = `display_${IP.replace(/\./g, '_')}.html`;
    const controllerFile = `controller_${IP.replace(/\./g, '_')}.html`;
    
    const html = `<!DOCTYPE html>
    <html>
    <head>
        <title>Clocktower Storyteller</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                text-align: center; 
                background: #1a1a1a;
                color: white;
            }
            .links { 
                display: flex; 
                justify-content: center; 
                gap: 20px; 
                margin-top: 30px;
            }
            a { 
                display: block; 
                padding: 20px 40px; 
                background: #2563eb; 
                color: white; 
                text-decoration: none; 
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
                transition: background 0.3s;
            }
            a:hover { 
                background: #1d4ed8; 
            }
            .display { background: #dc2626; }
            .display:hover { background: #b91c1c; }
            h1 { color: #fbbf24; }
        </style>
    </head>
    <body>
        <h1>Blood on the Clocktower Storyteller</h1>
        <p>Select which interface you want to open:</p>
        <div class="links">
            <a href="/${displayFile}" class="display">TV Display</a>
            <a href="/${controllerFile}">Controller</a>
        </div>
    </body>
    </html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }
  
  // Construct full file path
  const filePath = path.join(__dirname, pathname);
  console.log(`Looking for file: ${filePath}`);
  
  // Check if file exists and is one of our IP-specific files
  const displayFile = `display_${IP.replace(/\./g, '_')}.html`;
  const controllerFile = `controller_${IP.replace(/\./g, '_')}.html`;
  
  if (fs.existsSync(filePath) && (pathname.includes(displayFile) || pathname.includes(controllerFile))) {
    console.log(`Serving file: ${pathname}`);
    // Get file extension
    const ext = path.parse(filePath).ext;
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
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
    console.log(`File not found or not allowed: ${pathname}`);
    console.log(`Allowed files: ${displayFile}, ${controllerFile}`);
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
