/**
 * Validation Module
 * Description: Centralized validation functions for the e-commerce application
 * Handles all input validation with clear error messages
 */

// ===========================
//  REGEX PATTERNS
// ===========================
var REGEX = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  password: /^.{6,}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  price: /^\d+(\.\d{1,2})?$/,
  url: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i,
  positiveInteger: /^\d+$/
};

// ===========================
//  ERROR MESSAGES
// ===========================
var ERRORS = {
  // User errors
  nameRequired: "Name is required",
  nameInvalid: "Name must be 2-50 letters only",
  emailRequired: "Email is required",
  emailInvalid: "Please enter a valid email address",
  emailExists: "This email is already registered",
  passwordRequired: "Password is required",
  passwordWeak: "Password must be at least 6 characters",
  passwordMismatch: "Passwords do not match",
  
  // Product errors
  productNameRequired: "Product name is required",
  productNameShort: "Product name must be at least 3 characters",
  productNameLong: "Product name cannot exceed 50 characters",
  priceRequired: "Price is required",
  priceInvalid: "Price must be a positive number",
  priceNegative: "Price cannot be negative",
  stockRequired: "Stock quantity is required",
  stockInvalid: "Stock must be a whole number",
  stockNegative: "Stock cannot be negative",
  categoryRequired: "Please select a category",
  descriptionRequired: "Description is required",
  descriptionShort: "Description must be at least 10 characters",
  imageInvalid: "Please enter a valid image URL",
  
  // Category errors
  categoryNameRequired: "Category name is required",
  categoryNameShort: "Category name must be at least 3 characters",
  categoryNameLong: "Category name cannot exceed 30 characters",
  categoryExists: "This category already exists",
  
  // Cart errors
  cartEmpty: "Your cart is empty",
  quantityInvalid: "Quantity must be a positive number",
  quantityExceedsStock: "Requested quantity exceeds available stock",
  outOfStock: "This product is out of stock",
  
  // Review errors
  ratingRequired: "Please select a rating",
  reviewRequired: "Please write your review",
  reviewShort: "Review must be at least 10 characters",
  reviewLong: "Review cannot exceed 500 characters",
  alreadyReviewed: "You have already reviewed this product",
  
  // Order errors
  loginRequired: "Please login to continue",
  orderEmpty: "Cannot place an empty order",
  
  // Return errors
  reasonRequired: "Please select a return reason",
  returnPeriodExpired: "Return period has expired (14 days)"
};

// ===========================
//  USER VALIDATION
// ===========================

/**
 * Validate user name
 * @param {string} name - User's name
 * @returns {object} - {valid: boolean, error: string}
 */
function validateName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: ERRORS.nameRequired };
  }
  name = name.trim();
  if (name.length < 2) {
    return { valid: false, error: ERRORS.nameInvalid };
  }
  if (name.length > 50) {
    return { valid: false, error: ERRORS.nameInvalid };
  }
  if (!REGEX.name.test(name)) {
    return { valid: false, error: ERRORS.nameInvalid };
  }
  return { valid: true, error: "" };
}

/**
 * Validate email
 * @param {string} email - User's email
 * @returns {object} - {valid: boolean, error: string}
 */
function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { valid: false, error: ERRORS.emailRequired };
  }
  email = email.trim();
  if (!REGEX.email.test(email)) {
    return { valid: false, error: ERRORS.emailInvalid };
  }
  return { valid: true, error: "" };
}

/**
 * Validate password
 * @param {string} password - User's password
 * @returns {object} - {valid: boolean, error: string}
 */
function validatePassword(password) {
  if (!password || password === "") {
    return { valid: false, error: ERRORS.passwordRequired };
  }
  if (password.length < 6) {
    return { valid: false, error: ERRORS.passwordWeak };
  }
  return { valid: true, error: "" };
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - {valid: boolean, error: string}
 */
function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { valid: false, error: ERRORS.passwordMismatch };
  }
  return { valid: true, error: "" };
}

/**
 * Validate complete user registration data
 * @param {object} userData - {name, email, password}
 * @returns {object} - {valid: boolean, errors: object}
 */
function validateUserRegistration(userData) {
  var errors = {};
  var valid = true;

  var nameResult = validateName(userData.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error;
    valid = false;
  }

  var emailResult = validateEmail(userData.email);
  if (!emailResult.valid) {
    errors.email = emailResult.error;
    valid = false;
  }

  var passwordResult = validatePassword(userData.password);
  if (!passwordResult.valid) {
    errors.password = passwordResult.error;
    valid = false;
  }

  return { valid: valid, errors: errors };
}

// ===========================
//  PRODUCT VALIDATION
// ===========================

/**
 * Validate product name
 * @param {string} name - Product name
 * @returns {object} - {valid: boolean, error: string}
 */
function validateProductName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: ERRORS.productNameRequired };
  }
  name = name.trim();
  if (name.length < 3) {
    return { valid: false, error: ERRORS.productNameShort };
  }
  if (name.length > 50) {
    return { valid: false, error: ERRORS.productNameLong };
  }
  return { valid: true, error: "" };
}

