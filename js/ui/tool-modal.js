const modalAnimationCleanups = new WeakMap();

function clearToolModalAnimation(modal) {
  const cleanup = modalAnimationCleanups.get(modal);
  if (cleanup) cleanup();
  modalAnimationCleanups.delete(modal);
  modal.classList.remove('tool-modal-opening', 'tool-modal-closing');
}

function runToolModalAnimation(modal, animationClass, animationName, onComplete) {
  clearToolModalAnimation(modal);
  const panel = modal.firstElementChild;
  if (!panel) {
    onComplete();
    return;
  }

  const handleAnimationEnd = (event) => {
    if (event.target !== panel || event.animationName !== animationName) return;
    clearToolModalAnimation(modal);
    onComplete();
  };
  const timeout = setTimeout(() => {
    clearToolModalAnimation(modal);
    onComplete();
  }, 500);

  panel.addEventListener('animationend', handleAnimationEnd);
  modalAnimationCleanups.set(modal, () => {
    clearTimeout(timeout);
    panel.removeEventListener('animationend', handleAnimationEnd);
  });
  modal.classList.add(animationClass);
}

function getToolModalAnimationName(direction) {
  const viewport = window.matchMedia('(max-width: 639px)').matches ? 'mobile' : 'desktop';
  return `${viewport}ToolPanel${direction}`;
}

export function openToolModal(modal) {
  clearToolModalAnimation(modal);
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  runToolModalAnimation(
    modal,
    'tool-modal-opening',
    getToolModalAnimationName('In'),
    () => {}
  );
}

export function closeToolModal(modal) {
  if (modal.classList.contains('hidden')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearToolModalAnimation(modal);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    return;
  }

  runToolModalAnimation(
    modal,
    'tool-modal-closing',
    getToolModalAnimationName('Out'),
    () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  );
}
