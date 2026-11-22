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
    Array.from(item.querySelectorAll('#title, #title-text, yt-formatted-string.title, yt-formatted-string#title, h2, [role="heading"]'))
      .some(el => el.textContent && el.textContent.trim().toLowerCase() === 'shorts');

  if (isShortsShelf) {
    return 1;
  }

  return 0;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushCount();
});

// Remove Shorts link from sidebar, channel tabs, and filter chips
function removeShortsSidebar() {
  // Remove itens do menu lateral (guide e mini-guide) que apontam para Shorts
  const sidebarItems = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
  sidebarItems.forEach(item => {
    const hasShortsLink = Array.from(item.querySelectorAll('a')).some(
      link => link.href && link.href.includes('/shorts')
    );
    const title = item.querySelector('yt-formatted-string.title, .title');
    const hasShortsTitle = title && title.textContent.trim().toLowerCase() === 'shorts';

    if (hasShortsLink || hasShortsTitle) {
      item.remove();
    }
  });

  // Remove aba "Shorts" em páginas de canal e chip de filtro "Shorts" na busca/home
  const tabsAndChips = document.querySelectorAll(
    'yt-tab-shape, tp-yt-paper-tab, yt-chip-cloud-chip-renderer, chip-view-model, [role="tab"]'
  );
  tabsAndChips.forEach(tab => {
    if (!tab.isConnected) return;
    const text = tab.textContent ? tab.textContent.trim().toLowerCase() : '';
    if (text === 'shorts') {
      const container = tab.closest('yt-tab-shape, tp-yt-paper-tab, yt-chip-cloud-chip-renderer, chip-view-model') || tab;
      container.remove();
    }
  });
}

// Remove Shorts suggestions from homepage, search results, and feeds
function removeShortsSuggestions() {
  const items = document.querySelectorAll(
    'ytd-rich-section-renderer, ytd-reel-shelf-renderer, grid-shelf-view-model, ytd-reel-item-renderer, yt-shorts-lockup-view-model, ytm-shorts-lockup-view-model'
  );
  items.forEach(item => {
    // Já removido junto com um contêiner pai (evita contar duas vezes)
    if (!item.isConnected) return;

    // Se for um item filho dentro de uma estante, prioriza avaliar/remover a estante inteira
    const shelf = item.closest('grid-shelf-view-model, ytd-reel-shelf-renderer, ytd-rich-section-renderer');
    const target = shelf || item;

    const count = countShortsIn(target);
    const tag = target.tagName.toLowerCase();
    const isGenericContainer = tag === 'ytd-rich-section-renderer' || tag === 'grid-shelf-view-model';

    // Containers genéricos só devem ser removidos quando realmente contêm Shorts
    if (isGenericContainer && count === 0) return;

    target.remove();
    addToCount(count);
  });

  // Remove resultados ou cards individuais que apontem diretamente para /shorts/
  const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
  shortsLinks.forEach(link => {
    if (!link.isConnected) return;
    const card = link.closest(
      'grid-shelf-view-model, ytd-reel-shelf-renderer, ytd-rich-section-renderer, ytd-reel-item-renderer, yt-shorts-lockup-view-model, ytm-shorts-lockup-view-model, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model'
    );
    if (card) {
      const count = Math.max(1, countShortsIn(card));
      card.remove();
      addToCount(count);
    }
  });
}

function removeShorts() {
  if (!isEnabled) return;
  removeShortsSuggestions();
  removeShortsSidebar();
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
