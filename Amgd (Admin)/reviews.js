/**
 * Admin Reviews Management
 * Description: View and moderate customer reviews
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
var allReviews = [];
var products = [];
var currentFilter = "all";
var currentReviewId = null;

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  // Check if admin is logged in
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied. Admins only.");
    window.location.href = "../auth/login-register.html";
    return;
  }
  
  loadData();
}

/**
 * Load products and reviews from Firebase
 */
function loadData() {
  // First load products for reference
  db.collection("products")
    .get()
    .then(function(snapshot) {
      products = [];
      snapshot.forEach(function(doc) {
        products.push({
          id: doc.id,
          name: doc.data().name
        });
      });
      return db.collection("reviews").get();
    })
    .then(function(snapshot) {
      allReviews = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        allReviews.push({
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          text: data.text,
          date: data.date
        });
      });
      updateStats();
      renderReviews();
    })
    .catch(function(error) {
      console.error("Error loading data:", error);
      document.getElementById("reviewsBody").innerHTML = 
        '<tr><td colspan="6" class="text-center text-danger">Error loading reviews. Please try again.</td></tr>';
    });
}

// ===========================
//  HELPER FUNCTIONS
// ===========================

/**
 * Get product name by ID
 */
function getProductName(productId) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i].name;
    }
  }
  return "Unknown Product";
}

/**
 * Generate star display
 */
function getStars(rating) {
  var stars = "";
  for (var i = 0; i < 5; i++) {
    if (i < rating) {
      stars += '<i class="fa-solid fa-star"></i>';
    } else {
      stars += '<i class="fa-regular fa-star"></i>';
    }
  }
  return stars;
}

/**
 * Format date
 */
function formatDate(dateString) {
  var date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// ===========================
//  STATS
// ===========================

/**
 * Update stats cards
 */
function updateStats() {
  var totalReviews = allReviews.length;
  var totalRating = 0;
  var fiveStarCount = 0;
  var oneStarCount = 0;
  
  for (var i = 0; i < allReviews.length; i++) {
    totalRating += allReviews[i].rating;
    if (allReviews[i].rating === 5) fiveStarCount++;
    if (allReviews[i].rating === 1) oneStarCount++;
  }
  
  var avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "0.0";
  
  document.getElementById("totalReviews").textContent = totalReviews;
  document.getElementById("avgRating").textContent = avgRating;
  document.getElementById("fiveStarCount").textContent = fiveStarCount;
  document.getElementById("oneStarCount").textContent = oneStarCount;
}

// ===========================
//  RENDER
// ===========================

/**
 * Filter reviews by rating
 */
function filterReviews(rating, btn) {
  currentFilter = rating;
  
  // Update active button
  var buttons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }
  btn.classList.add("active");
  
  renderReviews();
}

/**
 * Render reviews table
 */
function renderReviews() {
  var tbody = document.getElementById("reviewsBody");
  
  // Filter reviews
  var reviews = [];
  for (var i = 0; i < allReviews.length; i++) {
    if (currentFilter === "all" || allReviews[i].rating === currentFilter) {
      reviews.push(allReviews[i]);
    }
  }
  
  if (reviews.length === 0) {
    var message = currentFilter === "all" 
      ? "No reviews yet" 
      : "No " + currentFilter + "-star reviews found";
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">' + message + '</td></tr>';
    return;
  }
  
  // Sort by date (newest first)
  reviews.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  
  var html = "";
  for (var i = 0; i < reviews.length; i++) {
    var review = reviews[i];
    var productName = getProductName(review.productId);
    var date = formatDate(review.date);
    var stars = getStars(review.rating);
    var truncatedText = review.text.length > 50 ? review.text.substring(0, 50) + "..." : review.text;
    
    html += '<tr>';
    html += '<td>' + date + '</td>';
    html += '<td>' + productName + '</td>';
    html += '<td>' + review.userName + '</td>';
    html += '<td><span class="rating-stars">' + stars + '</span></td>';
    html += '<td class="review-text-cell">' + truncatedText + '</td>';
    html += '<td class="action-buttons">';
    html += '<button class="btn btn-sm btn-outline" onclick="viewReview(\'' + review.id + '\')">View</button>';
    html += '<button class="btn btn-sm btn-danger" onclick="confirmDelete(\'' + review.id + '\')">Delete</button>';
    html += '</td>';
    html += '</tr>';
  }
  
  tbody.innerHTML = html;
}

// ===========================
//  MODALS
// ===========================

/**
 * View review details
 */
function viewReview(reviewId) {
  var review = null;
  for (var i = 0; i < allReviews.length; i++) {
    if (allReviews[i].id === reviewId) {
      review = allReviews[i];
      break;
    }
  }
  
  if (!review) return;
  
  currentReviewId = reviewId;
  
  document.getElementById("modalProduct").textContent = getProductName(review.productId);
  document.getElementById("modalCustomer").textContent = review.userName;
  document.getElementById("modalRating").innerHTML = '<span class="rating-stars">' + getStars(review.rating) + '</span> (' + review.rating + '/5)';
  document.getElementById("modalDate").textContent = formatDate(review.date);
  document.getElementById("modalText").textContent = review.text;
  
  document.getElementById("modalDeleteBtn").onclick = function() {
    closeModal();
    confirmDelete(reviewId);
  };
  
  document.getElementById("viewModal").classList.add("show");
}

/**
 * Close view modal
 */
function closeModal() {
  document.getElementById("viewModal").classList.remove("show");
}

/**
 * Show delete confirmation
 */
function confirmDelete(reviewId) {
  currentReviewId = reviewId;
  
  document.getElementById("confirmDeleteBtn").onclick = function() {
    deleteReview(reviewId);
  };
  
  document.getElementById("deleteModal").classList.add("show");
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
  currentReviewId = null;
}

/**
 * Delete review
 */
function deleteReview(reviewId) {
  document.getElementById("confirmDeleteBtn").disabled = true;
  document.getElementById("confirmDeleteBtn").textContent = "Deleting...";
  
  db.collection("reviews")
    .doc(reviewId)
    .delete()
    .then(function() {
      // Remove from local array
      allReviews = allReviews.filter(function(r) {
        return r.id !== reviewId;
      });
      
      closeDeleteModal();
      updateStats();
      renderReviews();
      
      // Reset button
      document.getElementById("confirmDeleteBtn").disabled = false;
      document.getElementById("confirmDeleteBtn").textContent = "Delete";
      
      alert("Review deleted successfully!");
    })
    .catch(function(error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
      
      document.getElementById("confirmDeleteBtn").disabled = false;
      document.getElementById("confirmDeleteBtn").textContent = "Delete";
    });
}

// ===========================
//  LOGOUT
// ===========================
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
