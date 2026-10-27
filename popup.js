document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('count');
  const resetBtn = document.getElementById('resetBtn');

  chrome.storage.local.get(['supportCount'], (res) => {
    countEl.textContent = res.supportCount || 0;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.supportCount) {
      countEl.textContent = changes.supportCount.newValue || 0;
    }
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ supportCount: 0 });
  });
});