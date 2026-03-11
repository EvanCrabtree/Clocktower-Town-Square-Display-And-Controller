const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let state = { players: [], phase: 'Night', phaseNumber: 1 };

wss.on('connection', ws => {
  // Send current state to new client
  ws.send(JSON.stringify(state));

  // Receive updates from controller
  ws.on('message', message => {
    state = JSON.parse(message);
    // Broadcast updated state to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(state));
      }
    });
  });
});

console.log('WebSocket server running on port 8080');