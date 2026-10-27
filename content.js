(function() {
  function isContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  if (isContextValid()) {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('inject.js');
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      console.warn('[Support Counter] Не удалось внедрить inject.js', e);
    }
  }

  function showPlusOneAnimation() {
    if (window.top !== window) return;

    const el = document.createElement('div');
    el.textContent = '+1';
    
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      fontSize: '24px',
      fontWeight: '800',
      color: '#a78bfa',
      textShadow: '0 0 10px rgba(167, 139, 250, 0.8), 0 0 20px rgba(167, 139, 250, 0.4)',
      pointerEvents: 'none',
      zIndex: '999999',
      opacity: '0',
      transform: 'translateY(0) scale(1)',
      transition: 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(-100px) scale(1.5)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-150px) scale(1.2)';
    }, 800);

    setTimeout(() => {
      el.remove();
    }, 2000);
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'SUPPORT_COUNTER_MSG_SENT') {
      if (!isContextValid()) {
        console.warn('[Support Counter] Контекст расширения невалиден. Обновите страницу (F5).');
        return;
      }

      showPlusOneAnimation();

      try {
        chrome.storage.local.get(['supportCount'], (res) => {
          if (chrome.runtime.lastError) return; // подавляем ошибку, если контекст умер
          const newCount = (res.supportCount || 0) + 1;
          chrome.storage.local.set({ supportCount: newCount });
        });
      } catch (e) {
        console.warn('[Support Counter] Ошибка сохранения:', e);
      }
    }
  });
})();