// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");
const resourceIdInput = document.getElementById("resourceId");
const resourceListEl = document.getElementById("resourceList");

const role = "admin"; // "reserver" | "admin"
let createButton = null;
let primaryActionButton = null;
let clearButton = null;
let resourceNameValid = false
let resourceDescriptionValid = false
let formMode = "create";
let resourcesCache = [];
let selectedResourceId = null;
let originalState = null;
let originalStateChanged = [false, false, false, false, false];

// ===============================
// 2) Button creation helpers
// ===============================

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

const BUTTON_DISABLED_CLASSES =
  "cursor-not-allowed opacity-50";

function addButton({ label, type = "button", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();

  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;

  // Keep disabled look in ONE place (here)
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  // Optional: remove hover feel when disabled (recommended UX)
  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    // Only re-add if this button is supposed to have it
    // (for Create we know it is)
    if (btn.value === "create" || btn.textContent === "Create") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
  }
}

function renderActionButtons(currentRole) {
  actions.innerHTML = "";
  if (currentRole === "admin" && formMode === "create") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    clearButton = addButton({
      label: "Clear",
      type: "button",
      classes: BUTTON_ENABLED_CLASSES,
    });

    setButtonEnabled(createButton, false);
    primaryActionButton = createButton;
    setButtonEnabled(clearButton, true);
    clearButton.addEventListener("click", () => {
      clearResourceForm();
      clearFormMessage();
    });
  }

  if (currentRole === "admin" && formMode === "edit") {
    updateButton = addButton({
      label: "Update",
      type: "submit",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete",
      type: "submit",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
    setButtonEnabled(updateButton, false);
    primaryActionButton = updateButton;
    setButtonEnabled(deleteButton, true);
  }
}

function setCurrentResourceId(id) {
  if (!resourceIdInput) return;
  resourceIdInput.value = id ? String(id) : "";
}

// ==========================================
// 3) Input creation + validation + clearing
// ==========================================
function createResourceNameInput(container) {
  const input = document.createElement("input");

  // Core attributes
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";

  // Base Tailwind styling (single source of truth)
  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30
    transition-all duration-200 ease-out
  `;

  container.appendChild(input);
  return input;
}

function isResourceNameValid(value) {
  const trimmed = value.trim();

  // Allowed characters: A–Z, a–z, 0–9, ä ö å, space, , . - (based on your current regex)
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/;
  const lengthValid = trimmed.length >= 5 && trimmed.length <= 30;
  const charactersValid = allowedPattern.test(trimmed);
  return lengthValid && charactersValid;
}

function createResourceDescriptionArea(container) {
  const textarea = document.createElement("textarea");

  // Core attributes
  textarea.id = "resourceDescription";
  textarea.name = "resourceDescription";
  textarea.rows = 5;
  textarea.placeholder =
    "Describe location, capacity, included equipment, or any usage notes…";

  // Base Tailwind styling (single source of truth)
  textarea.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out
  `;

  container.appendChild(textarea);
  return textarea;
}

function isResourceDescriptionValid(value) {
  const trimmed = value.trim();

  // Allowed characters: A–Z, a–z, 0–9, ä ö å, space, , . - (based on your current regex)
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/;
  const lengthValid = trimmed.length >= 10 && trimmed.length <= 50;
  const charactersValid = allowedPattern.test(trimmed);
  return lengthValid && charactersValid;
}

function setInputVisualState(input, state) {
  // Reset to neutral base state (remove only our own validation-related classes)
  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30",
    "focus:border-brand-blue",
    "focus:ring-brand-blue/30"
  );

  // Ensure base focus style is present when neutral
  // (If we are valid/invalid, we override ring color but keep ring behavior)
  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else if (state === "invalid") {
    input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  }
}

function attachResourceNameValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      return;
    }
    resourceNameValid = isResourceNameValid(raw);

    setInputVisualState(input, resourceNameValid ? "valid" : "invalid");
    if (raw != originalState?.name) {
      originalStateChanged[0] = true;
    } else {
      originalStateChanged[0] = false;
    }
    refreshPrimaryButtonState();
  };

  // Real-time validation
  input.addEventListener("input", update);

  // Initialize state on page load (Create disabled until valid)
  update();
}

function attachResourceDescriptionValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      return;
    }

    resourceDescriptionValid = isResourceDescriptionValid(raw);
    setInputVisualState(input, resourceDescriptionValid ? "valid" : "invalid");
    if (raw != originalState?.description) {
      originalStateChanged[1] = true;
    } else {
      originalStateChanged[1] = false;
    }
    refreshPrimaryButtonState();
  };

  // Real-time validation
  input.addEventListener("input", update);

  // Initialize state on page load (Create disabled until valid)
  update();
}

function attachStateListeners() {
  const listeners = [
    {
      index: 2,  // resourceAvailable affects element 1
      element: document.getElementById("resourceAvailable"),
      getValue: el => el.checked,
      original: originalState?.available
    },
    {
      index: 3,  // resourcePrice affects element 2
      element: document.getElementById("resourcePrice"),
      getValue: el => el.value,
      original: originalState?.price
    },
    {
      index: 4,  // resourcePriceUnit affects element 3
      element: document.querySelectorAll('input[name="resourcePriceUnit"]'),
      isRadioGroup: true,
      getValue: el => el.value,
      original: originalState?.price_unit
    }
  ];

  listeners.forEach(item => {
    if (!item.element) return;

    if (item.isRadioGroup) {
      item.element.forEach(radio => {
        radio.addEventListener("change", (e) => {
          updateChangeState(
            item.index,
            item.getValue(e.target),
            item.original
          );
        });
      });
    } else {
      item.element.addEventListener("change", () => {
        updateChangeState(
          item.index,
          item.getValue(item.element),
          item.original
        );
      });
    }
  });
}


