let isEnabled = true;
let observer = null;

// Contagem de Shorts removidos (acumulada em memória e gravada com debounce)
const FLUSH_DELAY_MS = 1000;
let pendingCount = 0;
let flushTimer = null;

function flushCount() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (pendingCount === 0) return;
  const delta = pendingCount;
  pendingCount = 0;
  try {
    chrome.storage.local.get(['totalBlocked', 'tripBlocked'], (result) => {
      if (chrome.runtime.lastError) return;
      chrome.storage.local.set({
        totalBlocked: (result.totalBlocked || 0) + delta,
        tripBlocked: (result.tripBlocked || 0) + delta
      });
    });
  } catch (e) {
    // Contexto da extensão invalidado (ex.: extensão atualizada); ignora
  }
}

function addToCount(n) {
  if (n <= 0) return;
  pendingCount += n;
  if (!flushTimer) {
    flushTimer = setTimeout(flushCount, FLUSH_DELAY_MS);
  }
}

// Quantos Shorts um elemento removido representa
function countShortsIn(item) {
  const tag = item.tagName.toLowerCase();
  if (tag === 'ytd-reel-item-renderer' || tag === 'yt-shorts-lockup-view-model' || tag === 'ytm-shorts-lockup-view-model') {
    return 1;
  }

  // Coleta IDs únicos de links /shorts/<id> dentro do container
  const uniqueShorts = new Set();
  item.querySelectorAll('a[href*="/shorts/"]').forEach(a => {
    const match = a.href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (match) uniqueShorts.add(match[1]);
  });

  const nested = item.querySelectorAll('ytd-reel-item-renderer, yt-shorts-lockup-view-model, ytm-shorts-lockup-view-model').length;
  const detectedCount = Math.max(uniqueShorts.size, nested);

  if (tag === 'ytd-reel-shelf-renderer') {
    return Math.max(1, detectedCount);
  }

  // Para seções na tela inicial (ytd-rich-section-renderer)
  if (detectedCount > 0) {
    return detectedCount;
  }

  // Verifica se o container é uma estante de Shorts pelo título ou atributo
  const isShortsShelf = item.querySelector('ytd-rich-shelf-renderer[is-shorts]') ||
    Array.from(item.querySelectorAll('#title, #title-text, yt-formatted-string.title, yt-formatted-string#title'))
      .some(el => el.textContent && el.textContent.trim().toLowerCase() === 'shorts');

  if (isShortsShelf) {
    return 1;
  }

  return 0;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushCount();
});

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
  const items = document.querySelectorAll(
    'ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-reel-item-renderer, yt-shorts-lockup-view-model'
  );
  items.forEach(item => {
    // Já removido junto com um contêiner pai (evita contar duas vezes)
    if (!item.isConnected) return;
    const count = countShortsIn(item);
    item.remove();
    addToCount(count);
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
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
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
