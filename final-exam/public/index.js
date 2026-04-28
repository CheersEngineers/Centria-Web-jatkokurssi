const API_URL = "/api/persons";

const formContainer = document.getElementById("customer-form");
const listContainer = document.getElementById("customer-list");

let selectedCustomerId = null;

function showMessage(message, type = "info") {
  const messageBox = document.getElementById("form-message");
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `form-message ${type}`;
}

function getErrorMessage(data, fallback) {
  if (data && typeof data.error === "string") {
    return data.error;
  }

  return fallback;
}

function toDateInputValue(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function formatDate(value) {
  const dateValue = toDateInputValue(value);
  if (!dateValue) return "-";

  return dateValue;
}

function renderForm() {
  formContainer.classList.remove("placeholder-box");
  formContainer.classList.add("customer-form-wrapper");

  formContainer.innerHTML = `
    <form id="person-form" class="customer-form">
      <input type="hidden" id="person-id" />

      <div class="form-row">
        <label for="first-name">First name <span aria-hidden="true">*</span></label>
        <input id="first-name" name="first_name" type="text" autocomplete="given-name" required />
      </div>

      <div class="form-row">
        <label for="last-name">Last name <span aria-hidden="true">*</span></label>
        <input id="last-name" name="last_name" type="text" autocomplete="family-name" required />
      </div>

      <div class="form-row">
        <label for="email">Email <span aria-hidden="true">*</span></label>
        <input id="email" name="email" type="email" autocomplete="email" required />
      </div>

      <div class="form-row">
        <label for="phone">Phone</label>
        <input id="phone" name="phone" type="tel" autocomplete="tel" />
      </div>

      <div class="form-row">
        <label for="birth-date">Birth date</label>
        <input id="birth-date" name="birth_date" type="date" />
      </div>

      <div class="form-actions">
        <button type="submit" id="save-button">Add customer</button>
        <button type="button" id="clear-button" class="secondary-button">Clear form</button>
        <button type="button" id="delete-button" class="danger-button" hidden>Delete selected</button>
      </div>

      <p id="form-message" class="form-message" aria-live="polite"></p>
    </form>
  `;

  document.getElementById("person-form").addEventListener("submit", saveCustomer);
  document.getElementById("clear-button").addEventListener("click", clearForm);
  document.getElementById("delete-button").addEventListener("click", deleteCustomer);
}

function readFormData() {
  return {
    first_name: document.getElementById("first-name").value.trim(),
    last_name: document.getElementById("last-name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    birth_date: document.getElementById("birth-date").value || null,
  };
}

function fillForm(person) {
  selectedCustomerId = person.id;

  document.getElementById("person-id").value = person.id;
  document.getElementById("first-name").value = person.first_name || "";
  document.getElementById("last-name").value = person.last_name || "";
  document.getElementById("email").value = person.email || "";
  document.getElementById("phone").value = person.phone || "";
  document.getElementById("birth-date").value = toDateInputValue(person.birth_date);

  document.getElementById("save-button").textContent = "Update customer";
  document.getElementById("delete-button").hidden = false;

  showMessage(
    `Selected ${person.first_name} ${person.last_name}. You can now update or delete this customer.`,
    "info"
  );

  highlightSelectedCustomer();
}

function clearForm() {
  selectedCustomerId = null;

  document.getElementById("person-form").reset();
  document.getElementById("person-id").value = "";
  document.getElementById("save-button").textContent = "Add customer";
  document.getElementById("delete-button").hidden = true;

  showMessage("Form cleared. You can add a new customer.", "info");
  highlightSelectedCustomer();
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }

  return data;
}

async function saveCustomer(event) {
  event.preventDefault();

  const payload = readFormData();

  const isEditing = selectedCustomerId !== null;
  const url = isEditing ? `${API_URL}/${selectedCustomerId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const data = await requestJson(url, {
      method,
      body: JSON.stringify(payload),
    });

    const savedPerson = data.person;

    await loadCustomers();

    if (isEditing && savedPerson) {
      fillForm(savedPerson);
      showMessage("Customer updated successfully.", "success");
    } else {
      clearForm();
      showMessage("Customer added successfully.", "success");
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteCustomer() {
  if (selectedCustomerId === null) {
    showMessage("Select a customer before deleting.", "error");
    return;
  }

  const confirmed = window.confirm("Delete the selected customer?");
  if (!confirmed) return;

  try {
    await requestJson(`${API_URL}/${selectedCustomerId}`, {
      method: "DELETE",
    });

    clearForm();
    await loadCustomers();
    showMessage("Customer deleted successfully.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function createCustomerCard(person) {
  const card = document.createElement("article");
  card.className = "customer-card";
  card.dataset.customerId = String(person.id);
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Select ${person.first_name} ${person.last_name}`);

  const name = document.createElement("strong");
  name.textContent = `${person.first_name} ${person.last_name}`;

  const email = document.createElement("p");
  email.textContent = `Email: ${person.email}`;

  const phone = document.createElement("p");
  phone.textContent = `Phone: ${person.phone || "-"}`;

  const birthDate = document.createElement("p");
  birthDate.textContent = `Birth date: ${formatDate(person.birth_date)}`;

  card.append(name, email, phone, birthDate);

  card.addEventListener("click", () => fillForm(person));

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fillForm(person);
    }
  });

  return card;
}

function highlightSelectedCustomer() {
  document.querySelectorAll(".customer-card").forEach((card) => {
    const isSelected = Number(card.dataset.customerId) === selectedCustomerId;
    card.classList.toggle("selected", isSelected);
  });
}

async function loadCustomers() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }

    const customers = await response.json();

    listContainer.classList.remove("placeholder-box");
    listContainer.classList.add("customer-list");
    listContainer.innerHTML = "";

    if (customers.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No customers found.";
      listContainer.appendChild(emptyMessage);
      return;
    }

    customers.forEach((person) => {
      listContainer.appendChild(createCustomerCard(person));
    });

    highlightSelectedCustomer();
  } catch (error) {
    console.error(error);
    listContainer.innerHTML = "<p class='form-message error'>Error loading customers.</p>";
  }
}

renderForm();
loadCustomers();