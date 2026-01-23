// Initial data
const seedCategories = [
  { id: 1, name: "Phones" },
  { id: 2, name: "Laptops" },
  { id: 3, name: "Accessories" }
];

const seedProducts = [
  { 
    id: 1, 
    name: "iPhone 17", 
    price: 1200, 
    stock: 5, 
    categoryId: 1,
    description: "The latest iPhone with stunning display and powerful performance.",
    image: "https://2b.com.eg/media/catalog/product/cache/661473ab953cdcdf4c3b607144109b90/m/a/ma218_1.jpg"
  },
  { 
    id: 2, 
    name: "Samsung Galaxy S25", 
    price: 950, 
    stock: 8, 
    categoryId: 1,
    description: "High-end Samsung smartphone with amazing camera and battery life.",
    image: "https://m.media-amazon.com/images/I/61jcNsSidiL._AC_UF894,1000_QL80_.jpg"
  },
  { 
    id: 3, 
    name: "MacBook Pro M4", 
    price: 2200, 
    stock: 3, 
    categoryId: 2,
    description: "Powerful MacBook with M4 chip, perfect for professionals.",
    image: "https://macfinder.co.uk/wp-content/uploads/2023/12/img-MacBook-Pro-Retina-16-Inch-24323-scaled.jpg"
  },
  { 
    id: 4, 
    name: "USB-C Charger", 
    price: 25, 
    stock: 50, 
    categoryId: 3,
    description: "Fast USB-C charger compatible with all modern devices.",
    image: "https://m.media-amazon.com/images/I/61UR3mS+GhL._AC_UF894,1000_QL80_.jpg"
  }
];

const seedOrders = [
  {
    id: 101,
    customerName: "Ahmed Hassan",
    status: "pending",
    items: [
      { productId: 1, quantity: 1 },
      { productId: 4, quantity: 2 }
    ]
  },
  {
    id: 102,
    customerName: "Mona Ali",
    status: "confirmed",
    items: [{ productId: 3, quantity: 1 }]
  }
];

// Reset data
export function resetStorage() {
  localStorage.setItem("categories", JSON.stringify(seedCategories));
  localStorage.setItem("products", JSON.stringify(seedProducts));
  localStorage.setItem("orders", JSON.stringify(seedOrders));
}
// Run once to make sure LocalStorage has data
export function initStorage() {
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(seedProducts));
  }

  if (!localStorage.getItem("categories")) {
    localStorage.setItem("categories", JSON.stringify(seedCategories));
  }

  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify(seedOrders));
  }
}

// Getters / Setters
export function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

export function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

export function getCategories() {
  return JSON.parse(localStorage.getItem("categories")) || [];
}

export function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
}

export function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

export function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}
