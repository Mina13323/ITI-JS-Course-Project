/**
 * Shopping Cart System
 * Description: Cart management with stock validation and order placement
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
var products = [];

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  // Check if user is logged in
  var currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    alert("Please login to view your cart");
    window.location.href = "../auth/login-register.html";
    return;
  }

  loadProducts();
}

/**
 * Load products from Firebase
 */
function loadProducts() {
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
        });
      });
      // Sync to localStorage
      localStorage.setItem("products", JSON.stringify(products));
      renderCart();
    })
    .catch(function(error) {
      console.error("Error loading products:", error);
      // Try to use cached products
      var cached = localStorage.getItem("products");
      if (cached) {
        products = JSON.parse(cached);
        renderCart();
      }
    });
}

// ===========================
//  CART FUNCTIONS
// ===========================

/**
 * Get cart from localStorage
 */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

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
 * Render cart table
 */
function renderCart() {
  var cart = getCart();
  var pTable = document.querySelector("#ProductsTable>tbody");
  var totalElement = document.querySelector("#totalAmount");
  
  pTable.innerHTML = "";
  var totalPrice = 0;
  var hasErrors = false;

  if (cart.length === 0) {
    pTable.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:30px;'>Your cart is empty</td></tr>";
    totalElement.innerHTML = "";
    updatePayPalVisibility(false);
    return;
  }

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var product = getProduct(item.productId);

    if (!product) {
      // Product no longer exists, remove from cart
      continue;
    }

    var itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    // Check stock status
    var stockWarning = "";
    var quantityStyle = "";
    if (product.stock === 0) {
      stockWarning = '<br><span style="color:red;font-size:12px;">Out of stock - Remove to continue</span>';
      quantityStyle = 'style="background:#ffcccc;"';
      hasErrors = true;
    } else if (item.quantity > product.stock) {
      stockWarning = '<br><span style="color:orange;font-size:12px;">Only ' + product.stock + ' available</span>';
      quantityStyle = 'style="background:#fff3cd;"';
      hasErrors = true;
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><img src='" + product.image + "' alt='' width='80' onerror=\"this.src='https://via.placeholder.com/80'\"></td>" +
      "<td><h3>" + product.name + "</h3></td>" +
      "<td><p>" + (product.description.length > 50 ? product.description.substring(0, 50) + "..." : product.description) + "</p></td>" +
      "<td>$" + itemTotal.toFixed(2) + "</td>" +
      "<td>" + item.quantity + stockWarning + "</td>" +
      "<td><input type='number' value='" + item.quantity + "' min='1' max='" + product.stock + "' " + quantityStyle + " onInput=\"changeQuantity(this,'" + product.id + "')\"/></td>" +
      "<td><button onclick=\"removeProduct('" + product.id + "')\">Remove</button></td>";
    pTable.appendChild(tr);
  }

  totalElement.innerHTML = "Total: $" + totalPrice.toFixed(2);
  
  // Show/hide PayPal based on cart validity
  updatePayPalVisibility(!hasErrors && cart.length > 0);
  
  // Update place order button
  var placeOrderBtn = document.querySelector(".btn-confirm");
  if (placeOrderBtn) {
    if (hasErrors) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.opacity = "0.5";
      placeOrderBtn.title = "Fix stock issues before placing order";
    } else {
      placeOrderBtn.disabled = false;
      placeOrderBtn.style.opacity = "1";
      placeOrderBtn.title = "";
    }
  }
}

/**
 * Update PayPal button visibility
 */
function updatePayPalVisibility(show) {
  var paypalSection = document.getElementById("paypal-section");
  if (paypalSection) {
    paypalSection.style.display = show ? "block" : "none";
  }
}

/**
 * Validate quantity input
 */
function validateQuantity(quantity, maxStock) {
  var qty = parseInt(quantity);
  
  if (isNaN(qty)) {
    return { valid: false, error: "Please enter a valid number", value: 1 };
  }
  
  if (qty < 0) {
    return { valid: false, error: "Quantity cannot be negative", value: 1 };
  }
  
  if (qty === 0) {
    return { valid: true, error: "", value: 0, shouldRemove: true };
  }
  
  if (qty > maxStock) {
    return { valid: false, error: "Only " + maxStock + " available in stock", value: maxStock };
  }
  
  return { valid: true, error: "", value: qty };
}

/**
 * Change quantity with validation
 */
function changeQuantity(element, productId) {
  var cart = getCart();
  var product = getProduct(productId);
  
  if (!product) {
    alert("Product not found");
    return;
  }

  var validation = validateQuantity(element.value, product.stock);
  
  if (validation.shouldRemove) {
    var sure = confirm("Remove this item from cart?");
    if (sure) {
      removeProduct(productId);
      return;
    } else {
      element.value = 1;
      validation.value = 1;
    }
  }
  
  if (!validation.valid) {
    alert(validation.error);
    element.value = validation.value;
  }

  // Update cart
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId === productId) {
      cart[i].quantity = validation.value;
      break;
    }
  }

  saveCart(cart);
  renderCart();
}

/**
 * Remove product from cart
 */
function removeProduct(productId) {
  var cart = getCart();
  var updatedCart = [];

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].productId !== productId) {
      updatedCart.push(cart[i]);
    }
  }

  saveCart(updatedCart);
  renderCart();
}

/**
 * Continue shopping
 */
function continueShopping() {
  window.location.href = "products.html";
}

// ===========================
//  ORDER PLACEMENT
// ===========================

/**
 * Validate cart before checkout
 */
function validateCartForCheckout() {
  var cart = getCart();
  var errors = [];

  if (cart.length === 0) {
    return { valid: false, errors: ["Your cart is empty"] };
  }

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var product = getProduct(item.productId);

    if (!product) {
      errors.push("Product not found: " + item.productId);
      continue;
    }

    if (product.stock === 0) {
      errors.push(product.name + " is out of stock. Please remove it.");
    } else if (item.quantity > product.stock) {
      errors.push(product.name + ": Only " + product.stock + " available (you have " + item.quantity + ")");
    }
  }

  return { valid: errors.length === 0, errors: errors };
}

/**
 * Place order with validation
 */
function placeOrder() {
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("Please login to place an order");
    window.location.href = "../auth/login-register.html";
    return;
  }

  // Validate cart
  var validation = validateCartForCheckout();
  if (!validation.valid) {
    alert("Cannot place order:\n\n" + validation.errors.join("\n"));
    return;
  }

  var cart = getCart();

  // Calculate total
  var totalPrice = 0;
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var product = getProduct(item.productId);
    if (product) {
      totalPrice += product.price * item.quantity;
    }
  }

  // Confirm order
  var confirm_order = confirm("Place order for $" + totalPrice.toFixed(2) + "?\n\nPayment method: Cash on Delivery");
  if (!confirm_order) return;

  // Create order object
  var newOrder = {
    userId: currentUser.id || "unknown",
    customerName: currentUser.name || currentUser.email || "Customer",
    items: cart,
    total: totalPrice,
    status: "pending",
    paymentMethod: "Cash",
    date: new Date().toISOString(),
  };

  // Save to Firebase
  db.collection("orders")
    .add(newOrder)
    .then(function(docRef) {
      // Clear cart
      saveCart([]);
      alert("Order placed successfully!\n\nOrder ID: " + docRef.id.substring(0, 8) + "\n\nPlease wait for admin confirmation.");
      window.location.href = "orders.html";
    })
    .catch(function(error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    });
}

/**
 * Logout function
 */
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "../index.html";
}

// Start
init();
