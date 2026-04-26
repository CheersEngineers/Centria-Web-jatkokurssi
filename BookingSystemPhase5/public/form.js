// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function getFormMessageEl() {
  return document.getElementById("formMessage");
}

/**
 * Show a success/error/info message in the UI.
 * type: "success" | "error" | "info"
 */
function showFormMessage(type, message) {
  const el = getFormMessageEl();
  if (!el) return;

  // Base styling
  el.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  el.classList.remove("hidden");

  // Type-specific styling (Tailwind utility classes)
  if (type === "success") {
    el.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else if (type === "info") {
    el.classList.add("border-amber-200", "bg-amber-50", "text-amber-900");
  } else {
    // error (default)
    el.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  // Preserve line breaks
  el.textContent = message;

  // Bring message into view (nice UX after submit)
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  const el = getFormMessageEl();
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

// Timestamp (for logging)
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

/**
 * Try to read JSON from the response.
 * If JSON is not available, return a best-effort object including raw text.
 */
async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  // JSON is the expected format from our API
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }

  // Fallback: read as text
  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "Non-JSON response", raw: text };
  }
}

/**
 * Build a readable message for field validation errors returned by the API.
 * Expected format: { errors: [ { field, msg }, ... ] }
 */
function buildValidationMessage(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Validation failed. Please check your input fields.";
  }

  const lines = errors.map((e) => {
    const field = e.field || "field";
    const msg = e.msg || "Invalid value";
    return `• ${field}: ${msg}`;
  });

  return `Your request was blocked by server-side validation:\n\n${lines.join("\n")}`;
}

/**
 * Build a readable message for generic API errors.
 */
function buildGenericErrorMessage(status, body) {
  const details = body?.details ? `\n\nDetails: ${body.details}` : "";
  const error = body?.error ? body.error : "Request failed";
  return `Server returned an error (${status}).\n\nReason: ${error}${details}`;
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) return;
  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter && submitter.value ? submitter.value : "create";

  const selectedUnit =
    document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";

  const priceRaw = $("resourcePrice")?.value ?? "";
  const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);

  const payload = {
    action: actionValue,
    resourceName: $("resourceName")?.value ?? "",
    resourceDescription: $("resourceDescription")?.value ?? "",
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice,
    resourcePriceUnit: selectedUnit,
  };

  try {
    clearFormMessage();
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Always parse body (for both success and error cases)
    const body = await readResponseBody(response);

    // -----------------------------------------
    // Error handling by HTTP status
    // -----------------------------------------
    if (!response.ok) {
      // 400 = server-side validation errors (we expect errors[])
      if (response.status === 400) {
        const msg = buildValidationMessage(body?.errors);
        showFormMessage("error", msg);
        return;
      }

      // 409 = duplicate resourceName (our new feature)
      if (response.status === 409) {
        const msg =
          body?.details ||
          "A resource with the same name already exists. Please choose another name.";
        showFormMessage("info", `Duplicate blocked (409):\n\n${msg}`);
        return;
      }

      // Other errors (500, 404, etc.)
      showFormMessage("error", buildGenericErrorMessage(response.status, body));
      return;
    }

    // -----------------------------------------
    // Success handling (2xx)
    // -----------------------------------------
    // We expect: { ok: true, data: {...} }
    const createdAtIso = body?.data?.created_at || "";
    const createdAt = createdAtIso
      ? createdAtIso.replace("T", " ").replace("Z", "")
      : "";

    const msgLines = [];
    msgLines.push(`Name ➡️ ${body?.data?.name ?? ""}`);
    if (createdAt) msgLines.push(`Created at ➡️ ${createdAt}`);
    msgLines.push(`ID in database ➡️ ${body?.data?.id ?? ""}`);

    const msg = msgLines.join("\n");
    showFormMessage("success", msg);

    // Notify UI layer (resources.js)
    if (typeof window.onResourceActionSuccess === "function") {
      window.onResourceActionSuccess({
        action: actionValue,
        data: "success"
      });
    }

  } catch (err) {
    // Network errors, CORS issues, server unreachable, etc.
    console.error("POST error:", err);
    showFormMessage("error", "Network error: Could not reach the server. Check your environment and try again.");
  }
}