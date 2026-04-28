# 📘 Final Exam: Customer Management (Full Stack Basics)

> [!NOTE]
> The material may have been supported by AI tools. You may also use AI tools to support your work, but you are expected to fully understand and implement the solution yourself.

---

## 🎯 Goal

The goal of this exam is to demonstrate that you understand:

* how a frontend interacts with a backend API
* how to implement basic **CRUD operations**
* how to manipulate the DOM using JavaScript
* how to connect user interaction with application state

This exam focuses on implementing a working **customer management interface**.

---

## 📦 Starting point

You will receive a ready-made project as a `.zip` file.

👉 Extract the project and follow the setup instructions from the provided video.

The application already includes:

* a working backend API
* a database
* a frontend UI structure

---

## 🧩 Main task

You must implement customer management functionality inside the following section:

```html
<section class="panel" aria-labelledby="customer-management-heading">
    <h2 id="customer-management-heading">Customer Management</h2>
    <p class="panel-description">
        Use this area to add new customers, edit existing customer information, and delete records.
    </p>

    <div class="placeholder-box" id="customer-form">
        <p>
            Customer form and management actions will be added here later.
        </p>
    </div>
</section>
```

---

## 🚀 Required functionality

You must implement the following features:

---

## 1️⃣ Create (Add new customer)

* Create a form inside the **Customer Management** area
* The form must allow adding a new customer
* The data must be sent to the backend API
* The customer list must update after adding

---

## 2️⃣ Select (Load existing customer)

* When a user clicks a customer in the **Customer Records** area
* The selected customer’s data must appear in the form

---

## 3️⃣ Update OR Delete (minimum requirement)

After a customer is selected 👉 You must implement **at least one** of the following:

* update the customer’s data using the form
* delete the customer

👉 You may implement both for a stronger solution

---

## ⚙ Technical constraints

You are allowed to modify **only the following files**:

```text
index.html
index.js
styles.css
```

You must NOT modify:

* backend code
* database
* Docker configuration

---

## 🧠 Data fields

Your form must support the following fields:

* first name
* last name
* email
* phone
* birth date

---

## 🖥 User interface expectations

* The form must be placed inside the **Customer Management** area
* The customer list must remain in the **Customer Records** area
* Clicking a customer must populate the form
* The interface must remain clear and consistent
* The form must be **user-friendly**
* You may update `styles.css` to improve layout, spacing, readability, and usability

A user-friendly form means, for example:

* labels are clearly visible
* fields are easy to distinguish
* spacing is sufficient
* buttons are easy to understand
* the form fits the existing visual style of the page

---

## 📤 Submission

**👉 Push the code to GitHub**

Push the finished work to GitHub. Your repository must include:

* the full stack source code
* all files needed to run the project
* required folder structure:

```
final-exam/
└── All codes (your project files here)
```

---

**👉 Take the screenshot**

The screenshot must clearly show:

* Show the application running (browser)
* AND backend/container/logs visible at the same time

---

**👉 Submit to the itslearning assignment submission box**

1. 🔗 **GitHub repository link**
2. 📸 **One screenshot**
3. 🤖 **Short note about AI usage**

   * State which AI tool you primarily used (if any)
   * Briefly describe how you used it (e.g., debugging, code generation, explanations)

---

## ✅ Evaluation (Pass / Fail)

### ❌ Fail

* No working solution
* Customers cannot be added
* Clicking a customer does not populate the form
* The functionality is incomplete or broken
* The form is so unclear or unfinished that it cannot be used normally

---

### ✅ Pass

* A customer can be added through the form
* Clicking a customer loads its data into the form
* **update** or **delete** implemented, or both
* The application works as a coherent system
* The form is reasonably clear and usable for a normal user

---

## 📋 Checklist

[ ] Project extracted and running  
[ ] Form created in Customer Management area  
[ ] `styles.css` updated when needed  
[ ] New customer can be added  
[ ] Customer list updates correctly  
[ ] Clicking a customer loads data into the form  
[ ] Update or delete functionality implemented  
[ ] Only allowed files modified  
[ ] Code pushed to GitHub  
[ ] Screenshot taken  

---

## 💡 Final note

Focus on:

* clear logic
* working functionality
* correct API usage

The most important outcome is that the application behaves as a **connected system** where:

```text
User interaction → JavaScript → API → Database → UI update
```

---