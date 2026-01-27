/**
 * Admin Products Management
 * Description: Product CRUD operations with comprehensive validation
 */

// ===========================
//  DOM ELEMENTS
// ===========================
var productsBody = document.getElementById("products-body");
var categorySelect = document.getElementById("product-category");
var addProductBtn = document.getElementById("add-product-btn");
var productForm = document.getElementById("product-form");
var cancelBtn = document.getElementById("cancel-btn");

var editingProductId = null;

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  loadCategories(function() {
    renderCategoryOptions();
    loadProducts(function() {
      renderProducts();
    });
  });
}

// ===========================
//  RENDER FUNCTIONS
// ===========================

/**
 * Render category options in dropdown
 */
function renderCategoryOptions() {
  var categories = getCategories();
  categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
  for (var i = 0; i < categories.length; i++) {
    var option = document.createElement("option");
    option.value = categories[i].id;
    option.textContent = categories[i].name;
    categorySelect.appendChild(option);
  }
}

/**
 * Render products table
 */
function renderProducts() {
  var allProducts = getProducts();
  var allCategories = getCategories();
  productsBody.innerHTML = "";

  if (allProducts.length === 0) {
    productsBody.innerHTML = '<tr><td colspan="8" style="text-align:center">No products yet. Add your first product!</td></tr>';
    return;
  }

  for (var i = 0; i < allProducts.length; i++) {
    var product = allProducts[i];

    // Find category name
    var catName = "Unknown";
    for (var j = 0; j < allCategories.length; j++) {
      if (allCategories[j].id === product.categoryId) {
        catName = allCategories[j].name;
        break;
      }
    }

    // Stock status styling
    var stockClass = "";
    var stockText = product.stock;
    if (product.stock === 0) {
      stockClass = 'style="color: red; font-weight: bold;"';
      stockText = "Out of Stock";
    } else if (product.stock < 5) {
      stockClass = 'style="color: orange; font-weight: bold;"';
      stockText = product.stock + " (Low)";
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + product.id.substring(0, 6) + "...</td>" +
      "<td>" + product.name + "</td>" +
      '<td><img src="' + product.image + '" width="50" onerror="this.src=\'https://via.placeholder.com/50\'"></td>' +
      "<td>" + (product.description.length > 30 ? product.description.substring(0, 30) + "..." : product.description) + "</td>" +
      "<td>$" + product.price.toFixed(2) + "</td>" +
      "<td " + stockClass + ">" + stockText + "</td>" +
      "<td>" + catName + "</td>" +
      "<td>" +
        '<button class="edit-btn" onclick="editProduct(\'' + product.id + '\')">Edit</button>' +
        '<button class="delete-btn" onclick="handleDeleteProduct(\'' + product.id + '\')">Delete</button>' +
      "</td>";
    productsBody.appendChild(tr);
  }
}

// ===========================
//  VALIDATION HELPERS
// ===========================

/**
 * Clear all error messages
 */
function clearErrors() {
  var errorIds = ["name-error", "image-error", "description-error", "price-error", "stock-error", "category-error"];
  for (var i = 0; i < errorIds.length; i++) {
    var el = document.getElementById(errorIds[i]);
    if (el) el.textContent = "";
  }
}

/**
 * Show error message
 */
function showFieldError(fieldId, message) {
  var el = document.getElementById(fieldId);
  if (el) {
    el.textContent = message;
    el.style.color = "#dc3545";
  }
}

/**
 * Validate form fields locally for immediate feedback
 */
function validateFormFields() {
  var name = productForm.elements["name"].value;
  var price = productForm.elements["price"].value;
  var stock = productForm.elements["stock"].value;
  var description = productForm.elements["description"].value;
  var categoryId = productForm.elements["category"].value;
  
  var isValid = true;
  clearErrors();

  // Name validation
  if (!name || name.trim() === "") {
    showFieldError("name-error", "Product name is required");
    isValid = false;
  } else if (name.trim().length < 3) {
    showFieldError("name-error", "Name must be at least 3 characters");
    isValid = false;
  } else if (name.trim().length > 50) {
    showFieldError("name-error", "Name cannot exceed 50 characters");
    isValid = false;
  }

  // Price validation
  if (price === "" || price === null) {
    showFieldError("price-error", "Price is required");
    isValid = false;
  } else {
    var priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      showFieldError("price-error", "Price must be a valid number");
      isValid = false;
    } else if (priceNum < 0) {
      showFieldError("price-error", "Price cannot be negative");
      isValid = false;
    } else if (priceNum === 0) {
      showFieldError("price-error", "Price must be greater than 0");
      isValid = false;
    }
  }

  // Stock validation
  if (stock === "" || stock === null) {
    showFieldError("stock-error", "Stock quantity is required");
    isValid = false;
  } else {
    var stockNum = parseInt(stock);
    if (isNaN(stockNum)) {
      showFieldError("stock-error", "Stock must be a whole number");
      isValid = false;
    } else if (stockNum < 0) {
      showFieldError("stock-error", "Stock cannot be negative");
      isValid = false;
    }
  }

  // Category validation
  if (!categoryId || categoryId === "") {
    showFieldError("category-error", "Please select a category");
    isValid = false;
  }

  // Description validation
  if (!description || description.trim() === "") {
    showFieldError("description-error", "Description is required");
    isValid = false;
  } else if (description.trim().length < 10) {
    showFieldError("description-error", "Description must be at least 10 characters");
    isValid = false;
  }

  return isValid;
}

