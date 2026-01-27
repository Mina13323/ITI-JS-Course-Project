import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "./firebase-config.js";



// Add a new user
async function addUser(userData) {
  const docRef = await addDoc(collection(db, "users"), userData);
  console.log("User added with ID:", docRef.id);
  return docRef.id;
}

// Get user by email
async function getUserByEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

// Update user
async function updateUser(userId, userData) {
  await updateDoc(doc(db, "users", userId), userData);
  console.log("User updated!");
}


// Get all products
async function getProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products = [];
  querySnapshot.forEach((docSnap) => {
    products.push({ id: docSnap.id, ...docSnap.data() });
  });
  return products;
}

// Add a new product
async function addProduct(productData) {
  const docRef = await addDoc(collection(db, "products"), productData);
  console.log("Product added with ID:", docRef.id);
  return docRef.id;
}

// Update product
async function updateProduct(productId, productData) {
  await updateDoc(doc(db, "products", productId), productData);
  console.log("Product updated!");
}

// Delete product
async function deleteProduct(productId) {
  await deleteDoc(doc(db, "products", productId));
  console.log("Product deleted!");
}


// Get all orders
async function getOrders() {
  const querySnapshot = await getDocs(collection(db, "orders"));
  const orders = [];
  querySnapshot.forEach((docSnap) => {
    orders.push({ id: docSnap.id, ...docSnap.data() });
  });
  return orders;
}

// Get orders by user
async function getOrdersByUser(userId) {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const orders = [];
  querySnapshot.forEach((docSnap) => {
    orders.push({ id: docSnap.id, ...docSnap.data() });
  });
  return orders;
}

// Add a new order
async function addOrder(orderData) {
  orderData.date = new Date().toISOString();
  const docRef = await addDoc(collection(db, "orders"), orderData);
  console.log("Order added with ID:", docRef.id);
  return docRef.id;
}

// Update order status
async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, "orders", orderId), { status: status });
  console.log("Order status updated to:", status);
}


// Get reviews for a product
async function getProductReviews(productId) {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
  );
  const querySnapshot = await getDocs(q);
  const reviews = [];
  querySnapshot.forEach((docSnap) => {
    reviews.push({ id: docSnap.id, ...docSnap.data() });
  });
  return reviews;
}

// Add a review
async function addReview(reviewData) {
  reviewData.date = new Date().toISOString();
  const docRef = await addDoc(collection(db, "reviews"), reviewData);
  console.log("Review added with ID:", docRef.id);
  return docRef.id;
}


// Get all returns
async function getReturns() {
  const querySnapshot = await getDocs(collection(db, "returns"));
  const returns = [];
  querySnapshot.forEach((docSnap) => {
    returns.push({ id: docSnap.id, ...docSnap.data() });
  });
  return returns;
}

// Get returns by user
async function getReturnsByUser(userId) {
  const q = query(collection(db, "returns"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const returns = [];
  querySnapshot.forEach((docSnap) => {
    returns.push({ id: docSnap.id, ...docSnap.data() });
  });
  return returns;
}

// Add a return request
async function addReturn(returnData) {
  returnData.date = new Date().toISOString();
  returnData.status = "pending";
  const docRef = await addDoc(collection(db, "returns"), returnData);
  console.log("Return request added with ID:", docRef.id);
  return docRef.id;
}

// Update return status
async function updateReturnStatus(returnId, status) {
  await updateDoc(doc(db, "returns", returnId), { status: status });
  console.log("Return status updated to:", status);
}

// Get all categories
async function getCategories() {
  const querySnapshot = await getDocs(collection(db, "categories"));
  const categories = [];
  querySnapshot.forEach((docSnap) => {
    categories.push({ id: docSnap.id, ...docSnap.data() });
  });
  return categories;
}

// Add a category
async function addCategory(categoryData) {
  const docRef = await addDoc(collection(db, "categories"), categoryData);
  console.log("Category added with ID:", docRef.id);
  return docRef.id;
}

// Export all functions
export {
  addCategory,
  addOrder,
  addProduct,
  addReturn,
  addReview,
  addUser,
  deleteProduct,
  getCategories,
  getOrders,
  getOrdersByUser,
  getProductReviews,
  getProducts,
  getReturns,
  getReturnsByUser,
  getUserByEmail,
  updateOrderStatus,
  updateProduct,
  updateReturnStatus,
  updateUser,
};

console.log("Firebase database helpers loaded!");
