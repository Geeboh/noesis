(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const modes = ['system', 'light', 'dark'];
  const nextMode = (mode) => modes[(modes.indexOf(mode) + 1) % modes.length];
  const updateThemeLabel = () => {
    if (!themeButton) return;
    const mode = root.dataset.uiColorMode || 'system';
    themeButton.textContent = mode === 'system' ? '☼ System' : mode === 'light' ? '☼ Light' : '☼ Dark';
    themeButton.setAttribute('aria-label', `Switch to ${nextMode(mode)} theme`);
  };

  themeButton?.addEventListener('click', () => {
    root.dataset.uiColorMode = nextMode(root.dataset.uiColorMode || 'system');
    updateThemeLabel();
  });
  updateThemeLabel();

  document.querySelectorAll('.skip-link[href="#main-content"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  });

  document.querySelectorAll('[data-retry]').forEach((button) => {
    button.addEventListener('click', () => {
      const status = document.querySelector(button.dataset.retry);
      const message = status?.querySelector('[data-status-message]');
      if (!status || !message) return;
      message.textContent = 'Retry queued. Waiting for local service response; selected scope and revision preserved. No progress assumed.';
      status.classList.remove('error');
      status.classList.add('success');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      button.disabled = true;
    });
  });

  document.querySelectorAll('[data-open-details]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(button.dataset.openDetails)?.scrollIntoView({ block: 'start' });
    });
  });
})();
