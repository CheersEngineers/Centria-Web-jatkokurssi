// form.js
// Validation utilities used by resources.js

export function isNonEmptyTrimmed(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateResourceName(name) {
  // Require at least 2 non-space characters
  return isNonEmptyTrimmed(name) && name.trim().length >= 2;
}

export function validateResourceDescription(desc) {
  // Require at least 5 non-space characters
  return isNonEmptyTrimmed(desc) && desc.trim().length >= 5;
}

export function setFieldValidity(fieldEl, isValid, errorEl) {
  if (!fieldEl) return;
  fieldEl.classList.remove('valid', 'invalid');
  if (isValid) {
    fieldEl.classList.add('valid');
    if (errorEl) errorEl.classList.remove('visible');
  } else {
    fieldEl.classList.add('invalid');
    if (errorEl) errorEl.classList.add('visible');
  }
}
