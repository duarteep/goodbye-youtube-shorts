document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const toggleInput = document.getElementById('toggleInput');
  const reloadNotice = document.getElementById('reloadNotice');
  const reloadLink = document.getElementById('reloadLink');
  const versionFooter = document.getElementById('versionFooter');

  function getMsg(key) {
    return chrome.i18n.getMessage(key);
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const msg = getMsg(key);
    if (msg) {
      el.textContent = msg;
    }
  });

  // Load version dynamically from manifest
  const manifest = chrome.runtime.getManifest();
  if (manifest && manifest.version) {
    versionFooter.textContent = `v${manifest.version}`;
  }

  // Read state directly from storage (no dependency on background)
  const result = await chrome.storage.local.get('enabled');
  const enabled = result.enabled !== false; // Default true
  toggleInput.checked = enabled;

  let currentTab = null;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    const isYouTube = tab && tab.url && tab.url.includes('youtube.com');
    updateStatusUI(isYouTube, enabled);
  } catch (err) {
    statusText.textContent = getMsg('error');
  }

  // Toggle handler — write directly to storage
  toggleInput.addEventListener('change', async () => {
    const newEnabled = toggleInput.checked;

    // Save to storage — this triggers storage.onChanged in background & content
    await chrome.storage.local.set({ enabled: newEnabled });

    // Update popup UI
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab;
      const isYouTube = tab && tab.url && tab.url.includes('youtube.com');
      updateStatusUI(isYouTube, newEnabled);

      // Show reload notice if on YouTube
      if (isYouTube) {
        reloadNotice.classList.add('visible');
      }
    } catch (err) {
      // ignore
    }
  });

  // Reload link handler
  reloadLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (currentTab && currentTab.id) {
      await chrome.tabs.reload(currentTab.id);
      window.close(); // Close popup after reload
    }
  });

  function updateStatusUI(isYouTube, enabled) {
    statusBadge.classList.remove('active', 'inactive', 'away');

    if (isYouTube && enabled) {
      statusBadge.classList.add('active');
      statusText.textContent = getMsg('active');
    } else if (isYouTube && !enabled) {
      statusBadge.classList.add('inactive');
      statusText.textContent = getMsg('off');
    } else {
      statusBadge.classList.add('away');
      statusText.textContent = getMsg('notOnYouTube');
    }
  }
});

