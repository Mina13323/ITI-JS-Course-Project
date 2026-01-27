/**
 * Admin Orders Management
 * Description: Order viewing and status management with stock handling
 */

// ===========================
//  DOM ELEMENTS
// ===========================
var ordersBody = document.getElementById("orders-body");

// ===========================
//  INITIALIZATION
// ===========================
function init() {
  loadProducts(function() {
    loadOrders(function() {
      renderOrders();
    });
  });
}

// ===========================
//  RENDER FUNCTIONS
// ===========================

/**
 * Render orders table
 */
function renderOrders() {
  var orders = getOrders();
  var products = getProducts();
  ordersBody.innerHTML = "";

  if (orders.length === 0) {
    ordersBody.innerHTML = '<tr><td colspan="6" style="text-align:center">No orders yet</td></tr>';
    return;
  }

  // Sort orders by date (newest first)
  orders.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];

    // Build items text
    var itemsText = "";
    var hasStockIssue = false;
    
    for (var j = 0; j < order.items.length; j++) {
      var item = order.items[j];
      var productName = "Unknown Product";
      var currentStock = 0;
      
      for (var k = 0; k < products.length; k++) {
        if (products[k].id === item.productId) {
          productName = products[k].name;
          currentStock = products[k].stock;
          break;
        }
      }
      
      itemsText += productName + " x" + item.quantity;
      
      // Check if there's enough stock for pending orders
      if (order.status === "pending" && currentStock < item.quantity) {
        itemsText += ' <span style="color:red;">(Low stock!)</span>';
        hasStockIssue = true;
      }
      
      if (j < order.items.length - 1) {
        itemsText += ", ";
      }
    }

    // Status styling
    var statusColor = "orange";
    if (order.status === "confirmed") {
      statusColor = "green";
    } else if (order.status === "rejected") {
      statusColor = "red";
    }

    // Build action buttons based on status
    var actionButtons = "";
    if (order.status === "pending") {
      var confirmDisabled = hasStockIssue ? ' disabled title="Not enough stock"' : '';
      actionButtons = 
        '<button class="confirm-btn" onclick="handleConfirmOrder(\'' + order.id + '\')"' + confirmDisabled + '>Confirm</button> ' +
        '<button class="reject-btn" onclick="handleRejectOrder(\'' + order.id + '\')">Reject</button>';
    } else {
      actionButtons = '<span style="color:' + statusColor + ';font-weight:bold;">' + order.status.toUpperCase() + '</span>';
    }

    // Format date
    var orderDate = new Date(order.date).toLocaleDateString() + " " + new Date(order.date).toLocaleTimeString();

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + order.id.substring(0, 8) + "...</td>" +
      "<td>" + (order.customerName || order.userId || "Unknown") + "</td>" +
      "<td>" + itemsText + "</td>" +
      "<td>$" + order.total.toFixed(2) + "</td>" +
      '<td style="color:' + statusColor + ';font-weight:bold;">' + order.status.charAt(0).toUpperCase() + order.status.slice(1) + "</td>" +
      "<td>" + actionButtons + "</td>";
    ordersBody.appendChild(tr);
  }
}

// ===========================
//  ORDER ACTIONS
// ===========================

/**
 * Confirm an order with stock validation
 */
function handleConfirmOrder(orderId) {
  var orders = getOrders();
  var products = getProducts();
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

  // Check stock availability before confirming
  var stockErrors = [];
  for (var j = 0; j < order.items.length; j++) {
    var item = order.items[j];
    for (var k = 0; k < products.length; k++) {
      if (products[k].id === item.productId) {
        if (products[k].stock < item.quantity) {
          stockErrors.push(products[k].name + ": Only " + products[k].stock + " available (requested: " + item.quantity + ")");
        }
        break;
      }
    }
  }

  if (stockErrors.length > 0) {
    alert("Cannot confirm order due to insufficient stock:\n\n" + stockErrors.join("\n"));
    return;
  }

  // Confirm the order
  var ok = confirm("Confirm this order? Stock will be deducted.");
  if (!ok) return;

  updateOrderStatus(orderId, "confirmed", function() {
    renderOrders();
    alert("Order confirmed! Stock has been updated.");
  });
}

/**
 * Reject an order
 */
function handleRejectOrder(orderId) {
  var reason = prompt("Reason for rejection (optional):");
  
  var ok = confirm("Are you sure you want to reject this order?");
  if (!ok) return;

  updateOrderStatus(orderId, "rejected", function() {
    renderOrders();
    alert("Order rejected.");
  });
}

/**
 * Handle status change (for dropdown if used)
 */
function handleStatusChange(orderId, newStatus) {
  if (newStatus === "confirmed") {
    handleConfirmOrder(orderId);
  } else if (newStatus === "rejected") {
    handleRejectOrder(orderId);
  } else {
    updateOrderStatus(orderId, newStatus, function() {
      renderOrders();
      alert("Order status updated to " + newStatus + "!");
    });
  }
}

// Start the app
init();
