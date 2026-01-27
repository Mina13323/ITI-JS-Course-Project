/* ===============================
   GLOBAL STANDARD VARIABLES
   (DO NOT RENAME – DO NOT MODIFY)
   =============================== */

/* USER ROLES */
var ADMIN = "admin";
var CUSTOMER = "customer";

/* ORDER STATUS */
var PENDING = "pending";
var CONFIRMED = "confirmed";
var REJECTED = "rejected";

/* LOCAL STORAGE KEYS */
var USERS_KEY = "users";
var PRODUCTS_KEY = "products";
var CATEGORIES_KEY = "categories";
var CART_KEY = "cart";
var ORDERS_KEY = "orders";
var CURRENT_USER_KEY = "currentUser";
var WISHLIST_KEY = "wishlist";

/* MAIN DATA ARRAYS */
let users = [];
let products = [];
let categories = [];
let cart = [];
let orders = [];

/* CURRENT USER */
let currentUser = null;

/* OBJECT TEMPLATES */
let user = {
  id: "",
  name: "",
  email: "",
  password: "",
  role: CUSTOMER,
};

let product = {
  id: "",
  name: "",
  image: "",
  categoryID: "",
  price: 0,
  description: "",
  stock: 0,
};

let category = {
  id: "",
  name: "",
};

let cartItem = {
  productId: "",
  quantity: 1,
};

let order = {
  id: "",
  userId: "",
  items: [],
  total: 0,
  status: PENDING,
  date: "",
};

/* STANDARD ERROR MESSAGES */
var ERR_REQUIRED = "All fields are required.";
var ERR_EMAIL = "Invalid email.";
var ERR_PASSWORD = "Password must be at least 6 characters.";

/* ===============================
   END OF STANDARD VARIABLES
   =============================== */

// ===========================
//  DataBase Initialization
// ===========================
(function () {
  // Get existing users or empty array
  var existingUsers = [];
  try {
    existingUsers = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    existingUsers = [];
  }

  // Check if admin account exists
  var adminExists = false;
  for (var i = 0; i < existingUsers.length; i++) {
    if (existingUsers[i].email === "admin@test.com") {
      adminExists = true;
      break;
    }
  }

  // If admin doesn't exist, add it
  if (!adminExists) {
    existingUsers.push({
      id: 1,
      name: "Admin",
      email: "admin@test.com",
      password: "123456",
      role: ADMIN,
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
    console.log("Admin account restored!");
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CART_KEY)) {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(WISHLIST_KEY)) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem("reviews")) {
    localStorage.setItem("reviews", JSON.stringify([]));
  }
})();

// ===========================
//  Login/Register UI
// ===========================

// Get register-button and that Shows the register form
var registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", showRegister);
}

// Get login-button and that Shows the login form
var loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", showLogin);
}

// Show register form
function showRegister() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("registerSection").classList.remove("hidden");
}

// Show login form
function showLogin() {
  document.getElementById("registerSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

// ===========================
//  Regex Validation LOGIC
// ===========================
// - Email Pattern
var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// - Password Pattern
var passRegex = /^.{6,}$/;

// ===========================
//  REGISTER LOGIC
// ===========================
function register() {
  // 0. Get the users array of object
  var users = JSON.parse(localStorage.getItem("users"));

  // 1. Get Inputs
  var name = document.getElementById("regName").value;
  var email = document.getElementById("regEmail").value;
  var password = document.getElementById("regPass").value;
  var errorMsg = document.getElementById("regError");

  // 2. Regex Validation
  // a. All fields are required
  if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
    errorMsg.innerText = ERR_REQUIRED;
    return;
  }
  // b. Email must be valid
  if (!emailRegex.test(email)) {
    errorMsg.innerText = ERR_EMAIL;
    return;
  }
  // c. Password must be at least 6 characters
  if (!passRegex.test(password)) {
    errorMsg.innerText = ERR_PASSWORD;
    return;
  }

  // 3. Check if email already exists
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      errorMsg.innerText = "Email already registered!";
      return;
    }
  }

  // 4. Create new User Object
  var newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    role: CUSTOMER,
  };
  // add to users array then add to localStorage
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // 5. Show Success Message & Switch to Login UI
  alert("Registration Successful! Please Login.");
  showLogin();
}

