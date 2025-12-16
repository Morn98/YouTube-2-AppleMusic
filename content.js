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

/**
 * Cleans a YouTube video title for Apple Music search
 * Removes brackets, YouTube-specific terms, special characters, and emojis
 * Returns a normalized, search-friendly string
 *
 * @param {string} title - The raw YouTube video title
 * @returns {string} - Cleaned and normalized title (lowercase, trimmed)
 */
function cleanTitle(title) {
  if (!title) return '';

  // Step 1: Remove all content within brackets (round, square, curly)
  // This removes [Official Video], (Audio), {whatever}, etc.
  title = title.replace(/\([^)]*\)/g, '');  // Remove (...)
  title = title.replace(/\[[^\]]*\]/g, '');  // Remove [...]
  title = title.replace(/\{[^}]*\}/g, '');   // Remove {...}

  // Step 2: Remove common YouTube metadata terms
  // Case-insensitive, word boundary aware to avoid removing parts of song titles
  const youtubeTerms = [
    'official music video',
    'official video',
    'music video',
    'lyric video',
    'official audio',
    'official',
    'visualizer',
    'lyrics',
    'audio',
    'video',
    'remastered',
    'acoustic',
    'live',
    'cover',
    'karaoke',
    'reaction',
    'premiere',
    'shorts',
    'hd',
    '4k',
    '8k',
    'mv'
  ];

  // Create regex pattern with word boundaries
  const termsPattern = youtubeTerms
    .sort((a, b) => b.length - a.length) // Sort by length (longest first) to match "official music video" before "official"
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
    .join('|');

  const termsRegex = new RegExp(`\\b(${termsPattern})\\b`, 'gi');
  title = title.replace(termsRegex, '');

  // Step 3: Remove "- YouTube" suffix (common in document.title fallback)
  title = title.replace(/\s*-\s*YouTube\s*$/i, '');

  // Step 4: Remove decorative separators and special characters
  // Common separators: | • — – -
  title = title.replace(/[|•—–]/g, ' ');

  // Step 5: Remove emojis and other Unicode symbols
  // This regex matches most emoji ranges
  title = title.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
  title = title.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
  title = title.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
  title = title.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
  title = title.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Misc symbols
  title = title.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats
  title = title.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols and Pictographs
  title = title.replace(/[\u{1FA00}-\u{1FA6F}]/gu, ''); // Chess Symbols
  title = title.replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A

  // Step 6: Remove excessive punctuation (multiple dots, exclamation marks, etc.)
  title = title.replace(/[.!?]{2,}/g, '');

  // Step 7: Normalize whitespace (remove multiple spaces, tabs, newlines)
  title = title.replace(/\s+/g, ' ').trim();

  // Step 8: Remove leading/trailing hyphens and dashes
  title = title.replace(/^[-–—\s]+|[-–—\s]+$/g, '');

  // Step 9: Convert to lowercase for search-friendly format
  title = title.toLowerCase();

  // Final trim
  return title.trim();
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
