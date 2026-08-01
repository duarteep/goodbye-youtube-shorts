// Badge colors
const BADGE_GREEN = '#00C853';  // Enabled + on YouTube
const BADGE_YELLOW = '#FFB300'; // Not on YouTube
const BADGE_RED = '#FF1744';    // Disabled + on YouTube

// Set default state on first install only
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ enabled: true });
  }
  // Update badges on install/update
  updateAllBadges();
});

// Update badge for a specific tab
async function updateBadge(tabId, url) {
  const result = await chrome.storage.local.get('enabled');
  const enabled = result.enabled !== false;
  const isYouTube = url && url.includes('youtube.com');

  let color, text;

  if (isYouTube && enabled) {
    color = BADGE_GREEN;
    text = 'ON';
  } else if (isYouTube && !enabled) {
    color = BADGE_RED;
    text = 'OFF';
  } else {
    color = BADGE_YELLOW;
    text = '—';
  }

  try {
    await chrome.action.setBadgeBackgroundColor({ color, tabId });
    await chrome.action.setBadgeText({ text, tabId });
    await chrome.action.setBadgeTextColor({ color: '#FFFFFF', tabId });
  } catch (e) {
    // Tab may have been closed
  }
}

// Update badges on all tabs
async function updateAllBadges() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        updateBadge(tab.id, tab.url);
      }
    }
  } catch (e) {
    // ignore
  }
}

// Notify all YouTube content scripts about state change
async function notifyContentScripts(enabled) {
  try {
    const ytTabs = await chrome.tabs.query({ url: 'https://www.youtube.com/*' });
    for (const tab of ytTabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'setEnabled',
          enabled: enabled
        });
      } catch (e) {
        // Content script may not be loaded yet
      }
    }
  } catch (e) {
    // ignore
  }
}

// React to storage changes (triggered by popup or elsewhere)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enabled) {
    const newEnabled = changes.enabled.newValue;
    updateAllBadges();
    notifyContentScripts(newEnabled);
  }
});

// Update badge when tab is activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateBadge(tab.id, tab.url);
    }
  } catch (e) {
    // Tab may not exist anymore
  }
});

// Update badge when tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadge(tabId, tab.url);
  }
});

// Update all tabs on browser startup
chrome.runtime.onStartup.addListener(() => {
  updateAllBadges();
});
