/**
 * Authentication System
 * Description: Login/Register functionality with validation and Firebase integration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// ===========================
//  CONSTANTS
// ===========================
var ADMIN = "admin";
var CUSTOMER = "customer";
var CURRENT_USER_KEY = "currentUser";

// ===========================
//  REGEX PATTERNS
// ===========================
var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
var passwordRegex = /^.{6,}$/;
var nameRegex = /^[a-zA-Z\s]{3,50}$/;

// ===========================
//  ERROR MESSAGES
// ===========================
var ERRORS = {
  required: "All fields are required",
  nameInvalid: "Name must be 3-50 letters only",
  emailInvalid: "Please enter a valid email address",
  emailExists: "This email is already registered",
  passwordWeak: "Password must be at least 6 characters",
  passwordMismatch: "Passwords do not match",
  loginFailed: "Invalid email or password",
  serverError: "Server error. Please try again."
};

// ===========================
//  DATABASE INITIALIZATION
// ===========================
(function initDatabase() {
  // Initialize localStorage if empty
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }
  if (!localStorage.getItem("wishlist")) {
    localStorage.setItem("wishlist", JSON.stringify([]));
  }
  
  // Migration: Sync localStorage users to Firebase
  migrateUsersToFirebase();
})();

function migrateUsersToFirebase() {
  try {
    var localUsers = JSON.parse(localStorage.getItem("users")) || [];
    if (localUsers.length === 0) return;

    console.log("Checking for users to migrate...", localUsers.length);

    localUsers.forEach(function(user) {
      if (!user.email) return;
      
      db.collection("users").where("email", "==", user.email).get().then(function(snapshot) {
        if (snapshot.empty) {
          console.log("Migrating user:", user.email);
          db.collection("users").add({
            name: user.name || "Unknown",
            email: user.email,
            password: user.password, // Ideally should be hashed, but migrating as-is for now
            role: user.role || "customer",
            createdAt: new Date().toISOString(),
            migrated: true
          });
        }
      });
    });
  } catch (e) {
    console.error("Migration error:", e);
  }
}

// ===========================
//  VALIDATION FUNCTIONS
// ===========================

// ===========================
//  VALIDATION FUNCTIONS
// ===========================

function validateName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Name is required" };
  }
  name = name.trim();
  if (name.length < 3 || name.length > 50) {
    return { valid: false, error: ERRORS.nameInvalid };
  }
  if (!nameRegex.test(name)) {
    return { valid: false, error: ERRORS.nameInvalid };
  }
  return { valid: true, error: "" };
}

function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { valid: false, error: "Email is required" };
  }
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: ERRORS.emailInvalid };
  }
  return { valid: true, error: "" };
}

function validatePassword(password) {
  if (!password || password === "") {
    return { valid: false, error: "Password is required" };
  }
  if (password.length < 6) {
    return { valid: false, error: ERRORS.passwordWeak };
  }
  return { valid: true, error: "" };
}

function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { valid: false, error: ERRORS.passwordMismatch };
  }
  return { valid: true, error: "" };
}

// ===========================
//  UI FUNCTIONS
// ===========================

function showRegister() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("registerSection").classList.remove("hidden");
  clearAllErrors();
}

function showLogin() {
  document.getElementById("registerSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
  clearAllErrors();
}

function showError(elementId, message) {
  var element = document.getElementById(elementId);
  var inputId = elementId.replace("Error", "");
  var input = document.getElementById(inputId);
  
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
  if (input) {
    input.classList.add("error");
  }
}

function clearError(elementId) {
  var element = document.getElementById(elementId);
  var inputId = elementId.replace("Error", "");
  var input = document.getElementById(inputId);
  
  if (element) {
    element.textContent = "";
    element.style.display = "none";
  }
  if (input) {
    input.classList.remove("error");
  }
}

function clearAllErrors() {
  var errors = document.querySelectorAll(".error-message");
  for (var i = 0; i < errors.length; i++) {
    errors[i].textContent = "";
    errors[i].style.display = "none";
  }
  var inputs = document.querySelectorAll("input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("error");
  }
}

function showLoading(buttonId, loading) {
  var button = document.querySelector("#" + buttonId + " button[type='submit']");
  if (button) {
    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : (buttonId === "loginSection" ? "Login" : "Register");
  }
}

// ===========================
//  REGISTER FUNCTION
// ===========================
function register() {
  var name = document.getElementById("regName").value;
  var email = document.getElementById("regEmail").value;
  var password = document.getElementById("regPass").value;
  var confirmPassword = document.getElementById("regConfirmPass");
  
  clearAllErrors();
  var isValid = true;

  // Validate name
  var nameResult = validateName(name);
  if (!nameResult.valid) {
    showError("regNameError", nameResult.error);
    isValid = false;
  }

  // Validate email
  var emailResult = validateEmail(email);
  if (!emailResult.valid) {
    showError("regEmailError", emailResult.error);
    isValid = false;
  }

  // Validate password
  var passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    showError("regPassError", passwordResult.error);
    isValid = false;
  }

  // Validate password confirmation
  if (confirmPassword) {
    var matchResult = validatePasswordMatch(password, confirmPassword.value);
    if (!matchResult.valid) {
      showError("regConfirmPassError", matchResult.error);
      isValid = false;
    }
  }

  if (!isValid) return;

  showLoading("registerSection", true);

  // Check if email already exists in Firebase
  db.collection("users")
    .where("email", "==", email.trim().toLowerCase())
    .get()
    .then(function(snapshot) {
      if (!snapshot.empty) {
        showLoading("registerSection", false);
        showError("regEmailError", ERRORS.emailExists);
        return;
      }

      // Create new user in Firebase
      var newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // In production, this should be hashed
        role: CUSTOMER,
        createdAt: new Date().toISOString()
      };

      return db.collection("users").add(newUser);
    })
    .then(function(docRef) {
      if (docRef) {
        showLoading("registerSection", false);
        alert("Registration successful! Please login.");
        
        // Clear form
        document.getElementById("regName").value = "";
        document.getElementById("regEmail").value = "";
        document.getElementById("regPass").value = "";
        if (confirmPassword) confirmPassword.value = "";
        
        showLogin();
      }
    })
    .catch(function(error) {
      showLoading("registerSection", false);
      console.error("Registration error:", error);
      showError("regError", ERRORS.serverError);
      document.getElementById("regError").style.display = "block";
    });
}

// ===========================
//  LOGIN FUNCTION
// ===========================
function login() {
  var email = document.getElementById("loginEmail").value;
  var password = document.getElementById("loginPass").value;
  
  clearAllErrors();
  var isValid = true;

  // Validate email
  var emailResult = validateEmail(email);
  if (!emailResult.valid) {
    showError("loginEmailError", emailResult.error);
    isValid = false;
  }

  // Validate password
  var passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    showError("loginPassError", passwordResult.error);
    isValid = false;
  }

  if (!isValid) return;

  showLoading("loginSection", true);

  // Check Firebase for user
  db.collection("users")
    .where("email", "==", email.trim().toLowerCase())
    .where("password", "==", password)
    .get()
    .then(function(snapshot) {
      showLoading("loginSection", false);
      
      if (snapshot.empty) {
        // Try default admin account for backward compatibility
        if (email.trim().toLowerCase() === "admin@test.com" && password === "123456") {
          var adminUser = {
            id: "admin-default",
            name: "Admin",
            email: "admin@test.com",
            role: ADMIN
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
          window.location.href = "../Amgd (Admin)/index.html";
          return;
        }
        
        showError("loginError", ERRORS.loginFailed);
        document.getElementById("loginError").style.display = "block";
        return;
      }

      // User found
      var doc = snapshot.docs[0];
      var userData = doc.data();
      var currentUser = {
        id: doc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || CUSTOMER
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

      // Redirect based on role
      if (currentUser.role === ADMIN) {
        window.location.href = "../Amgd (Admin)/index.html";
      } else {
        window.location.href = "../customer/products.html";
      }
    })
    .catch(function(error) {
      showLoading("loginSection", false);
      console.error("Login error:", error);
      showError("loginError", ERRORS.serverError);
      document.getElementById("loginError").style.display = "block";
    });
}

// ===========================
//  LOGOUT FUNCTION
// ===========================
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "../index.html";
}

// ===========================
//  AUTH CHECK FUNCTIONS
// ===========================
function checkAlreadyLoggedIn() {
  var user = localStorage.getItem(CURRENT_USER_KEY);
  if (user) {
    var userData = JSON.parse(user);
    if (userData.role === ADMIN) {
      window.location.href = "../Amgd (Admin)/index.html";
    } else {
      window.location.href = "../customer/products.html";
    }
  }
}

function getCurrentUser() {
  var user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function requireLogin() {
  var user = getCurrentUser();
  if (!user) {
    alert("Please login to continue");
    window.location.href = "../auth/login-register.html";
    return null;
  }
  return user;
}

// ===========================
//  EVENT LISTENERS
// ===========================

// Register button - show register form
var registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", showRegister);
}

// Login button - show login form
var loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", showLogin);
}

// Register form submission
var registerSection = document.getElementById("registerSection");
if (registerSection) {
  registerSection.addEventListener("submit", function(e) {
    e.preventDefault();
    register();
  });
}

// Login form submission
var loginSection = document.getElementById("loginSection");
if (loginSection) {
  loginSection.addEventListener("submit", function(e) {
    e.preventDefault();
    login();
  });
}

// Logout button
var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function(e) {
    e.preventDefault();
    logout();
  });
}

// Real-time validation on input
function addInputListener(id, validator, errorId) {
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", function() {
      var result = validator(this.value);
      if (!result.valid) {
        showError(errorId, result.error);
      } else {
        clearError(errorId);
      }
    });
    // Also clear on focus to improve UX
    el.addEventListener("focus", function() {
      clearError(errorId);
    });
  }
}

addInputListener("regName", validateName, "regNameError");
addInputListener("regEmail", validateEmail, "regEmailError");
addInputListener("regPass", validatePassword, "regPassError");
addInputListener("loginEmail", validateEmail, "loginEmailError");
addInputListener("loginPass", validatePassword, "loginPassError");

// Special case for matching password
var regConfirmPass = document.getElementById("regConfirmPass");
if (regConfirmPass) {
  regConfirmPass.addEventListener("input", function() {
    var password = document.getElementById("regPass").value;
    var result = validatePasswordMatch(password, this.value);
    if (!result.valid) {
      showError("regConfirmPassError", result.error);
    } else {
      clearError("regConfirmPassError");
    }
  });
}

console.log("Auth.js loaded - Firebase ready!");