// ===========================
//  LOGIN LOGIC
// ===========================
function login() {
  // 0. Get the users array of object
  var users = JSON.parse(localStorage.getItem("users"));

  // 1. Get Inputs
  var email = document.getElementById("loginEmail").value;
  var password = document.getElementById("loginPass").value;
  var errorMsg = document.getElementById("loginError");

  // 2. Regex Validation
  // a. All fields are required
  if (email === "" || password === "") {
    errorMsg.innerText = ERR_REQUIRED;
    return;
  }
  // b. Email must be valid
  if (!emailRegex.test(email)) {
    errorMsg.innerText = ERR_EMAIL;
    return;
  }
  // c. Password must be at least 6 characters
  if (!passRegex.test(password)) {
    errorMsg.innerText = ERR_PASSWORD;
    return;
  }

  // 3. Loop to find currentUser
  var foundUser = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      foundUser = users[i];
      break;
    }
  }

  // 4. If currentUser was found: save as current currentUser and redirect to his page
  if (foundUser) {
    // Save him as current currentUser to session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));

    // Redirect based on Role Admin OR Customer
    if (foundUser.role === ADMIN) {
      location.href = "admin-dashboard.html";
    } else {
      location.href = "../index.html";
    }
  } else {
    errorMsg.innerText = "Invalid Email or Password";
  }
}

// ===========================
//  Form Submission Handlers
// ===========================

// Handle Register Form
var registerSection = document.getElementById("registerSection");
if (registerSection) {
  registerSection.addEventListener("submit", function (event) {
    event.preventDefault();
    register();
  });
}

// Handle Login Form
var loginSection = document.getElementById("loginSection");
if (loginSection) {
  loginSection.addEventListener("submit", function (event) {
    event.preventDefault();
    login();
  });
}

// ===========================
//  LOGOUT LOGIC
// ===========================
// 1. Get logout button
var logoutBtn = document.getElementById("logoutBtn");

// - Logout by removing current currentUser
// - Logout by removing current currentUser
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  if (window.location.pathname.indexOf("Auth- (Samy)") > -1) {
    window.location.href = "../index.html";
  } else {
    window.location.href = "index.html";
  }
}

// 2. Check if the button actually exists first then add click event
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (event) {
    event.preventDefault();
    logout();
  });
}

// ===========================
// AUTHENTICATION LOGIC
// ===========================
// Role-based protection Switch. To be added in every page
function checkCurrentUser() {
  // 0. Get the current user
  var currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

  // 1. Check if current user exists (Not logged in)
  if (!currentUser) {
    location.href = "../index.html";
    return null;
  }

  // 2. Get the current page name (e.g., "admin-dashboard.html", "products.html")
  var currentPage = location.pathname.split("/").pop();

  // 3. Role-based protection
  switch (currentUser.role) {
    case ADMIN:
    // // Optional: strictly set Admins to NEVER enter customer pages:
    // // array of customer - only pages
    // var customerPages = ['products.html', 'cart.html', 'orders.html', 'wishlist.html'];
    // if (customerPages.includes(currentPage)) {
    //     location.href = 'admin-dashboard.html';
    // }
    // break;

    case CUSTOMER:
      // Customer is NOT allowed on admin-*.html.
      if (currentPage.startsWith("admin-")) {
        location.href = "products.html";
      }
      break;
  }

  return currentUser;
}

// (For login page) Check if user already logged in. If so, redirect to the correct page.
function checkAlreadyLoggedIn() {
  if (localStorage.getItem(CURRENT_USER_KEY)) {
    var user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (user.role === "admin") {
      location.href = "admin-dashboard.html";
    } else {
      location.href = "../index.html";
    }
  }
}
