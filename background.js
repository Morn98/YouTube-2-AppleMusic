// background.js - Service worker to handle opening Apple Music

function openAppleMusic(searchTerm) {
  if (!searchTerm) {
    console.error('No search term provided');
    return;
  }

  // Encode the search term for URL
  const encodedTerm = encodeURIComponent(searchTerm);

  // Create the Apple Music URL scheme
  const appleMusicUrl = `music://music.apple.com/search?term=${encodedTerm}`;

  // Open the URL in a new tab
  // Chrome will handle the custom protocol and launch Apple Music on macOS
  chrome.tabs.create({ url: appleMusicUrl }, (tab) => {
    // The tab will immediately close as the OS handles the custom protocol
    // We can close it after a short delay to clean up
    if (tab && tab.id) {
      setTimeout(() => {
        chrome.tabs.remove(tab.id).catch(() => {
          // Ignore errors if tab is already closed
        });
      }, 5000);
    }
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openAppleMusic') {
    openAppleMusic(request.searchTerm);
    sendResponse({ success: true });
  }
  return true;
});

// Optional: Log when service worker starts
console.log('YouTube-2-AppleMusic background service worker started');
