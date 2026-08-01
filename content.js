let isEnabled = true;
let observer = null;

// Remove Shorts link from sidebar
function removeShortsSidebar() {
  // Remove links para Shorts
  const sidebarLinks = document.querySelectorAll('a');
  sidebarLinks.forEach(link => {
    if (link.href && link.href.includes('/shorts')) {
      const parent = link.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, li, div');
      if (parent) {
        parent.remove();
      } else {
        link.remove();
      }
    }
  });

  // Remove itens do menu lateral com texto "Shorts"
  const sidebarItems = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, li, div');
  sidebarItems.forEach(item => {
    const title = item.querySelector('yt-formatted-string.title');
    if (title && title.textContent.trim().toLowerCase() === 'shorts') {
      item.remove();
    }
  });
}

// Remove Shorts suggestions from homepage
function removeShortsSuggestions() {
  const items = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-reel-item-renderer');
  items.forEach(item => {
    item.remove();
  });
}

function removeShorts() {
  if (!isEnabled) return;
  removeShortsSidebar();
  removeShortsSuggestions();
}

function startObserver() {
  if (observer) return;
  removeShorts();
  observer = new MutationObserver(removeShorts);
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function setEnabled(enabled) {
  isEnabled = enabled;
  if (isEnabled) {
    startObserver();
  } else {
    stopObserver();
  }
}

// Listen for messages from background (when background sends via tabs.sendMessage)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setEnabled') {
    setEnabled(message.enabled);
  }
});

// Also listen to storage changes directly (fallback if message doesn't arrive)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enabled) {
    setEnabled(changes.enabled.newValue);
  }
});

// Get initial state and start
chrome.storage.local.get('enabled', (result) => {
  isEnabled = result.enabled !== false; // Default to true
  if (isEnabled) {
    startObserver();
  }
});
