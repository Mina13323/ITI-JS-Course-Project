/**
 * Customer Products Page
 * Description: Product browsing with stock validation and cart functionality
 */

// ===========================
//  FIREBASE CONFIGURATION
// ===========================
// ===========================
//  FIREBASE CONFIGURATION
// ===========================
var firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig) {
  console.error("Firebase config not found! Make sure shared/env.js is loaded.");
}

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// ===========================
//  DATA
// ===========================
var products = [];
var categories = [];

// ===========================
//  DOM ELEMENTS
// ===========================
var productsGrid = document.getElementById("productsGrid");
var categoryFilter = document.getElementById("categoryFilter");
var minPriceInput = document.getElementById("minPrice");
var maxPriceInput = document.getElementById("maxPrice");
var wishlistCount = document.getElementById("wishlistCount");

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  loadCategories();
}

/**
 * Load categories from Firebase
 */
function loadCategories() {
  db.collection("categories")
    .get()
    .then(function(snapshot) {
      categories = [];
      snapshot.forEach(function(doc) {
        categories.push({ id: doc.id, name: doc.data().name });
      });
      renderCategoryOptions();
      loadProducts();
    })
    .catch(function(error) {
      console.error("Error loading categories:", error);
      loadProducts();
    });
}

/**
 * Load products from Firebase
 */
function loadProducts() {
  db.collection("products")
    .get()
    .then(function(snapshot) {
      products = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          image: data.image,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categoryId: data.categoryId,
        });
      });
      // Also sync to localStorage for cart reference
      localStorage.setItem("products", JSON.stringify(products));
      renderProducts(products);
    })
    .catch(function(error) {
      console.error("Error loading products:", error);
      productsGrid.innerHTML = '<div class="empty-state">Error loading products. Please try again.</div>';
    });
}

// ===========================
//  RENDER FUNCTIONS
// ===========================

/**
 * Render category filter options
 */
function renderCategoryOptions() {
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  for (var i = 0; i < categories.length; i++) {
    var option = document.createElement("option");
    option.value = categories[i].id;
    option.textContent = categories[i].name;
    categoryFilter.appendChild(option);
  }
}

/**
 * Render products grid
 */
function renderProducts(productList) {
  productsGrid.innerHTML = "";
  
  var countEl = document.getElementById("productCount");
  if (countEl) {
    countEl.textContent = productList.length;
  }

  if (productList.length === 0) {
    productsGrid.innerHTML = '<div class="empty-state">No products found matching your criteria.</div>';
    return;
  }

  for (var i = 0; i < productList.length; i++) {
    var product = productList[i];
    var inWishlist = isInWishlist(product.id);
    var isOutOfStock = product.stock <= 0;

    var card = document.createElement("article");
    card.className = "product-card";
    
    // Stock status badge
    var stockBadge = "";
    var stockClass = "";
    if (isOutOfStock) {
      stockBadge = '<span class="badge badge-rejected">Out of Stock</span>';
      stockClass = 'style="opacity: 0.6; filter: grayscale(1);"';
    } else if (product.stock < 5) {
      stockBadge = '<span class="badge badge-pending">Only ' + product.stock + ' left!</span>';
    } else {
      stockBadge = '<span class="text-muted">' + product.stock + ' in stock</span>';
    }

    // Cart button
    var cartButton = "";
    if (isOutOfStock) {
      cartButton = '<button class="btn btn-secondary btn-block mb-2" disabled>Out of Stock</button>';
    } else {
      cartButton = '<button class="btn btn-primary btn-block mb-2" onclick="addToCart(\'' + product.id + '\')"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>';
    }

    card.innerHTML =
      '<div style="position:relative;">' + 
        '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.src=\'https://via.placeholder.com/300x200\'" ' + stockClass + '>' +
        '<button class="wishlist-btn ' + (inWishlist ? 'active' : '') + '" onclick="toggleWishlistBtn(\'' + product.id + '\', this)" style="position:absolute;top:10px;right:10px;border:none;background:white;width:35px;height:35px;border-radius:50%;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:' + (inWishlist ? '#ef4444' : '#ccc') + ';">' +
          '<i class="' + (inWishlist ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i>' +
        '</button>' +
      '</div>' +
      '<div class="product-body">' +
        '<div class="flex-between mb-1">' +
          '<h3 style="margin:0;">' + product.name + '</h3>' +
          '<span class="price">$' + product.price.toFixed(2) + '</span>' +
        '</div>' +
        '<p class="description mb-2">' + (product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description) + '</p>' +
        '<div class="mb-3">' +
          stockBadge +
        '</div>' +
        cartButton +
        '<button class="btn btn-outline btn-block" onclick="viewProduct(\'' + product.id + '\')"><i class="fa-solid fa-eye"></i> View Details</button>' +
      '</div>';

    productsGrid.appendChild(card);
  }
}

// ===========================
//  WISHLIST FUNCTIONS
// ===========================

/**
 * Get wishlist from localStorage
 */
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

/**
 * Check if product is in wishlist
 */
function isInWishlist(productId) {
  var wishlist = getWishlist();
  for (var i = 0; i < wishlist.length; i++) {
    if (wishlist[i] === productId) return true;
  }
  return false;
}

/**
 * Toggle wishlist
 */
function toggleWishlist(productId) {
  var wishlist = getWishlist();
  var index = -1;
  for (var i = 0; i < wishlist.length; i++) {
    if (wishlist[i] === productId) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

/**
 * Toggle wishlist button
 */
function toggleWishlistBtn(productId, btn) {
  toggleWishlist(productId);
  var inWishlist = isInWishlist(productId);
  btn.classList.toggle("active", inWishlist);
  btn.style.color = inWishlist ? '#ef4444' : '#ccc';
  btn.innerHTML = '<i class="' + (inWishlist ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i>';
}

/**
 * Update wishlist count
 */
function updateWishlistCount() {
  if (wishlistCount) {
    wishlistCount.textContent = getWishlist().length;
  }
}

// ===========================
//  CART FUNCTIONS
// ===========================

/**
 * Get cart from localStorage
 */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/**
 * Check if product can be added to cart (stock validation)
 */
function canAddToCart(productId) {
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      product = products[i];
      break;
    }
  }

  if (!product) {
    return { valid: false, error: "Product not found" };
  }

  if (product.stock <= 0) {
    return { valid: false, error: "This product is out of stock" };
  }

  // Check if adding would exceed stock
  var cart = getCart();
  var currentQuantity = 0;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      currentQuantity = cart[i].quantity;
      break;
    }
  }

  if (currentQuantity + 1 > product.stock) {
    return { valid: false, error: "Cannot add more. Only " + product.stock + " available in stock." };
  }

  return { valid: true, error: "" };
}

