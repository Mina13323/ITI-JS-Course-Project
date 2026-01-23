import { initStorage, getCategories, saveCategories, getProducts } from "./storage.js";

initStorage();

// DOM Elements
const categoriesBody = document.getElementById("categories-body");
const categoryForm = document.getElementById("category-form");
const addCategoryBtn = document.getElementById("add-category-btn");
const cancelCategoryBtn = document.getElementById("cancel-category-btn");

let editingCategoryId = null;

// Render categories
function renderCategories() {
  const categories = getCategories();
  categoriesBody.innerHTML = "";

  for (let category of categories) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${category.name}</td>
      <td>
        <button class="edit-btn" data-id="${category.id}">Edit</button>
        <button class="delete-btn" data-id="${category.id}">Delete</button>
      </td>
    `;
    categoriesBody.appendChild(tr);
  }
}

// Event delegtion
categoriesBody.addEventListener("click", (e) => {
  const btn = e.target;

  const categoryId = Number(btn.dataset.id);
  if (!categoryId) return;

  if (btn.classList.contains("edit-btn")) {
    editCategory(categoryId);
  }

  if (btn.classList.contains("delete-btn")) {
    deleteCategory(categoryId);
  }
});

// Delete category
function deleteCategory(categoryId) {
  const products = getProducts();
  const used = products.some(p => p.categoryId === categoryId);

  if (used) {
    alert("Cannot delete category: products are using it.");
    return;
  }

  const ok = confirm("Delete this category?");
  if (!ok) return;

  const newCategories = getCategories().filter(c => c.id !== categoryId);
  saveCategories(newCategories);
  renderCategories();
}
window.deleteCategory = deleteCategory;

// Edit category
function editCategory(categoryId) {
  const categories = getCategories();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;

  categoryForm.elements["name"].value = category.name;
  editingCategoryId = categoryId;

  categoryForm.style.display = "block";
  categoryForm.querySelector("button[type='submit']").textContent = "Update";
}
window.editCategory = editCategory;

// Toggle form display
addCategoryBtn.addEventListener("click", () => {
  const isHidden = categoryForm.style.display === "none" || categoryForm.style.display === "";
  categoryForm.style.display = isHidden ? "block" : "none";
  addCategoryBtn.textContent = isHidden ? "Close Form" : "Add Category";
});

// Cancel button
if (cancelCategoryBtn) {
  cancelCategoryBtn.addEventListener("click", () => {
    editingCategoryId = null;
    categoryForm.reset();
    categoryForm.querySelector("button[type='submit']").textContent = "Add Category";
    document.getElementById("category-name-error").textContent = "";
    categoryForm.style.display = "none";
  });
}

// Form submit (Add/Update)
categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = e.target.elements["name"];
  let name = nameInput.value.trim().replace(/\s+/, " ");
  const nameRegex = /^[a-zA-Z]{3,}$/;
  const err = document.getElementById("category-name-error");
  // Validation
  if (!nameRegex.test(name)) {
    err.textContent = "Category name must be at least 3 characters and contain only letters.";
    return;
  }
  err.textContent = "";

  const categories = getCategories();

  if (editingCategoryId === null) {
    // Add new
    categories.push({ id: Date.now(), name });
  } else {
    // Update existing
    const index = categories.findIndex(c => c.id === editingCategoryId);
    categories[index].name = name;
  }

  saveCategories(categories);
  renderCategories();
  e.target.reset();
  editingCategoryId = null;
  categoryForm.querySelector("button[type='submit']").textContent = "Add";
  addCategoryBtn.textContent = "Add Category";
  categoryForm.style.display = "none";
});


renderCategories();
