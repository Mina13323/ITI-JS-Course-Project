/**
 * Product Detail Page
 * Description: Product details, reviews, and cart functionality with validation
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
var urlParams = new URLSearchParams(window.location.search);
var productId = urlParams.get("id");
var selectedRating = 0;
var currentProduct = null;
var existingReviews = [];

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  if (!productId) {
    document.getElementById("productDetail").innerHTML = "<p>No product specified!</p>";
    return;
  }
  loadProduct();
}

/**
 * Load product from Firebase
 */
function loadProduct() {
  db.collection("products")
    .doc(productId)
    .get()
    .then(function(doc) {
      if (!doc.exists) {
        document.getElementById("productDetail").innerHTML = "<p>Product not found!</p>";
        return;
      }

      var product = doc.data();
      currentProduct = product;
      currentProduct.id = doc.id;

      renderProductDetail(product);
      loadReviews();
    })
    .catch(function(error) {
      console.error("Error loading product:", error);
      document.getElementById("productDetail").innerHTML = "<p>Error loading product. Please try again.</p>";
    });
}

/**
 * Render product details
 */
function renderProductDetail(product) {
  var isOutOfStock = product.stock <= 0;
  
  var stockStatus = "";
  if (isOutOfStock) {
    stockStatus = '<span style="color:red;font-weight:bold;">Out of Stock</span>';
  } else if (product.stock < 5) {
    stockStatus = '<span style="color:orange;font-weight:bold;">Only ' + product.stock + ' left!</span>';
  } else {
    stockStatus = '<span style="color:green;">' + product.stock + ' in stock</span>';
  }

  var cartButton = "";
  if (isOutOfStock) {
    cartButton = '<button class="add-to-cart-btn" style="background:#a0aec0;cursor:not-allowed;" disabled>Out of Stock</button>';
  } else {
    cartButton = '<button class="add-to-cart-btn" onclick="addToCart()">Add to Cart</button>';
  }

  document.getElementById("productDetail").innerHTML =
    '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.src=\'https://via.placeholder.com/400x300\'">' +
    '<div class="product-info">' +
      '<h1>' + product.name + '</h1>' +
      '<p class="price">$' + product.price.toFixed(2) + '</p>' +
      '<p class="description">' + product.description + '</p>' +
      '<p>' + stockStatus + '</p>' +
      cartButton +
    '</div>';
}

// ===========================
//  CART FUNCTIONS
// ===========================

/**
 * Add to cart with validation
 */
function addToCart() {
  var currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    if (confirm("Please login to add items to cart. Go to login page?")) {
      window.location.href = "../auth/login-register.html";
    }
    return;
  }

  if (!currentProduct) {
    alert("Product not loaded");
    return;
  }

  // Check stock
  if (currentProduct.stock <= 0) {
    alert("This product is out of stock");
    return;
  }

  // Check cart quantity
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var currentQuantity = 0;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      currentQuantity = cart[i].quantity;
      break;
    }
  }

  if (currentQuantity + 1 > currentProduct.stock) {
    alert("Cannot add more. Only " + currentProduct.stock + " available in stock.");
    return;
  }

  // Add to cart
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
  alert("Product added to cart!");
}

// ===========================
//  REVIEW FUNCTIONS
// ===========================

/**
 * Load reviews from Firebase
 */
function loadReviews() {
  db.collection("reviews")
    .where("productId", "==", productId)
    .get()
    .then(function(snapshot) {
      existingReviews = [];
      snapshot.forEach(function(doc) {
        existingReviews.push(doc.data());
      });
      displayAverageRating(existingReviews);
      displayReviews(existingReviews);
      checkUserReview();
    })
    .catch(function(error) {
      console.error("Error loading reviews:", error);
    });
}

/**
 * Display average rating
 */
function displayAverageRating(reviews) {
  var container = document.getElementById("averageRating");
  
  if (reviews.length === 0) {
    container.innerHTML = "<p>No ratings yet. Be the first to review!</p>";
    return;
  }

  var total = 0;
  for (var i = 0; i < reviews.length; i++) {
    total += reviews[i].rating;
  }
  var average = total / reviews.length;

  var stars = "";
  for (var i = 0; i < 5; i++) {
    if (i < Math.round(average)) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }

  container.innerHTML =
    '<span class="big-number">' + average.toFixed(1) + '</span>' +
    '<div><div class="stars">' + stars + '</div>' +
    '<span>' + reviews.length + ' review(s)</span></div>';
}

