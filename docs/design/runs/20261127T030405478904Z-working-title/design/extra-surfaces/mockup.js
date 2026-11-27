(() => {
  const root = document.documentElement;
  const modes = ['system', 'light', 'dark'];
  const nextMode = (mode) => modes[(modes.indexOf(mode) + 1) % modes.length];

  const updateThemeButton = (button) => {
    const mode = root.dataset.uiColorMode || 'system';
    const next = nextMode(mode);
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    const label = button.querySelector('span');
    if (label) label.textContent = `Theme: ${mode}`;
  };
  document.querySelectorAll('.theme-button, [data-theme-toggle]').forEach((button) => {
    updateThemeButton(button);
    button.addEventListener('click', () => {
      root.dataset.uiColorMode = nextMode(root.dataset.uiColorMode || 'system');
      updateThemeButton(button);
    });
  });

  document.querySelectorAll('.skip-link[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  });

  const dialog = document.querySelector('dialog[data-active-dialog]');
  if (!dialog) return;
  let opener = document.querySelector(dialog.dataset.opener || '#palette-trigger');
  const inertElements = [...document.querySelectorAll('[inert]')];
  const focusables = () => [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
  const restoreFocus = () => {
    inertElements.forEach((element) => element.inert = false);
    opener?.focus();
  };
  const focusInitial = () => (dialog.querySelector('[autofocus]') || focusables()[0])?.focus();
  const openDialog = (button = opener) => {
    opener = button;
    inertElements.forEach((element) => element.inert = true);
    if (!dialog.open) dialog.showModal();
    focusInitial();
  };
  const closeDialog = () => {
    dialog.close();
    restoreFocus();
  };

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const candidates = focusables();
    if (candidates.length < 2) return;
    const first = candidates[0];
    const last = candidates[candidates.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', closeDialog));
  dialog.querySelectorAll('[data-dialog-clear]').forEach((button) => button.addEventListener('click', () => {
    const input = dialog.querySelector('input[type="search"]');
    if (!input) return;
    input.value = '';
    input.focus();
  }));
  document.querySelectorAll('[data-dialog-open]').forEach((button) => button.addEventListener('click', () => openDialog(button)));

  if (dialog.open) dialog.close();
  openDialog(opener);
})();