// ===========================
//  CRUD OPERATIONS
// ===========================

/**
 * Delete product
 */
function handleDeleteProduct(productId) {
  var ok = confirm("Are you sure you want to delete this product?");
  if (!ok) return;

  deleteProduct(productId, function() {
    renderProducts();
    alert("Product deleted successfully!");
  });
}

/**
 * Edit product - fill form with data
 */
function editProduct(productId) {
  var products = getProducts();
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      product = products[i];
      break;
    }
  }
  if (!product) return;

  productForm.classList.add("show");
  productForm.elements["name"].value = product.name;
  productForm.elements["image"].value = product.image || "";
  productForm.elements["description"].value = product.description || "";
  productForm.elements["price"].value = product.price;
  productForm.elements["stock"].value = product.stock;
  productForm.elements["category"].value = product.categoryId;

  editingProductId = productId;
  productForm.querySelector("button[type='submit']").textContent = "Update Product";
  addProductBtn.innerHTML = '<i class="fa-solid fa-minus"></i> Close Form';
  document.getElementById("formTitle").textContent = "Edit Product";
  
  clearErrors();
}

/**
 * Toggle form visibility
 */
addProductBtn.addEventListener("click", function() {
  if (!productForm.classList.contains("show")) {
    productForm.classList.add("show");
    addProductBtn.innerHTML = '<i class="fa-solid fa-minus"></i> Close Form';
    document.getElementById("formTitle").textContent = "Add New Product";
    clearErrors();
  } else {
    productForm.classList.remove("show");
    addProductBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
    resetForm();
  }
});

/**
 * Form submit - add or update product
 */
