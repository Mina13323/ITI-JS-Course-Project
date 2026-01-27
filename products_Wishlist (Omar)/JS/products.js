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
var ERR_REQUIRED = "This field is required";
var ERR_EMAIL = "Invalid email";
var ERR_PASSWORD = "Password must be at least 6 characters";

/* ===============================
   END OF STANDARD VARIABLES
   =============================== */

const productGrid = document.querySelector(".products-grid");
const categoryFilter = document.querySelector("#categoryFilter");
const minPriceInput = document.querySelector("#minPrice");
const maxPriceInput = document.querySelector("#maxPrice");
const wishlistCount = document.querySelector("#wishlistCount");

const sampleCategories = [
  { id: 1, name: "Phones" },
  { id: 2, name: "Laptops" },
  { id: 3, name: "Accessories" },
];

const sampleProducts = [
  {
    id: 1,
    name: "iPhone 17",
    image:
      "https://2b.com.eg/media/catalog/product/cache/661473ab953cdcdf4c3b607144109b90/m/a/ma218_1.jpg",
    categoryId: 1,
    price: 1200,
    description:
      "The latest iPhone with stunning display and powerful performance.",
    stock: 5,
  },
  {
    id: 2,
    name: "Samsung Galaxy S25",
    image:
      "https://m.media-amazon.com/images/I/61jcNsSidiL._AC_UF894,1000_QL80_.jpg",
    categoryId: 1,
    price: 950,
    description:
      "High-end Samsung smartphone with amazing camera and battery life.",
    stock: 8,
  },
  {
    id: 3,
    name: "MacBook Pro M4",
    image:
      "https://macfinder.co.uk/wp-content/uploads/2023/12/img-MacBook-Pro-Retina-16-Inch-24323-scaled.jpg",
    categoryId: 2,
    price: 2200,
    description: "Powerful MacBook with M4 chip, perfect for professionals.",
    stock: 3,
  },
  {
    id: 4,
    name: "USB-C Charger",
    image:
      "https://m.media-amazon.com/images/I/61UR3mS+GhL._AC_UF894,1000_QL80_.jpg",
    categoryId: 3,
    price: 25,
    description: "Fast USB-C charger compatible with all modern devices.",
    stock: 50,
  },
];

function loadData() {
  const storedCategories = localStorage.getItem(CATEGORIES_KEY);
  const storedProducts = localStorage.getItem(PRODUCTS_KEY);

  categories = storedCategories
    ? JSON.parse(storedCategories)
    : sampleCategories;
  products = storedProducts ? JSON.parse(storedProducts) : sampleProducts;

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function renderCategoryOptions() {
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categoryFilter.appendChild(option);
  });
}

function updateWishlistCount() {
  const wishlist = getWishlist();
  wishlistCount.textContent = wishlist.length;
}

function buildProductCard(item) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.name;

  const body = document.createElement("div");
  body.className = "product-body";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const description = document.createElement("p");
  description.textContent = item.description;

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = `$${item.price.toFixed(2)}`;

  const stock = document.createElement("span");
  stock.className = "stock";
  stock.textContent = `${item.stock} in stock`;

  meta.append(price, stock);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "wishlist-button";

  const updateButtonState = () => {
    const inWishlist = isInWishlist(item.id);
    button.classList.toggle("in-wishlist", inWishlist);
    button.textContent = inWishlist
      ? "Remove from wishlist"
      : "Add to wishlist";
  };

  button.addEventListener("click", () => {
    toggleWishlist(item.id);
    updateButtonState();
    updateWishlistCount();
  });

  updateButtonState();

  body.append(title, description, meta, button);
  card.append(image, body);

  return card;
}

function renderProducts(list) {
  productGrid.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No products match your filters.";
    productGrid.appendChild(empty);
    return;
  }

  list.forEach((item) => {
    productGrid.appendChild(buildProductCard(item));
  });
}

function applyFilters() {
  const categoryValue = categoryFilter.value;
  const minValue = parseFloat(minPriceInput.value);
  const maxValue = parseFloat(maxPriceInput.value);

  let filtered = [...products];

  if (categoryValue) {
    filtered = filtered.filter((item) => item.categoryId === categoryValue);
  }

  if (!Number.isNaN(minValue)) {
    filtered = filtered.filter((item) => item.price >= minValue);
  }

  if (!Number.isNaN(maxValue)) {
    filtered = filtered.filter((item) => item.price <= maxValue);
  }

  renderProducts(filtered);
}

function initFilters() {
  [categoryFilter, minPriceInput, maxPriceInput].forEach((input) => {
    input.addEventListener("input", applyFilters);
  });
}

function initProductsPage() {
  loadData();
  renderCategoryOptions();
  updateWishlistCount();
  renderProducts(products);
  initFilters();
}

document.addEventListener("DOMContentLoaded", initProductsPage);
