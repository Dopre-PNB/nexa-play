'use strict';

document.querySelectorAll('.auth-password-display[aria-controls]').forEach((button) => {
  const input = document.getElementById(button.getAttribute('aria-controls'));
  if (!input || input.type !== 'password') return;

  button.disabled = false;
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    const fieldLabel = button.dataset.fieldLabel || 'senha';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'OCULTAR' : 'MOSTRAR';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', `${show ? 'Ocultar' : 'Mostrar'} ${fieldLabel}`);
  });
});
