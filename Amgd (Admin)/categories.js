/**
 * Admin Categories Management
 * Description: Category CRUD operations with validation
 */

// ===========================
//  DOM ELEMENTS
// ===========================
var categoriesBody = document.getElementById("categories-body");
var categoryNameInput = document.getElementById("category-name");
var addCategoryBtn = document.getElementById("add-category-btn");
var categoryError = document.getElementById("category-error");

var editingCategoryId = null;

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  loadCategories(function() {
    loadProducts(function() {
      renderCategories();
    });
  });
}

// ===========================
//  VALIDATION
// ===========================

/**
 * Validate category name
 */
function validateCategoryName(name, excludeId) {
  // Required check
  if (!name || name.trim() === "") {
    return { valid: false, error: "Category name is required" };
  }

  name = name.trim();

  // Length check
  if (name.length < 3) {
    return { valid: false, error: "Category name must be at least 3 characters" };
  }

  if (name.length > 30) {
    return { valid: false, error: "Category name cannot exceed 30 characters" };
  }

  // Character check (letters, numbers, spaces only)
  var validPattern = /^[a-zA-Z0-9\s]+$/;
  if (!validPattern.test(name)) {
    return { valid: false, error: "Category name can only contain letters, numbers, and spaces" };
  }

  // Duplicate check
  var categories = getCategories();
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].name.toLowerCase() === name.toLowerCase()) {
      if (excludeId && categories[i].id === excludeId) {
        continue;
      }
      return { valid: false, error: "This category already exists" };
    }
  }

  return { valid: true, error: "" };
}

/**
 * Show error message
 */
function showError(message) {
  if (categoryError) {
    categoryError.textContent = message;
    categoryError.style.color = "#dc3545";
  }
}

/**
 * Clear error message
 */
function clearError() {
  if (categoryError) {
    categoryError.textContent = "";
  }
}

// ===========================
//  RENDER FUNCTIONS
// ===========================

/**
 * Render categories table
 */
function renderCategories() {
  var categories = getCategories();
  var products = getProducts();
  categoriesBody.innerHTML = "";

  if (categories.length === 0) {
    categoriesBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No categories yet. Add your first category!</td></tr>';
    return;
  }

  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];

    // Count products in this category
    var productCount = 0;
    for (var j = 0; j < products.length; j++) {
      if (products[j].categoryId === category.id) {
        productCount++;
      }
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + category.id.substring(0, 6) + "...</td>" +
      "<td>" + category.name + "</td>" +
      "<td>" + productCount + " product(s)</td>" +
      "<td>" +
        '<button class="edit-btn" onclick="editCategory(\'' + category.id + '\', \'' + category.name.replace(/'/g, "\\'") + '\')">Edit</button>' +
        '<button class="delete-btn" onclick="handleDeleteCategory(\'' + category.id + '\', ' + productCount + ')" ' + (productCount > 0 ? 'title="Cannot delete - has products"' : '') + '>Delete</button>' +
      "</td>";
    categoriesBody.appendChild(tr);
  }
}

// ===========================
//  CRUD OPERATIONS
// ===========================

/**
 * Add category button click
 */
addCategoryBtn.addEventListener("click", function() {
  var name = categoryNameInput.value;
  clearError();

  // Validate
  var validation = validateCategoryName(name, editingCategoryId);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  if (editingCategoryId === null) {
    // Add new category
    addCategory(name, function() {
      categoryNameInput.value = "";
      renderCategories();
      // Also update product dropdown if it exists
      if (typeof renderCategoryOptions === "function") {
        renderCategoryOptions();
      }
      alert("Category added successfully!");
    });
  } else {
    // Update existing category
    updateCategory(editingCategoryId, name, function() {
      categoryNameInput.value = "";
      editingCategoryId = null;
      addCategoryBtn.textContent = "Add Category";
      renderCategories();
      // Also update product dropdown if it exists
      if (typeof renderCategoryOptions === "function") {
        renderCategoryOptions();
      }
      alert("Category updated successfully!");
    });
  }
});

/**
 * Edit category
 */
function editCategory(categoryId, categoryName) {
  categoryNameInput.value = categoryName;
  editingCategoryId = categoryId;
  addCategoryBtn.textContent = "Update Category";
  categoryNameInput.focus();
  clearError();
}

/**
 * Cancel edit
 */
function cancelEdit() {
  categoryNameInput.value = "";
  editingCategoryId = null;
  addCategoryBtn.textContent = "Add Category";
  clearError();
}

/**
 * Delete category with product check
 */
function handleDeleteCategory(categoryId, productCount) {
  // Check if category has products
  if (productCount > 0) {
    alert("Cannot delete this category!\n\nIt has " + productCount + " product(s) assigned to it.\nPlease reassign or delete those products first.");
    return;
  }

  var ok = confirm("Are you sure you want to delete this category?");
  if (!ok) return;

  deleteCategory(categoryId, function() {
    renderCategories();
    // Also update product dropdown if it exists
    if (typeof renderCategoryOptions === "function") {
      renderCategoryOptions();
    }
    alert("Category deleted successfully!");
  });
}

// ===========================
//  REAL-TIME VALIDATION
// ===========================

// Validate on input
categoryNameInput.addEventListener("input", function() {
  var name = this.value;
  
  if (name.trim() === "") {
    clearError();
    return;
  }

  var validation = validateCategoryName(name, editingCategoryId);
  if (!validation.valid) {
    showError(validation.error);
  } else {
    clearError();
  }
});

// Handle Enter key
categoryNameInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addCategoryBtn.click();
  }
});

// Start
init();
