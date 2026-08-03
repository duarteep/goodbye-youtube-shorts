document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const toggleInput = document.getElementById('toggleInput');
  const reloadNotice = document.getElementById('reloadNotice');
  const reloadLink = document.getElementById('reloadLink');
  const versionFooter = document.getElementById('versionFooter');

  const translations = {
    'en': {
      statusLabel: 'Status',
      loading: 'Loading...',
      removeShorts: 'Remove Shorts',
      reloadNotice: 'Reload the page to apply.',
      reloadButton: 'Reload',
      error: 'Error',
      active: 'Active',
      off: 'Off',
      notOnYouTube: 'Not on YouTube'
    },
    'pt': {
      statusLabel: 'Status',
      loading: 'Carregando...',
      removeShorts: 'Remover Shorts',
      reloadNotice: 'Recarregue a página para aplicar.',
      reloadButton: 'Recarregar',
      error: 'Erro',
      active: 'Ativo',
      off: 'Desligado',
      notOnYouTube: 'Fora do YouTube'
    },
    'ru': {
      statusLabel: 'Статус',
      loading: 'Загрузка...',
      removeShorts: 'Удалить Shorts',
      reloadNotice: 'Перезагрузите страницу, чтобы применить.',
      reloadButton: 'Перезагрузить',
      error: 'Ошибка',
      active: 'Включено',
      off: 'Выключено',
      notOnYouTube: 'Не на YouTube'
    },
    'zh': {
      statusLabel: '状态',
      loading: '加载中...',
      removeShorts: '移除 Shorts',
      reloadNotice: '重新加载页面以应用更改。',
      reloadButton: '重新加载',
      error: '错误',
      active: '已开启',
      off: '已关闭',
      notOnYouTube: '不在 YouTube 上'
    },
    'es': {
      statusLabel: 'Estado',
      loading: 'Cargando...',
      removeShorts: 'Eliminar Shorts',
      reloadNotice: 'Vuelve a cargar la página para aplicar.',
      reloadButton: 'Recargar',
      error: 'Error',
      active: 'Activo',
      off: 'Desactivado',
      notOnYouTube: 'Fuera de YouTube'
    }
  };

  function getLang() {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('ru')) return 'ru';
    if (lang.startsWith('zh')) return 'zh';
    if (lang.startsWith('es')) return 'es';
    return 'en';
  }

  const t = translations[getLang()];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
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
    statusText.textContent = t.error;
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
      statusText.textContent = t.active;
    } else if (isYouTube && !enabled) {
      statusBadge.classList.add('inactive');
      statusText.textContent = t.off;
    } else {
      statusBadge.classList.add('away');
      statusText.textContent = t.notOnYouTube;
    }
  }
});

