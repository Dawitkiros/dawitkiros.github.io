(() => {
  try {
    const saved = localStorage.getItem('color-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch (_) { /* Use the system preference when storage is unavailable. */ }
})();
