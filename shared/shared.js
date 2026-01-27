/* ===============================
   GLOBAL STANDARD VARIABLES
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
  categoryId: "",
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
