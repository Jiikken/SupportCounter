(function() {
  function isTargetUrl(url) {
    return typeof url === 'string' && url.includes('messages.send');
  }

  function hasGroupId(body) {
    if (!body) return false;
    try {
      const text = typeof body === 'string' ? body : '';
      if (text.includes('group_id=')) {
        // Можно дополнительно проверить, что значение не пустое
        const match = text.match(/group_id=(\d+)/);
        return match && match[1] !== '0';
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function notify() {
    window.postMessage({ type: 'SUPPORT_COUNTER_MSG_SENT' }, '*');
  }

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string'
      ? args[0]
      : (args[0] && args[0].url) || '';

    if (isTargetUrl(url)) {
      const req = args[0];
      let bodyText = '';

      if (args[1] && args[1].body) {
        bodyText = args[1].body;
      } else if (req instanceof Request) {
        // Если передали Request-объект, клонируем и читаем
        try {
          const cloned = req.clone();
          cloned.text().then(text => {
            if (hasGroupId(text)) notify();
          }).catch(() => {});
        } catch (e) {}
      }

      if (bodyText && hasGroupId(bodyText)) {
        notify();
      }
    }

    return originalFetch.apply(this, args);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._isTarget = isTargetUrl(url);
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (this._isTarget && hasGroupId(body)) {
      this.addEventListener('load', notify, { once: true });
    }
    return originalSend.call(this, body);
  };
})();