(function() {
  function isTargetUrl(url) {
    return typeof url === 'string' && url.includes('messages.send');
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
      notify();
    }
    return originalFetch.apply(this, args);
  };

  // Перехват XMLHttpRequest (на случай старых методов)
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (isTargetUrl(url)) {
      this.addEventListener('load', notify, { once: true });
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();