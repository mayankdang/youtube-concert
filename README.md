# 🎵 Concert - Party with a Hashtag!

**Synchronize YouTube videos across multiple devices in real-time!**

Concert is a browser extension that allows you to create synchronized YouTube video experiences across multiple devices. Perfect for house parties, watch parties, or any scenario where you want everyone to watch the same video at the same time.

## ✨ Features

- **🎯 Real-time Synchronization**: All participants watch videos in perfect sync
- **🎮 Centralized Control**: One person controls playback for everyone
- **📱 Cross-Device Support**: Works on any device with a browser
- **🏷️ Hashtag-Based**: Simple hashtag system for joining concerts
- **⚡ Low Latency**: Optimized for minimal delay between devices
- **🔄 Auto-Sync**: Automatic synchronization when participants join

## 🚀 How It Works

### Creating a Concert
1. Install the Concert extension in your browser
2. Go to any YouTube video
3. Add your concert name as a hashtag at the end of the URL
4. Add another `#` at the very end and press Enter
5. Share the hashtag with your friends!

**Example**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ#MyParty#`

### Joining a Concert
1. Install the Concert extension
2. Go to any YouTube video
3. Add your friend's concert hashtag at the end of the URL
4. Press Enter and enjoy synchronized viewing!

**Example**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ#MyParty`

## 🏗️ Architecture

This project consists of several components:

### Browser Extension
- **Client Extension** (`/client/`): Chrome extension with manifest v2
- **Kango Framework Extension** (`/extension/`): Cross-browser extension using Kango framework
- **Content Scripts**: Inject into YouTube pages for video control
- **Background Scripts**: Handle WebSocket connections and message routing

### Backend Services
- **WebSocket Server** (`/simpleWebSocketServer/`): Real-time communication hub
- **Java Spring Server** (`/pluginServer/`): REST API and extension updates
- **Python WebSocket Server**: Handles real-time video synchronization

### Key Technologies
- **WebSockets**: Real-time bidirectional communication
- **YouTube API**: Video control and state management
- **Cross-browser Support**: Chrome, Firefox, Safari via Kango framework
- **Java Spring**: Backend API services
- **Python**: WebSocket server implementation

## 📁 Project Structure

```
youtube-concert/
├── client/                    # Chrome extension (Manifest v2)
│   ├── manifest.json         # Extension configuration
│   ├── background.js         # Background script
│   ├── content.js           # Content script for YouTube
│   └── images/              # Extension icons
├── extension/               # Kango framework extension
│   └── src/common/         # Cross-browser extension code
├── pluginServer/           # Java Spring backend
│   ├── pom.xml            # Maven configuration
│   └── src/main/java/     # Java source code
├── simpleWebSocketServer/ # Python WebSocket server
│   ├── SimpleWebSocketServer.py
│   └── SimpleExampleServer.py
├── kango-framework-latest/ # Kango framework for cross-browser support
└── restartClient.sh        # Deployment scripts
```

## 🛠️ Development Setup

### Prerequisites
- Java 6+ (for Spring backend)
- Python 2.7+ (for WebSocket server)
- Maven (for Java dependencies)
- Chrome browser (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-concert
   ```

2. **Set up the Java backend**
   ```bash
   cd pluginServer
   mvn clean install
   mvn jetty:run
   ```

3. **Start the WebSocket server**
   ```bash
   cd simpleWebSocketServer
   python SimpleExampleServer.py --example chat
   ```

4. **Build the extension**
   ```bash
   # For Chrome extension
   # Load the /client directory as an unpacked extension in Chrome
   
   # For cross-browser extension
   cd kango-framework-latest
   python kango.py build extension
   ```

### Configuration

Update server endpoints in the extension files:
- `extension/src/common/main.js`: Update `SERVER_HOST_DOMAIN`
- `extension/src/common/background.js`: Update `SERVER_IP`

## 🔧 Technical Details

### Synchronization Algorithm
- **Clock Synchronization**: Handshaking protocol to sync client-server clocks
- **Network Delay Compensation**: Measures and compensates for network latency
- **Video State Tracking**: Tracks play/pause/seek events across all clients
- **Buffer Management**: Intelligent buffering to maintain sync

### Message Types
- `R_CREATE_USER`: User registration
- `R_HANDSHAKING`: Clock synchronization
- `R_VIDEO_UPDATE`: Video state changes
- `R_PAGE_LOADED`: Page load events
- `R_USER_ONLINE`: User presence

### Security Features
- WebSocket connection validation
- Content Security Policy (CSP) implementation
- Secure message passing between extension components

## 🚀 Deployment

### Production Deployment
```bash
# Update server configuration
./restartServer.sh /path/to/project
./restartClient.sh /path/to/project
```

### Extension Distribution
- **Chrome Web Store**: Package the `/client` directory
- **Firefox Add-ons**: Use Kango framework output
- **Safari**: Convert using Kango framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🐛 Troubleshooting

### Common Issues
- **Sync Issues**: Check network connection and server status
- **Extension Not Loading**: Verify manifest.json configuration
- **WebSocket Connection Failed**: Check server IP configuration

### Debug Mode
Enable console logging by setting debug flags in the extension scripts.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code documentation

---

**Made with ❤️ for synchronized video experiences**