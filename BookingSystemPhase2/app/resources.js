// resources.js
import { validateResourceName, validateResourceDescription, setFieldValidity } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#resourceForm') || document.querySelector('form');
  if (!form) return;

  const nameInput = form.querySelector('input[name="resourceName"]') || form.querySelector('#resourceName');
  const descInput = form.querySelector('textarea[name="resourceDescription"]') || form.querySelector('#resourceDescription');

  const createBtn = form.querySelector('#createBtn') || form.querySelector('button[name="create"]');
  const updateBtn = form.querySelector('#updateBtn') || form.querySelector('button[name="update"]');
  const deleteBtn = form.querySelector('#deleteBtn') || form.querySelector('button[name="delete"]');

  const nameError = form.querySelector('#resourceNameError');
  const descError = form.querySelector('#resourceDescriptionError');
  const serverMessage = form.querySelector('#serverMessage');

  // Ensure Create disabled by default
  if (createBtn) createBtn.disabled = true;

  function validateAll() {
    const nameVal = nameInput ? nameInput.value : '';
    const descVal = descInput ? descInput.value : '';

    const nameValid = validateResourceName(nameVal);
    const descValid = validateResourceDescription(descVal);

    setFieldValidity(nameInput, nameValid, nameError);
    setFieldValidity(descInput, descValid, descError);

    const allValid = nameValid && descValid;
    if (createBtn) createBtn.disabled = !allValid;
    return { allValid, nameValid, descValid };
  }

  // Real-time validation while typing
  [nameInput, descInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => validateAll());
    el.addEventListener('blur', () => validateAll());
  });

  // Initial validation pass
  validateAll();

  function showServerError(message) {
    if (!serverMessage) return;
    serverMessage.className = 'server-error';
    serverMessage.textContent = `Error: ${message}`;
  }

  function showServerSuccess(message) {
    if (!serverMessage) return;
    serverMessage.className = 'server-success';
    serverMessage.textContent = message;
    setTimeout(() => {
      if (serverMessage && serverMessage.className === 'server-success') {
        serverMessage.textContent = '';
      }
    }, 3000);
  }

  // Build cleaned payload from form fields
  function buildPayload() {
    return {
      name: nameInput ? nameInput.value.trim() : '',
      description: descInput ? descInput.value.trim() : ''
      // add other cleaned fields here if present
    };
  }

  // Submit handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Determine which button triggered the submit
    const submitter = event.submitter || document.activeElement;
    const action = submitter && submitter.name ? submitter.name : 'submit';

    // Re-validate before sending
    const { allValid } = validateAll();
    if (!allValid && action === 'create') {
      // Do not send invalid payload for create action
      return;
    }

    // For update/delete you may want different behavior; here we still build payload and send trimmed values
    const payload = buildPayload();

    // UI: disable relevant buttons while request in-flight
    const buttonsToDisable = [createBtn, updateBtn, deleteBtn].filter(Boolean);
    buttonsToDisable.forEach(b => b.disabled = true);

    // Clear previous server message
    if (serverMessage) {
      serverMessage.textContent = '';
      serverMessage.className = '';
    }

    // Choose endpoint and method based on action (adjust endpoints to match server)
    let url = '/api/resources';
    let method = 'POST';
    if (action === 'update') method = 'PUT';
    if (action === 'delete') method = 'DELETE';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Try to parse JSON error, fallback to text
        let errText = `Status ${res.status}`;
        try {
          const json = await res.json();
          errText = json.message || JSON.stringify(json);
        } catch (e) {
          try { errText = await res.text(); } catch (e2) { }
        }
        showServerError(errText || `Server responded ${res.status}`);
        validateAll();
        return;
      }

      // Success
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      showServerSuccess('Operation successful.');

      // Reset form only for create success
      if (action === 'create') {
        form.reset();
        validateAll();
      }

      // Dispatch a custom event so other scripts can react (e.g., refresh list)
      form.dispatchEvent(new CustomEvent('resource:changed', { detail: { action, data } }));
    } catch (err) {
      showServerError(err && err.message ? err.message : 'Network error');
      validateAll();
    } finally {
      // Re-enable buttons only if inputs are still valid (for create)
      const { allValid: stillValid } = validateAll();
      if (createBtn) createBtn.disabled = !stillValid;
      [updateBtn, deleteBtn].forEach(b => { if (b) b.disabled = false; });
    }
  });
});
