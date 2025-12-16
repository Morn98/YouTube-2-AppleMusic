// content.js - Runs on YouTube pages to extract video titles

function getYouTubeTitle() {
  // Try to get the video title from the page
  // YouTube uses different selectors, so we try multiple approaches
  let title = '';

  // Method 1: Try the primary video title element
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string') ||
                       document.querySelector('h1.title yt-formatted-string') ||
                       document.querySelector('h1 yt-formatted-string.ytd-watch-metadata') ||
                       document.querySelector('ytd-watch-metadata h1 yt-formatted-string');

  if (titleElement) {
    title = titleElement.textContent.trim();
  }

  // Method 2: Fallback to document title
  if (!title) {
    title = document.title.replace(' - YouTube', '').trim();
  }

  return title;
}

function cleanTitle(title) {
  if (!title) return '';

  // Remove common YouTube suffixes
  title = title.replace(/\s*-\s*YouTube\s*$/i, '');

  // Remove (Official Video), [Official Audio], etc.
  title = title.replace(/[\[\(](Official|Audio|Video|Music Video|Lyric Video|HD|4K|Official Music Video|Official Audio|Official Lyric Video)[\]\)]/gi, '');

  // Remove extra whitespace
  title = title.replace(/\s+/g, ' ').trim();

  return title;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTitle') {
    const rawTitle = getYouTubeTitle();
    const cleanedTitle = cleanTitle(rawTitle);

    sendResponse({
      success: true,
      title: cleanedTitle,
      rawTitle: rawTitle
    });
  }
  return true; // Keep the message channel open for async response
});

// Optional: Log when content script loads (for debugging)
console.log('YouTube-2-AppleMusic content script loaded');
