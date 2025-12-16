# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube-2-AppleMusic is a Chrome extension for macOS that allows users to open YouTube videos directly in Apple Music. It extracts the video title from YouTube, cleans it up, and searches for it in Apple Music using the `music://` URL scheme.

**Key Features:**
- Automatically detects YouTube video titles
- Cleans up titles (removes "- YouTube", "[Official Video]", etc.)
- Opens Apple Music search with one click
- No external backend required

## Architecture

This is a Chrome Extension using Manifest V3. The extension consists of four main components:

### 1. manifest.json
- Defines the extension configuration (Manifest V3)
- Permissions: `activeTab`, `scripting`
- Host Permissions: `*://*.youtube.com/*`
- Registers content scripts and background service worker
- Configures the popup interface

### 2. content.js
- Runs on all YouTube pages (injected via content_scripts in manifest)
- Extracts the video title from the page DOM using multiple selectors
- Cleans up the title by removing common suffixes and tags
- Listens for messages from popup.js requesting the title

Key functions:
- `getYouTubeTitle()`: Extracts title using multiple DOM selectors as fallbacks
- `cleanTitle()`: Removes "[Official Video]", "- YouTube", etc.

### 3. background.js
- Service worker that runs in the background (Manifest V3 requirement)
- Receives search requests from popup.js
- Opens Apple Music using the `music://music.apple.com/search?term=...` URL scheme
- Automatically closes the protocol handler tab after 500ms

Key function:
- `openAppleMusic(searchTerm)`: Creates and opens the Apple Music URL

### 4. popup.html + popup.js
- User interface shown when clicking the extension icon
- Requests video title from content.js via chrome.tabs.sendMessage
- Displays the cleaned title
- Sends search request to background.js via chrome.runtime.sendMessage on button click

## Communication Flow

```
User clicks extension icon
         ↓
popup.js → chrome.tabs.sendMessage → content.js: "getTitle"
         ↓
content.js extracts and cleans YouTube title → returns to popup.js
         ↓
popup.js displays title to user
         ↓
User clicks "Open in Apple Music"
         ↓
popup.js → chrome.runtime.sendMessage → background.js: "openAppleMusic"
         ↓
background.js opens music://music.apple.com/search?term=...
         ↓
macOS launches Apple Music with search results
```

## Project Structure

```
YouTube-2-AppleMusic/
├── manifest.json          # Extension configuration
├── content.js            # YouTube page script (content script)
├── background.js         # Service worker
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 toolbar icon
│   ├── icon48.png        # 48x48 management page icon
│   └── icon128.png       # 128x128 Chrome Web Store icon
├── LICENSE               # MIT License
├── CLAUDE.md            # This file
└── README.md            # User-facing documentation
```

## Technical Details

- **Chrome Extension Manifest**: V3 (uses service workers instead of background pages)
- **Platform**: macOS only (uses Apple Music URL scheme)
- **URL Scheme**: `music://music.apple.com/search?term=<encoded-search-term>`
- **Message Passing**: Uses chrome.runtime.onMessage and chrome.tabs.sendMessage
- **Content Script Injection**: Automatic on all YouTube pages via manifest.json

## Development & Debugging

### Testing
1. Load extension in Chrome: chrome://extensions/ → Enable "Developer mode" → "Load unpacked"
2. Navigate to a YouTube video
3. Click extension icon
4. Verify title detection and Apple Music opening

### Debugging
- **Popup DevTools**: Right-click extension icon → Inspect popup
- **Content Script Logs**: Open DevTools on YouTube page → Console
- **Background Script Logs**: chrome://extensions/ → Click "service worker" link

### Common Issues
- **Title not detected**: YouTube may have changed DOM structure, update selectors in content.js
- **Apple Music doesn't open**: Verify macOS can handle music:// URLs
- **Extension icon missing**: Add PNG files to icons/ directory

## Key Implementation Notes

- Content script uses multiple DOM selector fallbacks to handle YouTube's varying page structures
- Title cleaning removes common YouTube-specific patterns to improve Apple Music search results
- Background script auto-closes protocol handler tabs to avoid clutter
- Popup validates that user is on YouTube before enabling the button

## License

MIT License - See LICENSE file for details
