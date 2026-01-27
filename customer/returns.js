/**
 * Customer Returns Page
 * Description: View and track return requests with validation
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
var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var allReturns = [];
var products = [];
var currentFilter = "all";

// Return period in days
var RETURN_PERIOD_DAYS = 14;

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  if (!currentUser) {
    alert("Please login");
    window.location.href = "../auth/login-register.html";
    return;
  }
  loadData();
}

/**
 * Load data from Firebase
 */
function loadData() {
  db.collection("products")
    .get()
    .then(function(snapshot) {
      products = [];
      snapshot.forEach(function(doc) {
        products.push({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
        });
      });
      return db.collection("returns")
        .where("userId", "==", currentUser.id)
        .get();
    })
    .then(function(snapshot) {
      allReturns = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        allReturns.push({
          id: doc.id,
          orderId: data.orderId,
          productId: data.productId,
          quantity: data.quantity,
          reason: data.reason,
          status: data.status,
          date: data.date,
        });
      });
      renderReturns();
    })
    .catch(function(error) {
      console.error("Error loading returns:", error);
      document.getElementById("returnsContainer").innerHTML = 
        '<div style="text-align:center;padding:40px;color:red;">Error loading returns. Please try again.</div>';
    });
}

// ===========================
//  HELPER FUNCTIONS
// ===========================

/**
 * Get product by ID
 */
function getProduct(productId) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i];
    }
  }
  return null;
}

/**
 * Calculate days since return request
 */
function daysSinceReturn(returnDate) {
  var then = new Date(returnDate);
  var now = new Date();
  var diffTime = now - then;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if return is within period
 */
function isWithinReturnPeriod(orderDate) {
  var order = new Date(orderDate);
  var now = new Date();
  var diffTime = now - order;
  var diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= RETURN_PERIOD_DAYS;
}

// ===========================
//  RENDER FUNCTIONS
// ===========================

/**
 * Filter returns by status
 */
function filterReturns(filter, btn) {
  currentFilter = filter;
  var tabs = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  btn.classList.add("active");
  renderReturns();
}

/**
 * Render returns list
 */
function renderReturns() {
  var container = document.getElementById("returnsContainer");

  // Filter returns
  var returns = [];
  for (var i = 0; i < allReturns.length; i++) {
    if (currentFilter === "all" || allReturns[i].status === currentFilter) {
      returns.push(allReturns[i]);
    }
  }

  if (returns.length === 0) {
    var message = currentFilter === "all" 
      ? "You haven't made any return requests yet"
      : "No " + currentFilter + " returns found";
    container.innerHTML = '<div style="text-align:center;padding:40px;">' + message + '</div>';
    return;
  }

  // Sort by date (newest first)
  returns.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var html = "";
  for (var i = 0; i < returns.length; i++) {
    var ret = returns[i];
    var product = getProduct(ret.productId);
    var name = product ? product.name : "Unknown Product";
    var price = product ? product.price : 0;
    var date = new Date(ret.date).toLocaleDateString();
    var daysSince = daysSinceReturn(ret.date);

    // Status styling
    var statusClass = ret.status;
    var statusIcon = "";
    if (ret.status === "pending") {
      statusIcon = '<i class="fa-solid fa-clock"></i>';
    } else if (ret.status === "approved") {
      statusIcon = '<i class="fa-solid fa-check"></i>';
    } else if (ret.status === "rejected") {
      statusIcon = '<i class="fa-solid fa-xmark"></i>';
    }

    // Progress indicator
    var progressText = "";
    if (ret.status === "pending") {
      progressText = '<p style="font-size:12px;color:#718096;">Requested ' + daysSince + ' day(s) ago. Under review...</p>';
    } else if (ret.status === "approved") {
      progressText = '<p style="font-size:12px;color:#2f855a;">Refund of $' + (price * ret.quantity).toFixed(2) + ' will be processed soon.</p>';
    }

    html += '<div class="return-card">';
    html += '<div class="return-header">';
    html += '<div><strong>Return #' + ret.id.substring(0, 8) + '</strong><br>';
    html += '<small>' + date + '</small></div>';
    html += '<span class="return-status ' + statusClass + '">' + statusIcon + ' ' + ret.status.toUpperCase() + '</span>';
    html += '</div>';
    
    html += '<p><strong>Product:</strong> ' + name + '</p>';
    html += '<p><strong>Quantity:</strong> ' + ret.quantity + '</p>';
    html += '<p><strong>Refund Amount:</strong> $' + (price * ret.quantity).toFixed(2) + '</p>';
    html += '<div class="return-reason"><strong>Reason:</strong> ' + ret.reason + '</div>';
    html += progressText;
    html += '</div>';
  }
  container.innerHTML = html;
}

// ===========================
//  VALIDATION FUNCTIONS
// ===========================

/**
 * Validate return reason
 */
function validateReturnReason(reason) {
  if (!reason || reason === "") {
    return { valid: false, error: "Please select a return reason" };
  }
  return { valid: true, error: "" };
}

/**
 * Validate return period
 */
function validateReturnPeriod(orderDate) {
  if (!isWithinReturnPeriod(orderDate)) {
    return { 
      valid: false, 
      error: "Return period has expired. Returns must be requested within " + RETURN_PERIOD_DAYS + " days of order confirmation." 
    };
  }
  return { valid: true, error: "" };
}

/**
 * Check if return already exists for this order/product
 */
function hasExistingReturn(orderId, productId) {
  for (var i = 0; i < allReturns.length; i++) {
    if (allReturns[i].orderId === orderId && allReturns[i].productId === productId) {
      return true;
    }
  }
  return false;
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
// Start
checkAuthState();
updateNavCartCount();
init();

function checkAuthState() {
  var currentUser = localStorage.getItem("currentUser");
  var authLinks = document.querySelectorAll(".auth-required");
  var loginLink = document.getElementById("loginLink");
  var logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    for (var i = 0; i < authLinks.length; i++) authLinks[i].style.display = "inline-flex";
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
  } else {
    for (var i = 0; i < authLinks.length; i++) authLinks[i].style.display = "none";
    if (loginLink) loginLink.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

function updateNavCartCount() {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var count = 0;
  for (var i = 0; i < cart.length; i++) count += cart[i].quantity;
  var badge = document.getElementById("navCartCount");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }
}