/**
 * Add to cart with validation
 */
function addToCart(productId) {
  // Check if user is logged in
  var currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    if (confirm("Please login to add items to cart. Go to login page?")) {
      window.location.href = "../auth/login-register.html";
    }
    return;
  }

  // Validate stock
  var validation = canAddToCart(productId);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Add to cart
  var cart = getCart();
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      cart[i].quantity += 1;
      found = true;
      break;
    }
  }
  if (!found) {
    cart.push({ productId: productId, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateNavCartCount();
  alert("Product added to cart!");
}

/**
 * View product details
 */
function viewProduct(productId) {
  window.location.href = "product-detail.html?id=" + productId;
}

// ===========================
//  FILTER FUNCTIONS
// ===========================

/**
 * Apply filters
 */
function applyFilters() {
  var categoryValue = categoryFilter.value;
  var minValue = parseFloat(minPriceInput.value);
  var maxValue = parseFloat(maxPriceInput.value);

  // Validate price inputs
  if (minPriceInput.value !== "" && (isNaN(minValue) || minValue < 0)) {
    minPriceInput.value = "";
    minValue = NaN;
  }
  if (maxPriceInput.value !== "" && (isNaN(maxValue) || maxValue < 0)) {
    maxPriceInput.value = "";
    maxValue = NaN;
  }

  // Check min > max
  if (!isNaN(minValue) && !isNaN(maxValue) && minValue > maxValue) {
    alert("Minimum price cannot be greater than maximum price");
    return;
  }

  var filtered = [];
  for (var i = 0; i < products.length; i++) {
    var product = products[i];
    var pass = true;

    if (categoryValue && product.categoryId !== categoryValue) {
      pass = false;
    }
    if (!isNaN(minValue) && product.price < minValue) {
      pass = false;
    }
    if (!isNaN(maxValue) && product.price > maxValue) {
      pass = false;
    }

    if (pass) {
      filtered.push(product);
    }
  }

  renderProducts(filtered);
}

// ===========================
//  EVENT LISTENERS
// ===========================

// Filter event listeners
categoryFilter.addEventListener("change", applyFilters);
minPriceInput.addEventListener("input", applyFilters);
maxPriceInput.addEventListener("input", applyFilters);

// Logout
var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
  });
}

// Start
// Start
updateWishlistCount();
checkAuthState();
updateNavCartCount();
init();

function checkAuthState() {
  var currentUser = localStorage.getItem("currentUser");
  var authLinks = document.querySelectorAll(".auth-required");
  var loginLink = document.getElementById("loginLink");
  var logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    // User is logged in
    for (var i = 0; i < authLinks.length; i++) {
      authLinks[i].style.display = "inline-flex";
    }
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
  } else {
    // User is not logged in
    for (var i = 0; i < authLinks.length; i++) {
      authLinks[i].style.display = "none";
    }
    if (loginLink) loginLink.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

function updateNavCartCount() {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += cart[i].quantity;
  }
  var badge = document.getElementById("navCartCount");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }
  // Also update floating badge if exists
  var floatBadge = document.getElementById("cartBadge");
  if (floatBadge) floatBadge.textContent = count;
}