/**
 * Display reviews list
 */
function displayReviews(reviews) {
  var container = document.getElementById("reviewsList");
  
  if (reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  // Sort by date (newest first)
  reviews.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var html = "";
  for (var i = 0; i < reviews.length; i++) {
    var review = reviews[i];
    var stars = "";
    for (var j = 0; j < 5; j++) {
      if (j < review.rating) {
        stars += '<i class="fa-solid fa-star"></i>';
      } else {
        stars += '<i class="fa-regular fa-star"></i>';
      }
    }
    
    var date = new Date(review.date).toLocaleDateString();
    
    html +=
      '<div class="review-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<strong>' + review.userName + '</strong>' +
          '<small style="color:#718096;">' + date + '</small>' +
        '</div>' +
        '<div class="review-stars">' + stars + '</div>' +
        '<p>' + review.text + '</p>' +
      '</div>';
  }
  container.innerHTML = html;
}

/**
 * Check if user already reviewed this product
 */
function checkUserReview() {
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    // Show message that login is required
    var form = document.querySelector(".review-form");
    if (form) {
      form.innerHTML = '<p style="text-align:center;padding:20px;"><a href="../auth/login-register.html">Login</a> to write a review</p>';
    }
    return;
  }

  // Check if user already reviewed
  for (var i = 0; i < existingReviews.length; i++) {
    if (existingReviews[i].userId === currentUser.id) {
      var form = document.querySelector(".review-form");
      if (form) {
        form.innerHTML = '<p style="text-align:center;padding:20px;color:#2f855a;"><i class="fa-solid fa-check"></i> You have already reviewed this product</p>';
      }
      return;
    }
  }
}

/**
 * Select rating
 */
function selectRating(rating) {
  selectedRating = rating;
  var stars = document.querySelectorAll("#starRating .star");
  for (var i = 0; i < stars.length; i++) {
    if (i < rating) {
      stars[i].classList.add("active");
    } else {
      stars[i].classList.remove("active");
    }
  }
}

/**
 * Validate review
 */
function validateReview(rating, text) {
  var errors = {};
  var valid = true;

  // Rating validation
  if (!rating || rating === 0) {
    errors.rating = "Please select a rating";
    valid = false;
  } else if (rating < 1 || rating > 5) {
    errors.rating = "Rating must be between 1 and 5";
    valid = false;
  }

  // Text validation
  if (!text || text.trim() === "") {
    errors.text = "Please write your review";
    valid = false;
  } else if (text.trim().length < 10) {
    errors.text = "Review must be at least 10 characters";
    valid = false;
  } else if (text.trim().length > 500) {
    errors.text = "Review cannot exceed 500 characters";
    valid = false;
  }

  return { valid: valid, errors: errors };
}

/**
 * Submit review
 */
function submitReview() {
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser) {
    alert("Please login to submit a review!");
    window.location.href = "../auth/login-register.html";
    return;
  }

  var reviewText = document.getElementById("reviewText").value;

  // Validate
  var validation = validateReview(selectedRating, reviewText);
  if (!validation.valid) {
    var errorMessage = "";
    if (validation.errors.rating) errorMessage += validation.errors.rating + "\n";
    if (validation.errors.text) errorMessage += validation.errors.text;
    alert(errorMessage);
    return;
  }

  // Check for existing review
  for (var i = 0; i < existingReviews.length; i++) {
    if (existingReviews[i].userId === currentUser.id) {
      alert("You have already reviewed this product");
      return;
    }
  }

  var userName = currentUser.name || currentUser.email || "Anonymous";

  var review = {
    productId: productId,
    userId: currentUser.id || "unknown",
    userName: userName,
    rating: selectedRating,
    text: reviewText.trim(),
    date: new Date().toISOString(),
  };

  // Save to Firebase
  db.collection("reviews")
    .add(review)
    .then(function() {
      // Reset form
      selectedRating = 0;
      document.getElementById("reviewText").value = "";
      var stars = document.querySelectorAll("#starRating .star");
      for (var i = 0; i < stars.length; i++) {
        stars[i].classList.remove("active");
      }
      
      loadReviews();
      alert("Thank you for your review!");
    })
    .catch(function(error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    });
}

// ===========================
//  EVENT LISTENERS
// ===========================

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
init();
