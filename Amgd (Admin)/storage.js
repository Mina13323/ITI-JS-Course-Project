/**
 * Admin Storage Module
 * Description: Firebase operations with validation for admin dashboard
 * Handles products, categories, orders, and stock management
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
//  DATA STORAGE (Cache)
// ===========================
var products = [];
var categories = [];
var orders = [];
var returns = [];

// ===========================
//  VALIDATION HELPERS
// ===========================

/**
 * Validate product data before saving
 * @param {object} productData - Product data to validate
 * @returns {object} - {valid: boolean, errors: object}
 */
function validateProductData(productData) {
  var errors = {};
  var valid = true;

  // Name validation
  if (!productData.name || productData.name.trim() === "") {
    errors.name = "Product name is required";
    valid = false;
  } else if (productData.name.trim().length < 3) {
    errors.name = "Product name must be at least 3 characters";
    valid = false;
  } else if (productData.name.trim().length > 50) {
    errors.name = "Product name cannot exceed 50 characters";
    valid = false;
  }

  // Price validation
  if (productData.price === "" || productData.price === null || productData.price === undefined) {
    errors.price = "Price is required";
    valid = false;
  } else {
    var priceNum = parseFloat(productData.price);
    if (isNaN(priceNum)) {
      errors.price = "Price must be a valid number";
      valid = false;
    } else if (priceNum < 0) {
      errors.price = "Price cannot be negative";
      valid = false;
    } else if (priceNum === 0) {
      errors.price = "Price must be greater than 0";
      valid = false;
    }
  }

  // Stock validation
  if (productData.stock === "" || productData.stock === null || productData.stock === undefined) {
    errors.stock = "Stock quantity is required";
    valid = false;
  } else {
    var stockNum = parseInt(productData.stock);
    if (isNaN(stockNum)) {
      errors.stock = "Stock must be a whole number";
      valid = false;
    } else if (stockNum < 0) {
      errors.stock = "Stock cannot be negative";
      valid = false;
    }
  }

  // Category validation
  if (!productData.categoryId || productData.categoryId === "") {
    errors.category = "Please select a category";
    valid = false;
  }

  // Description validation
  if (!productData.description || productData.description.trim() === "") {
    errors.description = "Description is required";
    valid = false;
  } else if (productData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
    valid = false;
  }

  return { valid: valid, errors: errors };
}

/**
 * Validate category name
 * @param {string} name - Category name
 * @param {string} excludeId - ID to exclude when checking duplicates
 * @returns {object} - {valid: boolean, error: string}
 */
function validateCategoryData(name, excludeId) {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Category name is required" };
  }
  
  name = name.trim();
  
  if (name.length < 3) {
    return { valid: false, error: "Category name must be at least 3 characters" };
  }
  
  if (name.length > 30) {
    return { valid: false, error: "Category name cannot exceed 30 characters" };
  }

  // Check for duplicates
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].name.toLowerCase() === name.toLowerCase()) {
      if (excludeId && categories[i].id === excludeId) {
        continue;
      }
      return { valid: false, error: "This category already exists" };
    }
  }

  return { valid: true, error: "" };
}

// ===========================
//  CATEGORY FUNCTIONS
// ===========================

/**
 * Load all categories from Firebase
 */
function loadCategories(callback) {
  db.collection("categories")
    .get()
    .then(function(snapshot) {
      categories = [];
      snapshot.forEach(function(doc) {
        categories.push({ id: doc.id, name: doc.data().name });
      });
      if (callback) callback(categories);
    })
    .catch(function(error) {
      console.error("Error loading categories:", error);
      if (callback) callback([]);
    });
}

/**
 * Get cached categories
 */
function getCategories() {
  return categories;
}

/**
 * Add a new category with validation
 */