/**
 * Validate price
 * @param {number|string} price - Product price
 * @returns {object} - {valid: boolean, error: string}
 */
function validatePrice(price) {
  if (price === "" || price === null || price === undefined) {
    return { valid: false, error: ERRORS.priceRequired };
  }
  var priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return { valid: false, error: ERRORS.priceInvalid };
  }
  if (priceNum < 0) {
    return { valid: false, error: ERRORS.priceNegative };
  }
  if (priceNum === 0) {
    return { valid: false, error: ERRORS.priceInvalid };
  }
  return { valid: true, error: "" };
}

/**
 * Validate stock quantity
 * @param {number|string} stock - Stock quantity
 * @returns {object} - {valid: boolean, error: string}
 */
function validateStock(stock) {
  if (stock === "" || stock === null || stock === undefined) {
    return { valid: false, error: ERRORS.stockRequired };
  }
  var stockNum = parseInt(stock);
  if (isNaN(stockNum)) {
    return { valid: false, error: ERRORS.stockInvalid };
  }
  if (stockNum < 0) {
    return { valid: false, error: ERRORS.stockNegative };
  }
  return { valid: true, error: "" };
}

/**
 * Validate product description
 * @param {string} description - Product description
 * @returns {object} - {valid: boolean, error: string}
 */
function validateDescription(description) {
  if (!description || description.trim() === "") {
    return { valid: false, error: ERRORS.descriptionRequired };
  }
  if (description.trim().length < 10) {
    return { valid: false, error: ERRORS.descriptionShort };
  }
  return { valid: true, error: "" };
}

/**
 * Validate image URL
 * @param {string} url - Image URL
 * @returns {object} - {valid: boolean, error: string}
 */
function validateImageUrl(url) {
  if (!url || url.trim() === "") {
    // Image is optional, use placeholder
    return { valid: true, error: "" };
  }
  if (!REGEX.url.test(url.trim())) {
    return { valid: false, error: ERRORS.imageInvalid };
  }
  return { valid: true, error: "" };
}

/**
 * Validate category selection
 * @param {string} categoryId - Selected category ID
 * @returns {object} - {valid: boolean, error: string}
 */
function validateCategory(categoryId) {
  if (!categoryId || categoryId === "") {
    return { valid: false, error: ERRORS.categoryRequired };
  }
  return { valid: true, error: "" };
}

/**
 * Validate complete product data
 * @param {object} productData - Product object
 * @returns {object} - {valid: boolean, errors: object}
 */
function validateProduct(productData) {
  var errors = {};
  var valid = true;

  var nameResult = validateProductName(productData.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error;
    valid = false;
  }

  var priceResult = validatePrice(productData.price);
  if (!priceResult.valid) {
    errors.price = priceResult.error;
    valid = false;
  }

  var stockResult = validateStock(productData.stock);
  if (!stockResult.valid) {
    errors.stock = stockResult.error;
    valid = false;
  }

  var categoryResult = validateCategory(productData.categoryId);
  if (!categoryResult.valid) {
    errors.category = categoryResult.error;
    valid = false;
  }

  var descResult = validateDescription(productData.description);
  if (!descResult.valid) {
    errors.description = descResult.error;
    valid = false;
  }

  var imageResult = validateImageUrl(productData.image);
  if (!imageResult.valid) {
    errors.image = imageResult.error;
    valid = false;
  }

  return { valid: valid, errors: errors };
}

// ===========================
//  CATEGORY VALIDATION
// ===========================

/**
 * Validate category name
 * @param {string} name - Category name
 * @returns {object} - {valid: boolean, error: string}
 */
function validateCategoryName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: ERRORS.categoryNameRequired };
  }
  name = name.trim();
  if (name.length < 3) {
    return { valid: false, error: ERRORS.categoryNameShort };
  }
  if (name.length > 30) {
    return { valid: false, error: ERRORS.categoryNameLong };
  }
  return { valid: true, error: "" };
}

/**
 * Check if category name already exists
 * @param {string} name - Category name to check
 * @param {array} existingCategories - Array of existing categories
 * @param {string} excludeId - ID to exclude (for editing)
 * @returns {object} - {valid: boolean, error: string}
 */
function validateCategoryUnique(name, existingCategories, excludeId) {
  for (var i = 0; i < existingCategories.length; i++) {
    var cat = existingCategories[i];
    if (cat.name.toLowerCase() === name.toLowerCase().trim()) {
      if (excludeId && cat.id === excludeId) {
        continue; // Skip if editing the same category
      }
      return { valid: false, error: ERRORS.categoryExists };
    }
  }
  return { valid: true, error: "" };
}

// ===========================
//  CART / ORDER VALIDATION
// ===========================

/**
 * Validate quantity input
 * @param {number|string} quantity - Quantity value
 * @param {number} maxStock - Maximum available stock
 * @returns {object} - {valid: boolean, error: string}
 */
