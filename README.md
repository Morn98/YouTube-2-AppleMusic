# YouTube-2-AppleMusic

A Chrome extension for macOS that allows you to open YouTube videos directly in Apple Music with one click.

## Features

- Automatically detects YouTube video titles
- Cleans up titles (removes "- YouTube", "[Official Video]", etc.)
- Opens Apple Music search with one click
- Simple, clean interface
- No external backend required

## Requirements

- macOS (uses Apple Music URL scheme)
- Google Chrome or Chromium-based browser
- Apple Music app installed

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `YouTube-2-AppleMusic` directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your Chrome toolbar
3. The extension will display the detected video title
4. Click "Open in Apple Music"
5. Apple Music will open with search results for the video

## How It Works

### Architecture

The extension consists of four main components:

#### 1. **manifest.json**
- Defines the extension configuration (Manifest V3)
- Sets permissions for YouTube access
- Registers content scripts and background service worker
- Configures the popup interface

#### 2. **content.js**
- Runs on all YouTube pages
- Extracts the video title from the page DOM
- Cleans up the title by removing common suffixes and tags
- Responds to messages from the popup requesting the title

Key functions:
- `getYouTubeTitle()`: Extracts title using multiple DOM selectors
- `cleanTitle()`: Removes "[Official Video]", "- YouTube", etc.

#### 3. **background.js**
- Service worker that runs in the background
- Receives search requests from the popup
- Opens Apple Music using the `music://` URL scheme
- Automatically closes the protocol handler tab

Key function:
- `openAppleMusic(searchTerm)`: Creates and opens the Apple Music URL

#### 4. **popup.html + popup.js**
- User interface shown when clicking the extension icon
- Requests video title from content script
- Displays the cleaned title
- Sends search request to background script on button click

### Communication Flow

```
User clicks extension icon
         ↓
popup.js requests title from content.js
         ↓
content.js extracts and cleans YouTube title
         ↓
popup.js displays title to user
         ↓
User clicks "Open in Apple Music"
         ↓
popup.js sends search request to background.js
         ↓
background.js opens music://music.apple.com/search?term=...
         ↓
macOS launches Apple Music with search results
```

### URL Scheme

The extension uses macOS's custom URL scheme handler:
```
music://music.apple.com/search?term=<encoded-search-term>
```

This tells macOS to open the Apple Music app and perform a search.

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `activeTab`, `scripting`
- **Host Permissions**: `*://*.youtube.com/*`
- **Content Script Injection**: Automatic on YouTube pages
- **Background Script**: Service worker (Manifest V3 requirement)

## Development

### Project Structure

```
YouTube-2-AppleMusic/
├── manifest.json          # Extension configuration
├── content.js            # YouTube page script
├── background.js         # Service worker
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── LICENSE               # MIT License
└── README.md            # This file
```

### Testing

1. Load the extension in Chrome
2. Navigate to a YouTube video (e.g., a music video)
3. Click the extension icon
4. Verify the title is detected correctly
5. Click "Open in Apple Music"
6. Verify Apple Music opens with the search

### Debugging

- Open Chrome DevTools for popup: Right-click extension icon → Inspect popup
- View content script logs: Open DevTools on YouTube page → Console
- View background script logs: chrome://extensions/ → Click "service worker"

## Troubleshooting

**Extension icon doesn't appear**
- Make sure the extension is enabled in chrome://extensions/
- Add icon files to the icons/ directory

**"Could not detect video title"**
- Refresh the YouTube page
- Make sure you're on a video page (not homepage or search)
- YouTube may have changed their DOM structure (check console logs)

**Apple Music doesn't open**
- Make sure Apple Music is installed on your Mac
- Check that macOS can handle music:// URLs
- Try opening `music://music.apple.com/` directly in Chrome's address bar

**Extension button is disabled**
- Make sure you're on a YouTube page
- Check that the page has finished loading
- Look for errors in the popup DevTools console

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