function addCategory(name, callback) {
  var validation = validateCategoryData(name, null);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  db.collection("categories")
    .add({ name: name.trim() })
    .then(function(docRef) {
      var newCategory = { id: docRef.id, name: name.trim() };
      categories.push(newCategory);
      if (callback) callback(newCategory);
    })
    .catch(function(error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    });
}

/**
 * Update a category with validation
 */
function updateCategory(categoryId, name, callback) {
  var validation = validateCategoryData(name, categoryId);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  db.collection("categories")
    .doc(categoryId)
    .update({ name: name.trim() })
    .then(function() {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === categoryId) {
          categories[i].name = name.trim();
          break;
        }
      }
      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    });
}

/**
 * Delete a category (with product check)
 */
function deleteCategory(categoryId, callback) {
  // Check if category is used by products
  for (var i = 0; i < products.length; i++) {
    if (products[i].categoryId === categoryId) {
      alert("Cannot delete! Products are using this category.");
      return;
    }
  }

  db.collection("categories")
    .doc(categoryId)
    .delete()
    .then(function() {
      categories = categories.filter(function(c) {
        return c.id !== categoryId;
      });
      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    });
}

// ===========================
//  PRODUCT FUNCTIONS
// ===========================

/**
 * Load all products from Firebase
 */
function loadProducts(callback) {
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
      // Also sync to localStorage for customer pages
      localStorage.setItem("products", JSON.stringify(products));
      if (callback) callback(products);
    })
    .catch(function(error) {
      console.error("Error loading products:", error);
      if (callback) callback([]);
    });
}

/**
 * Get cached products
 */
function getProducts() {
  return products;
}

/**
 * Add a new product with validation
 * @returns {object|null} - Validation errors or null if successful
 */
function addProduct(productData, callback) {
  var validation = validateProductData(productData);
  if (!validation.valid) {
    return validation.errors;
  }

  // Prepare clean data
  var cleanData = {
    name: productData.name.trim(),
    image: productData.image || "https://via.placeholder.com/150",
    description: productData.description.trim(),
    price: parseFloat(productData.price),
    stock: parseInt(productData.stock),
    categoryId: productData.categoryId
  };

  db.collection("products")
    .add(cleanData)
    .then(function(docRef) {
      var newProduct = { id: docRef.id };
      for (var key in cleanData) {
        newProduct[key] = cleanData[key];
      }
      products.push(newProduct);
      localStorage.setItem("products", JSON.stringify(products));
      if (callback) callback(newProduct);
    })
    .catch(function(error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    });

  return null;
}

/**
 * Update a product with validation
 * @returns {object|null} - Validation errors or null if successful
 */
function updateProduct(productId, productData, callback) {
  var validation = validateProductData(productData);
  if (!validation.valid) {
    return validation.errors;
  }

  // Prepare clean data
  var cleanData = {
    name: productData.name.trim(),
    image: productData.image || "https://via.placeholder.com/150",
    description: productData.description.trim(),
    price: parseFloat(productData.price),
    stock: parseInt(productData.stock),
    categoryId: productData.categoryId
  };

  db.collection("products")
    .doc(productId)
    .update(cleanData)
    .then(function() {
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
          for (var key in cleanData) {
            products[i][key] = cleanData[key];
          }
          break;
        }
      }
      localStorage.setItem("products", JSON.stringify(products));
      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    });

  return null;
}

/**
 * Delete a product
 */
function deleteProduct(productId, callback) {
  db.collection("products")
    .doc(productId)
    .delete()
    .then(function() {
      products = products.filter(function(p) {
        return p.id !== productId;
      });
      localStorage.setItem("products", JSON.stringify(products));
      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    });
}

/**
 * Update product stock
 */
function updateProductStock(productId, newStock, callback) {
  if (newStock < 0) {
    alert("Stock cannot be negative");
    return;
  }

  db.collection("products")
    .doc(productId)
    .update({ stock: newStock })
    .then(function() {
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
          products[i].stock = newStock;
          break;
        }
      }
      localStorage.setItem("products", JSON.stringify(products));
      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error updating stock:", error);
    });
}