productForm.addEventListener("submit", function(e) {
  e.preventDefault();

  // Validate first
  if (!validateFormFields()) {
    return;
  }

  var productData = {
    name: productForm.elements["name"].value,
    image: productForm.elements["image"].value || "https://via.placeholder.com/150",
    description: productForm.elements["description"].value,
    price: productForm.elements["price"].value,
    stock: productForm.elements["stock"].value,
    categoryId: productForm.elements["category"].value
  };

  if (editingProductId === null) {
    // Add new product
    var errors = addProduct(productData, function() {
      renderProducts();
      resetForm();
      productForm.classList.remove("show");
      addProductBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
      alert("Product added successfully!");
    });

    // Show errors if any returned from storage validation
    if (errors) {
      if (errors.name) showFieldError("name-error", errors.name);
      if (errors.price) showFieldError("price-error", errors.price);
      if (errors.stock) showFieldError("stock-error", errors.stock);
      if (errors.category) showFieldError("category-error", errors.category);
      if (errors.description) showFieldError("description-error", errors.description);
    }
  } else {
    // Update existing product
    var errors = updateProduct(editingProductId, productData, function() {
      renderProducts();
      resetForm();
      productForm.classList.remove("show");
      addProductBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
      alert("Product updated successfully!");
    });

    if (errors) {
      if (errors.name) showFieldError("name-error", errors.name);
      if (errors.price) showFieldError("price-error", errors.price);
      if (errors.stock) showFieldError("stock-error", errors.stock);
      if (errors.category) showFieldError("category-error", errors.category);
      if (errors.description) showFieldError("description-error", errors.description);
    }
  }
});

/**
 * Cancel button
 */
cancelBtn.addEventListener("click", function() {
  resetForm();
  productForm.classList.remove("show");
  addProductBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
});

/**
 * Reset form to initial state
 */
function resetForm() {
  productForm.reset();
  editingProductId = null;
  productForm.querySelector("button[type='submit']").textContent = "Add";
  clearErrors();
}

// ===========================
//  REAL-TIME VALIDATION
// ===========================

// Validate name on blur
// Real-time validation
function addRealTimeValidation(elementName, validator) {
  var el = productForm.elements[elementName];
  if (el) {
    el.addEventListener("input", function() {
      validator(this);
    });
    // For select elements
    el.addEventListener("change", function() {
      validator(this);
    });
  }
}

// Validation logic for individual fields
function validateNameField(input) {
  var value = input.value;
  if (!value || value.trim() === "") {
    showFieldError("name-error", "Product name is required");
  } else if (value.trim().length < 3) {
    showFieldError("name-error", "Name must be at least 3 characters");
  } else if (value.trim().length > 50) {
    showFieldError("name-error", "Name cannot exceed 50 characters");
  } else {
    document.getElementById("name-error").textContent = "";
  }
}

function validatePriceField(input) {
  var value = input.value;
  if (value === "") {
    showFieldError("price-error", "Price is required");
  } else {
    var num = parseFloat(value);
    if (isNaN(num)) {
      showFieldError("price-error", "Price must be a valid number");
    } else if (num < 0) {
      showFieldError("price-error", "Price cannot be negative");
    } else if (num === 0) {
      showFieldError("price-error", "Price must be greater than 0");
    } else {
      document.getElementById("price-error").textContent = "";
    }
  }
}

function validateStockField(input) {
  var value = input.value;
  if (value === "") {
    showFieldError("stock-error", "Stock quantity is required");
  } else {
    var num = parseInt(value);
    if (isNaN(num)) {
      showFieldError("stock-error", "Stock must be a whole number");
    } else if (num < 0) {
      showFieldError("stock-error", "Stock cannot be negative");
    } else {
      document.getElementById("stock-error").textContent = "";
    }
  }
}

function validateCategoryField(input) {
  if (!input.value || input.value === "") {
    showFieldError("category-error", "Please select a category");
  } else {
    document.getElementById("category-error").textContent = "";
  }
}

function validateDescriptionField(input) {
  var value = input.value;
  if (!value || value.trim() === "") {
    showFieldError("description-error", "Description is required");
  } else if (value.trim().length < 10) {
    showFieldError("description-error", "Description must be at least 10 characters");
  } else {
    document.getElementById("description-error").textContent = "";
  }
}

// Attach listeners
addRealTimeValidation("name", validateNameField);
addRealTimeValidation("price", validatePriceField);
addRealTimeValidation("stock", validateStockField);
addRealTimeValidation("category", validateCategoryField);
addRealTimeValidation("description", validateDescriptionField);

// Start the app
init();
