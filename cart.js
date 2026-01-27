// get all products data
var products = JSON.parse(localStorage.getItem("products")) || [];

// call getCart() function to display elements of cart
getCart();

// get data from cart and all products then display data
function getCart() {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalPrice = 0;
  const fullCartData = cart.map((item) => {
    const productInfo = products.find((p) => p.id == item.productId);
    if (productInfo) {
      totalPrice += productInfo.price * item.quantity;
    }
    return {
      ...productInfo,
      quantity: item.quantity,
    };
  });
  displayData(fullCartData);
  document.querySelector("#totalAmount").innerText = `Total: ${totalPrice} EGP`;
}

//create card as table row to insert to created table of cart
function createProductCard(cardObject) {
  return `<td><img src=${cardObject.image} alt=''></td>
                <td><h3>${cardObject.name}</h3></td>
                <td><p>${cardObject.description}</p></td>
                <td>${parseInt(cardObject.price) * parseInt(cardObject.quantity)}</td>
                <td>${parseInt(cardObject.quantity)}</td>
                <td>
                    <input type='number' value='${cardObject.quantity}' onInput="changeValue(this,${cardObject.id})"/>
                </td>
                <td>
                    <button onclick='removeProduct(${cardObject.id})'>Remove Product</button>
                </td>`;
}

// display data in the table
function displayData(fullCartData) {
  var pTable = document.querySelector("#ProductsTable>tbody");
  pTable.innerHTML = "";
  for (const pro of fullCartData) {
    var tr = document.createElement("tr");
    tr.innerHTML = createProductCard(pro);
    pTable.appendChild(tr);
  }
}

// update quantity and total prices
function changeValue(element, id) {
  var cart = JSON.parse(localStorage.getItem("cart"));

  if (element.value != 0) {
    for (var i of cart) {
      if (i.productId == id) {
        i.quantity = parseInt(element.value);
        break;
      }
    }
  } else {
    var sure = confirm("Are you sure you want to delete this item?");
    if (sure) {
      removeProduct(id);
    } else {
      element.value = 1;
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  getCart();
}

//remove item from cart
function removeProduct(id) {
  var cart = JSON.parse(localStorage.getItem("cart"));
  var updatedCart = cart.filter((item) => item.productId != id);

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  getCart();
}

// navigate back to products page
function continueShopping() {
  window.location.href = "ITI-JS-Course-Project/customer/products.html";
}

// place order and save to orders
function placeOrder() {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("Please login to place an order");
    window.location.href = "ITI-JS-Course-Project/auth/login-register.html";
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  // Calculate total
  var products = JSON.parse(localStorage.getItem("products")) || [];
  var totalPrice = 0;
  for (var item of cart) {
    var productInfo = products.find((p) => p.id == item.productId);
    if (productInfo) {
      totalPrice += productInfo.price * item.quantity;
    }
  }

  // Create order object
  var orders = JSON.parse(localStorage.getItem("orders")) || [];
  var newOrder = {
    id: Date.now(),
    userId: currentUser.id,
    customerName: currentUser.name,
    items: cart,
    total: totalPrice,
    status: "pending",
    date: new Date().toISOString(),
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("cart", JSON.stringify([]));

  alert("Order placed successfully! Wait for admin confirmation.");
  window.location.href = "ITI-JS-Course-Project/customer/orders.html";
}
