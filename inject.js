(function() {
  function isTargetUrl(url) {
    return typeof url === 'string' && url.includes('messages.send');
  }

  function isRealCommunityMessage(body) {
    if (!body) return false;
    
    let text = '';
    if (typeof body === 'string') {
      text = body;
    } else if (body instanceof URLSearchParams) {
      text = body.toString();
    } else {
      return false;
    }

    if (text.includes('action=') || text.includes('reaction_id=')) {
      return false;
    }

    const groupIdMatch = text.match(/group_id=(\d+)/);
    if (!groupIdMatch) return false;
    
    const groupId = parseInt(groupIdMatch[1], 10);
    if (groupId === 0 || isNaN(groupId)) return false; // Если 0 — значит, отправлено от себя

    const hasContent = text.includes('message=') || text.includes('attachment=');
    if (!hasContent) return false;

    return true;
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
        try {
          const cloned = req.clone();
          cloned.text().then(text => {
            if (isRealCommunityMessage(text)) {
              console.log('[Support Counter] Успех! Отправлено от сообщества:', text.substring(0, 100) + '...');
              notify();
            }
          }).catch(() => {});
        } catch (e) {}
      }

      if (bodyText && isRealCommunityMessage(bodyText)) {
        console.log('[Support Counter] Успех! Отправлено от сообщества:', String(bodyText).substring(0, 100) + '...');
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
    if (this._isTarget && isRealCommunityMessage(body)) {
      console.log('[Support Counter] Успех! XHR отправлено от сообщества');
      this.addEventListener('load', notify, { once: true });
    }
    return originalSend.call(this, body);
  };
})();