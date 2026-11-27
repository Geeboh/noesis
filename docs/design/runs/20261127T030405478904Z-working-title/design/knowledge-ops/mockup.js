(() => {
  const focusMain = (event) => {
    const target = document.querySelector(event.currentTarget.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  };

  document.querySelectorAll('.skip[href^="#"]').forEach((link) => {
    link.addEventListener('click', focusMain);
  });

  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;
    const activate = (tab) => {
      tabs.forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute('aria-selected', String(selected));
        candidate.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(candidate.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    };
    const moveFocus = (index) => tabs[(index + tabs.length) % tabs.length].focus();
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveFocus(index + 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveFocus(index - 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          moveFocus(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          moveFocus(tabs.length - 1);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate(tab);
        }
      });
    });
    activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  });

  const dialog = document.querySelector('dialog[data-active-dialog]');
  if (!dialog) return;
  let opener = document.querySelector(dialog.dataset.opener || '#forget-open');
  const destructive = dialog.dataset.destructive === 'true';
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
  const closeDialog = (allowDestructive = false) => {
    if (destructive && !allowDestructive) return;
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
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => closeDialog(true)));
  dialog.querySelectorAll('[data-dialog-confirm]').forEach((button) => button.addEventListener('click', () => {
    const status = dialog.querySelector('[data-dialog-status]');
    if (!status) return;
    status.textContent = 'Design mockup only: confirmation remains planned; no record was changed.';
    status.setAttribute('role', 'status');
  }));
  document.querySelectorAll('[data-dialog-open]').forEach((button) => button.addEventListener('click', () => openDialog(button)));

  if (dialog.open) dialog.close();
  openDialog(opener);
})();
