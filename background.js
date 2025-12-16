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
  // Security: Validate sender is from our extension
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.error('Rejected message from unauthorized sender');
    sendResponse({ success: false, error: 'Unauthorized' });
    return false;
  }

  if (request.action === 'openAppleMusic') {
    const { searchTerm, tabId } = request;

    if (!searchTerm || !tabId) {
      console.error('Missing searchTerm or tabId');
      sendResponse({ success: false, error: 'Missing required parameters' });
      return true;
    }

    // Security: Validate the tabId corresponds to a YouTube URL before using it
    // This prevents tab ID injection attacks
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Invalid tab ID:', chrome.runtime.lastError);
        sendResponse({ success: false, error: 'Invalid tab' });
        return;
      }

      // Verify it's a YouTube URL
      if (!tab.url || !tab.url.includes('youtube.com')) {
        console.error('Tab is not a YouTube page');
        sendResponse({ success: false, error: 'Not a YouTube tab' });
        return;
      }

      // All security checks passed, open Apple Music
      openAppleMusic(searchTerm, tabId);
      sendResponse({ success: true });
    });

    return true; // Keep message channel open for async response
  }
});
