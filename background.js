// background.js - Service worker to handle opening Apple Music

function openAppleMusic(searchTerm, tabId) {
  if (!searchTerm) {
    console.error('No search term provided');
    return;
  }

  // Encode the search term for URL
  const encodedTerm = encodeURIComponent(searchTerm);

  // Create the Apple Music URL scheme
  const appleMusicUrl = `music://music.apple.com/search?term=${encodedTerm}`;

  // Navigate the current tab to the Apple Music URL
  // This will trigger macOS to open Apple Music
  // The browser will stay on the YouTube page as the OS handles the protocol
  chrome.tabs.update(tabId, { url: appleMusicUrl });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openAppleMusic') {
    const { searchTerm, originalTabId } = request;

    if (searchTerm && originalTabId) {
      openAppleMusic(searchTerm, originalTabId);
      sendResponse({ success: true });
    } else {
      console.error('Missing searchTerm or originalTabId');
      sendResponse({ success: false, error: 'Missing required parameters' });
    }

    return true; // Keep message channel open for async response
  }
});

// Optional: Log when service worker starts
console.log('YouTube-2-AppleMusic background service worker started');