function validateQuantity(quantity, maxStock) {
  var qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1) {
    return { valid: false, error: ERRORS.quantityInvalid };
  }
  if (maxStock !== undefined && qty > maxStock) {
    return { valid: false, error: ERRORS.quantityExceedsStock + " (Available: " + maxStock + ")" };
  }
  return { valid: true, error: "" };
}

/**
 * Check if product is in stock
 * @param {number} stock - Available stock
 * @returns {object} - {valid: boolean, error: string}
 */
function validateInStock(stock) {
  if (stock <= 0) {
    return { valid: false, error: ERRORS.outOfStock };
  }
  return { valid: true, error: "" };
}

/**
 * Validate cart before checkout
 * @param {array} cartItems - Array of cart items
 * @param {array} products - Array of products with stock info
 * @returns {object} - {valid: boolean, errors: array}
 */
function validateCartForCheckout(cartItems, products) {
  var errors = [];
  
  if (!cartItems || cartItems.length === 0) {
    return { valid: false, errors: [ERRORS.cartEmpty] };
  }

  for (var i = 0; i < cartItems.length; i++) {
    var item = cartItems[i];
    var product = null;
    
    // Find the product
    for (var j = 0; j < products.length; j++) {
      if (products[j].id === item.productId) {
        product = products[j];
        break;
      }
    }

    if (!product) {
      errors.push("Product not found: " + item.productId);
      continue;
    }

    if (product.stock < item.quantity) {
      errors.push(product.name + ": Only " + product.stock + " available (requested: " + item.quantity + ")");
    }
  }

  return { valid: errors.length === 0, errors: errors };
}

// ===========================
//  REVIEW VALIDATION
// ===========================

/**
 * Validate review rating
 * @param {number} rating - Rating value (1-5)
 * @returns {object} - {valid: boolean, error: string}
 */
function validateRating(rating) {
  if (!rating || rating === 0) {
    return { valid: false, error: ERRORS.ratingRequired };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, error: "Rating must be between 1 and 5" };
  }
  return { valid: true, error: "" };
}

/**
 * Validate review text
 * @param {string} text - Review text
 * @returns {object} - {valid: boolean, error: string}
 */
function validateReviewText(text) {
  if (!text || text.trim() === "") {
    return { valid: false, error: ERRORS.reviewRequired };
  }
  text = text.trim();
  if (text.length < 10) {
    return { valid: false, error: ERRORS.reviewShort };
  }
  if (text.length > 500) {
    return { valid: false, error: ERRORS.reviewLong };
  }
  return { valid: true, error: "" };
}

/**
 * Validate complete review
 * @param {object} reviewData - {rating, text}
 * @returns {object} - {valid: boolean, errors: object}
 */
function validateReview(reviewData) {
  var errors = {};
  var valid = true;

  var ratingResult = validateRating(reviewData.rating);
  if (!ratingResult.valid) {
    errors.rating = ratingResult.error;
    valid = false;
  }

  var textResult = validateReviewText(reviewData.text);
  if (!textResult.valid) {
    errors.text = textResult.error;
    valid = false;
  }

  return { valid: valid, errors: errors };
}

// ===========================
//  RETURN VALIDATION
// ===========================

/**
 * Validate return reason
 * @param {string} reason - Return reason
 * @returns {object} - {valid: boolean, error: string}
 */
function validateReturnReason(reason) {
  if (!reason || reason === "") {
    return { valid: false, error: ERRORS.reasonRequired };
  }
  return { valid: true, error: "" };
}

/**
 * Check if order is within return period
 * @param {string} orderDate - Order date ISO string
 * @param {number} days - Return period in days (default 14)
 * @returns {object} - {valid: boolean, error: string}
 */
function validateReturnPeriod(orderDate, days) {
  if (!days) days = 14;
  
  var order = new Date(orderDate);
  var now = new Date();
  var diffTime = now - order;
  var diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays > days) {
    return { valid: false, error: ERRORS.returnPeriodExpired };
  }
  return { valid: true, error: "" };
}

// ===========================
//  UTILITY FUNCTIONS
// ===========================

/**
 * Show error message in a specific element
 * @param {string} elementId - ID of error element
 * @param {string} message - Error message
 */
function showError(elementId, message) {
  var element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.color = "#dc3545";
  }
}

/**
 * Clear error message
 * @param {string} elementId - ID of error element
 */
function clearError(elementId) {
  var element = document.getElementById(elementId);
  if (element) {
    element.textContent = "";
  }
}

/**
 * Clear all error messages in a form
 * @param {array} errorIds - Array of error element IDs
 */
function clearAllErrors(errorIds) {
  for (var i = 0; i < errorIds.length; i++) {
    clearError(errorIds[i]);
  }
}

/**
 * Check if user is logged in
 * @returns {object|null} - Current user or null
 */
function requireLogin() {
  var user = localStorage.getItem("currentUser");
  if (!user) {
    alert(ERRORS.loginRequired);
    window.location.href = "../auth/login-register.html";
    return null;
  }
  return JSON.parse(user);
}

console.log("Validation.js loaded successfully!");