// ===========================
//  ORDER FUNCTIONS
// ===========================

/**
 * Load all orders from Firebase
 */
function loadOrders(callback) {
  db.collection("orders")
    .get()
    .then(function(snapshot) {
      orders = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        orders.push({
          id: doc.id,
          userId: data.userId,
          customerName: data.customerName,
          items: data.items || [],
          total: data.total || 0,
          status: data.status || "pending",
          date: data.date,
        });
      });
      if (callback) callback(orders);
    })
    .catch(function(error) {
      console.error("Error loading orders:", error);
      if (callback) callback([]);
    });
}

/**
 * Get cached orders
 */
function getOrders() {
  return orders;
}

/**
 * Update order status with stock management
 */
function updateOrderStatus(orderId, newStatus, callback) {
  var order = null;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].id === orderId) {
      order = orders[i];
      break;
    }
  }

  if (!order) {
    alert("Order not found");
    return;
  }

  var previousStatus = order.status;

  db.collection("orders")
    .doc(orderId)
    .update({ status: newStatus })
    .then(function() {
      // Update local cache
      order.status = newStatus;

      // Stock management
      if (newStatus === "confirmed" && previousStatus === "pending") {
        // Deduct stock when order is confirmed
        deductStockForOrder(order.items);
      } else if (newStatus === "rejected" && previousStatus === "pending") {
        // No stock change for rejected orders (stock wasn't deducted yet)
      } else if (previousStatus === "confirmed" && newStatus === "rejected") {
        // Restore stock if confirmed order is cancelled
        restoreStockForOrder(order.items);
      }

      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order. Please try again.");
    });
}

/**
 * Deduct stock for order items
 */
function deductStockForOrder(items) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    for (var j = 0; j < products.length; j++) {
      if (products[j].id === item.productId) {
        var newStock = Math.max(0, products[j].stock - item.quantity);
        updateProductStock(item.productId, newStock);
        break;
      }
    }
  }
}

/**
 * Restore stock for order items
 */
function restoreStockForOrder(items) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    for (var j = 0; j < products.length; j++) {
      if (products[j].id === item.productId) {
        var newStock = products[j].stock + item.quantity;
        updateProductStock(item.productId, newStock);
        break;
      }
    }
  }
}

// ===========================
//  RETURN FUNCTIONS
// ===========================

/**
 * Load all returns from Firebase
 */
function loadReturns(callback) {
  db.collection("returns")
    .get()
    .then(function(snapshot) {
      returns = [];
      snapshot.forEach(function(doc) {
        returns.push({ id: doc.id, ...doc.data() });
      });
      if (callback) callback(returns);
    })
    .catch(function(error) {
      console.error("Error loading returns:", error);
      if (callback) callback([]);
    });
}

/**
 * Get cached returns
 */
function getReturns() {
  return returns;
}

/**
 * Update return status with stock restoration
 */
function updateReturnStatus(returnId, newStatus, callback) {
  var returnItem = null;
  for (var i = 0; i < returns.length; i++) {
    if (returns[i].id === returnId) {
      returnItem = returns[i];
      break;
    }
  }

  if (!returnItem) {
    alert("Return not found");
    return;
  }

  db.collection("returns")
    .doc(returnId)
    .update({ status: newStatus })
    .then(function() {
      returnItem.status = newStatus;

      // Restore stock when return is approved
      if (newStatus === "approved") {
        for (var j = 0; j < products.length; j++) {
          if (products[j].id === returnItem.productId) {
            var newStock = products[j].stock + (returnItem.quantity || 1);
            updateProductStock(returnItem.productId, newStock);
            break;
          }
        }
      }

      if (callback) callback();
    })
    .catch(function(error) {
      console.error("Error updating return status:", error);
      alert("Failed to update return. Please try again.");
    });
}

console.log("Storage.js loaded - Firebase ready with validation!");