function updateChangeState(index, currentValue, originalValue) {
  originalStateChanged[index] = currentValue != originalValue;
  const anyChanged = originalStateChanged.includes(true);
  if (anyChanged) refreshPrimaryButtonState();
}

function refreshPrimaryButtonState() {
  const valid = resourceNameValid && resourceDescriptionValid;
  if (formMode === "create") {
    setButtonEnabled(primaryActionButton, valid);
  } else {
    setButtonEnabled(primaryActionButton, valid && originalStateChanged.includes(true));
  }
}

// Clear button functionality 
function clearResourceForm() {
  resourceNameValid = false;
  resourceDescriptionValid = false;
  originalStateChanged.fill(false);
  resourceNameInput.value = "";
  resourceNameInput.dispatchEvent(new Event("input", { bubbles: true }));
  resourceDescriptionArea.value = "";
  resourceDescriptionArea.dispatchEvent(new Event("input", { bubbles: true }));
  const defaultAvailable = document.getElementById("resourceAvailable");
  if (defaultAvailable) {
    defaultAvailable.checked = false;
  }
  const priceInput = document.getElementById("resourcePrice");
  if (priceInput) {
    priceInput.value = "";
    priceInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const defaultUnit = document.querySelector(
    'input[name="resourcePriceUnit"][value="hour"]'
  );
  if (defaultUnit) {
    defaultUnit.checked = true;
  }
  setButtonEnabled(createButton, false);
};

function clearFormMessage() {
  formMsg = document.getElementById("formMessage");
  if (!formMsg) return;
  formMsg.textContent = "";
  formMsg.classList.add("hidden");
};

function renderResourceList(resources) {
  if (!resourceListEl) return;
  resourceListEl.innerHTML = resources
    .map((r) => {
      return `
        <button
          type="button"
          data-resource-id="${r.id}"
          class="w-full text-left rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5"
          title="Select resource"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold truncate">${r.name ?? ""}</div>
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  // Wire selection clicks
  resourceListEl.querySelectorAll("[data-resource-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearFormMessage();
      const id = Number(btn.dataset.resourceId);
      const resource = resourcesCache.find((x) => Number(x.id) === id);
      if (!resource) return;
      selectResource(resource);
    });
  });
};

function selectResource(resource) {
  originalState = resource;
  selectedResourceId = Number(resource.id);
  if (resourceIdInput) resourceIdInput.value = String(resource.id);

  resourceNameInput.value = resource.name ?? "";
  resourceNameInput.dispatchEvent(new Event("input", { bubbles: true }));
  resourceDescriptionArea.value = resource.description ?? "";
  resourceDescriptionArea.dispatchEvent(new Event("input", { bubbles: true }));

  const available = document.getElementById("resourceAvailable");
  if (available) available.checked = Boolean(resource.available);

  const priceInput = document.getElementById("resourcePrice");
  if (priceInput) {
    priceInput.value = resource.price ?? 0;
    priceInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const unit = resource.price_unit ?? "hour";
  const unitRadio = document.querySelector(`input[name="resourcePriceUnit"][value="${unit}"]`);
  if (unitRadio) unitRadio.checked = true;

  // Switch to edit mode
  formMode = "edit";
  renderActionButtons(role);
  highlightSelectedResource(resource.id);
  attachStateListeners();
}

function highlightSelectedResource(id) {
  if (!resourceListEl) return;
  const items = resourceListEl.querySelectorAll("[data-resource-id]");
  items.forEach((el) => {
    const thisId = Number(el.dataset.resourceId);
    const isSelected = id && thisId === Number(id);
    el.classList.toggle("ring-2", isSelected);
    el.classList.toggle("ring-brand-blue/40", isSelected);
    el.classList.toggle("bg-brand-blue/5", isSelected);
  });
}

async function loadResources() {
  try {
    const res = await fetch("/api/resources");
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Failed to load resources:", res.status, body);
      renderResourceList([]);
      return;
    }

    resourcesCache = Array.isArray(body.data) ? body.data : [];
    renderResourceList(resourcesCache);

    // If we still have an ID selected, keep it selected after refresh
    const idNow = resourceIdInput?.value ? Number(resourceIdInput.value) : null;
    if (idNow) {
      const found = resourcesCache.find((x) => Number(x.id) === idNow);
      if (found) selectResource(found);
    }
  } catch (err) {
    console.error("Failed to load resources:", err);
    renderResourceList([]);
  }
}

// ===============================
// 4) Bootstrapping
// ===============================
renderActionButtons(role);

const resourceNameInput = createResourceNameInput(resourceNameCnt);
attachResourceNameValidation(resourceNameInput);
const resourceDescriptionArea = createResourceDescriptionArea(resourceDescriptionCnt);
attachResourceDescriptionValidation(resourceDescriptionArea);

// From form.js
window.onResourceActionSuccess = async ({ action }) => {
  if (action === "delete" || action === "create" || action === "update") {
    setCurrentResourceId(null);
    selectedResourceId = null;
    formMode = "create";
    clearResourceForm();
  }
  await loadResources();
  renderActionButtons(role);
};

loadResources();