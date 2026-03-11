# Blood on the Clocktower - Digital Storyteller System

A complete digital town-square solution for running Blood on the Clocktower games with multiple connected devices.

## Device Setup & Architecture

### Recommended Setup
- **1 Laptop (Server)**: Runs the Node.js server and hosts the game
- **1 Phone (Controller)**: Controls the game state via web interface  
- **1 TV (Display)**: Shows the game state to all players

### Network Requirements
- All devices must be on the same WiFi network
- Server laptop should have good WiFi connectivity
- Phone and TV need web browser capabilities

## Installation & Setup

### 1. Server Setup (Laptop)
```bash
# Clone or download the project
cd clocktower

# Run the setup script
./setup.sh
```

The setup script will:
- Install required Node.js dependencies
- Auto-detect your local IP address
- Start WebSocket server (port 8080)
- Start HTTP server (port 8000)
- Display connection URLs for other devices

### 2. Display Setup (TV)
1. **Note the TV Display URL** from server output
2. **Open web browser** on the TV
3. **Navigate to**: `http://[YOUR_IP]:8000/display.html`
4. **Bookmark** for quick access in future games

### 3. Controller Setup (Phone)
1. **Note the Controller URL** from server output  
2. **Open web browser** on your phone
3. **Navigate to**: `http://[YOUR_IP]:8000/controller.html`
4. **Bookmark** for easy access during games

## Usage Guide

### Starting a Game
1. **Launch Server**: Run `./setup.sh` on your laptop
2. **Connect Display**: Open the display URL on the TV
3. **Connect Controller**: Open the controller URL on your phone
4. **Verify Connection**: Check that both show "Connected" status

### Game Controls

#### Player Management
- **Bulk Import**: Paste multiple player names (newline or comma separated)
- **Single Add**: Add players one at a time
- **Reorder**: Use ↑↓ buttons to adjust player seating order
- **Status Toggle**: Kill/Revive players as needed
- **Traveler Mark**: Mark players as travelers if applicable
- **Ghost Vote**: Enable/disable ghost voting for dead players
- **Delete**: Remove players from the game

#### Phase Control
- **Time Selection**: Switch between Night/Day phases
- **Phase Number**: Increment day counter automatically
- **Next Phase**: Advance to next time period
- **Manual Control**: Full control over game flow

#### Visual Features
- **Dynamic Layout**: Oval player arrangement that scales with player count
- **Responsive Design**: Adapts to different screen sizes
- **Day/Night Themes**: Visual atmosphere changes with phase
- **Player Status**: Clear alive/dead indicators with colored borders
- **Statistics Display**: Real-time player count updates

## Technical Details

### Server Information
- **WebSocket Port**: 8080 (real-time communication)
- **HTTP Port**: 8000 (serves web interfaces)
- **Auto IP Detection**: Finds local network IP automatically
- **Graceful Shutdown**: Ctrl+C stops all servers cleanly

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: Responsive design works on phones
- **Large Screens**: Scales properly for TV displays
- **Real-time Updates**: WebSocket ensures instant synchronization

## Troubleshooting

### Connection Issues
- **Check WiFi**: Ensure all devices on same network
- **Firewall**: May need to allow ports 8000/8080
- **IP Address**: Verify correct IP in URLs
- **Browser Cache**: Refresh if updates not appearing

### Performance Tips
- **Close Other Tabs**: Reduce browser load on controller device
- **Strong WiFi**: Ensure stable connection for real-time updates
- **Device Memory**: Restart browser if performance degrades

## Features

### Visual Design
- **Glassmorphism**: Modern translucent design elements
- **Smooth Animations**: Phase transitions and status changes
- **Color Coding**: Intuitive visual feedback (green=alive, red=dead)
- **Responsive Typography**: Scales properly across all device sizes

### Game Management
- **No Installation Required**: Phone/TV just need web browser
- **Real-time Sync**: All devices update instantly
- **Persistent State**: Game state maintained during session
- **Flexible Setup**: Works with various screen configurations

---

**Perfect for storytellers who want a modern, digital solution for running Blood on the Clocktower games with multiple connected devices!** 
