// popup.js - Handles the popup UI logic

let currentTitle = '';

const titleDisplay = document.getElementById('titleDisplay');
const openButton = document.getElementById('openButton');
const errorDiv = document.getElementById('error');

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function hideError() {
  errorDiv.classList.remove('show');
}

async function getVideoTitle() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we're on YouTube
    if (!tab.url || !tab.url.includes('youtube.com')) {
      titleDisplay.textContent = 'Please open a YouTube video';
      titleDisplay.classList.add('empty');
      return;
    }

    // Send message to content script to get the title
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTitle' });

    if (response && response.success && response.title) {
      currentTitle = response.title;
      titleDisplay.textContent = response.title;
      titleDisplay.classList.remove('empty');
      openButton.disabled = false;
      hideError();
    } else {
      titleDisplay.textContent = 'Could not detect video title';
      titleDisplay.classList.add('empty');
      showError('Unable to extract video title from this page');
    }
  } catch (error) {
    console.error('Error getting video title:', error);
    titleDisplay.textContent = 'Error detecting title';
    titleDisplay.classList.add('empty');
    showError('Make sure you are on a YouTube video page');
  }
}

async function openInAppleMusic() {
  if (!currentTitle) {
    showError('No title available');
    return;
  }

  try {
    // Get the current YouTube tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to background script to open Apple Music
    // Background script will validate this is a YouTube tab for security
    await chrome.runtime.sendMessage({
      action: 'openAppleMusic',
      searchTerm: currentTitle,
      tabId: tab.id
    });

    // Close the popup after a short delay
    setTimeout(() => {
      window.close();
    }, 300);
  } catch (error) {
    console.error('Error opening Apple Music:', error);
    showError('Failed to open Apple Music');
  }
}

// Event listeners
openButton.addEventListener('click', openInAppleMusic);

// Initialize when popup opens
getVideoTitle();
