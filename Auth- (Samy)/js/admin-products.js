/**********************************\\
|        PRODUCT FUNCTIONS          |
\\**********************************/
// renderProducts() Fetches product data from storage and generates an HTML table row for each item. 
//     It displays details like image, name, price, and stock, and includes "Edit" and "Delete" buttons for each row.
// saveProduct() Handles both creating and updating products. It validates inputs (ensuring price and stock are numbers). 
//     If a hidden Product ID exists, it updates the existing entry.
//     If no ID exists, it generates a new unique ID (using Date.now()) and creates a new entry.
// deleteProduct(id) Asks the user to confirm, then permanently removes the product 
//     with the matching ID from localStorage and re-renders the table.
// editProduct(id) Locates a specific product by its ID and populates the form fields with its current data. 
//     It also changes the submit button text to "Update Product" to indicate editing mode.
// resetProdForm() Clears all text from the product input fields and error messages.
//     It resets the interface back to "Create New Product" mode.

// Render on page load
function renderProducts() {
    // 1. get the product array
    var products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    // 2. get and clear the table
    var tbody = document.getElementById('productTableBody');
    tbody.innerHTML = "";
    // 3. loop through the products and display each one
    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        tbody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" width="50"></td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `;
    }
}

// Save
function saveProduct() {
    // 0. Get the new product values
    var id = document.getElementById('productId').value;
    var name = document.getElementById('productName').value;
    var image = document.getElementById('productImage').value;
    var price = document.getElementById('productPrice').value;
    var stock = document.getElementById('productStock').value;
    var category = document.getElementById('productCategory').value;
    var description = document.getElementById('productDescription').value;
    var error = document.getElementById('productError');
    // 1. Validations
    // -Numeric inputs regex patterns
    var priceRegex = /^\d+(\.\d{1,2})?$/; // Allow "10" or "10.50"
    var stockRegex = /^\d+$/;             // Allow only whole numbers
    // a. Check Empty Fields
    if (name == "" || image == "" || category == "" || description == "") {
        error.innerText = "Please fill in all text fields.";
        return;
    }
    // b. Check Price
    if (!priceRegex.test(price) || parseFloat(price) <= 0) {
        error.innerText = "Price must be a valid positive number.";
        return;
    }
    // c. Check Stock
    if (!stockRegex.test(stock)) {
        error.innerText = "Stock must be a whole number.";
        return;
    }
    // 3. get the products array
    var products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    // 4. Update or Create a product
    if (id) {
        // UPDATE a Product
        for (var i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                products[i].name = name;
                products[i].image = image;
                products[i].price = price;
                products[i].stock = stock;
                products[i].category = category;
                products[i].description = description;
            }
        }
    } else {
        // CREATE new Product
        var newProd = {
            id: Date.now(),
            name: name,
            image: image,
            price: price,
            stock: stock,
            category: category,
            description: description
        };
        products.push(newProd);
    }
    // 5. Save the products new array
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    // 6. Refresh
    resetProdForm();
    renderProducts();
}

// Delete
function deleteProduct(id) {
    // 1. Confirm desire for deletion
    if (!confirm("Are you sure?")) return;
    // 2. Get the products array
    var products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    // 3. new Array to hold products except the one we want to delete
    var newProds = [];
    for (var i = 0; i < products.length; i++) {
        if (products[i].id != id) newProds.push(products[i]);
    }
    // 4. Save the new array to local storage
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProds));
    // 5. Refresh
    renderProducts();
}

// Edit
function editProduct(id) {
    // 1. Get the products array
    var products = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    // 2. Find the desired product
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id == id) product = products[i];
    }
    // 3. If found
    if (product) {
        // Fill the form and change button and title text
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;

        document.getElementById('saveBtn').innerText = "Update Product";
        document.getElementById('formTitle').innerText = "Edit Product ID: " + product.id;
    }
}

// Reset
function resetProdForm() {
    // Empty the form and change button and title text
    document.getElementById('productId').value = "";
    document.getElementById('productName').value = "";
    document.getElementById('productImage').value = "";
    document.getElementById('productPrice').value = "";
    document.getElementById('productStock').value = "";
    document.getElementById('productCategory').value = "";
    document.getElementById('productDescription').value = "";
    document.getElementById('productError').innerText = "";

    document.getElementById('saveBtn').innerText = "Create Product";
    document.getElementById('formTitle').innerText = "Add New Product";
}





/**********************************\\
|          ORDER FUNCTIONS          |
\\**********************************/
// renderOrders() Displays a list of orders in a table. 
//     It applies color coding based on status (pending, confirmed, etc.) 
//     and dynamically shows action buttons depending on the order's current state.
// updateOrderStatus(orderId, newStatus) Finds a specific order in the database and 
//     updates its status property (e.g., changing 'pending' to 'confirmed'). 
//     It then saves the change and re-renders the order table.

function renderOrders() {
    // 1. Get the orders array
    var orders = JSON.parse(localStorage.getItem(ORDERS_KEY));
    // 2. Get the tbody for display
    var tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = "";

    if (orders.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No orders found.</td></tr>";
        return;
    }

    for (var i = 0; i < orders.length; i++) {
        var o = orders[i];
        // Status color logic
        var statusColor = o.status === 'pending' ? 'orange' : (o.status === CONFIRMED ? 'green' : 'red');

        var actionButtons = "";
        if (o.status === 'pending') {
            actionButtons = `
                <button class="btn-small confirm-btn" onclick="updateOrderStatus(${o.id}, ${CONFIRMED})">Confirm</button>
                <button class="btn-small delete-btn" onclick="updateOrderStatus(${o.id}, ${REJECTED})">Reject</button>
            `;
        } else {
            actionButtons = "Completed";
        }

        // Return logic
        if (o.status === 'return_requested') {
            actionButtons = `
                <button class="btn-small delete-btn" onclick="updateOrderStatus(${o.id}, 'returned')">Confirm Return</button>
            `;
        }

        tbody.innerHTML += `
            <tr>
                <td>${o.id}</td>
                <td>${o.userId}</td>
                <td>$${o.total}</td>
                <td style="color:${statusColor}; font-weight:bold;">${o.status}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }
}

// Update Order Status
function updateOrderStatus(orderId, newStatus) {
    var orders = JSON.parse(localStorage.getItem('orders'));
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == orderId) {
            orders[i].status = newStatus;
        }
    }
    localStorage.setItem('orders', JSON.stringify(orders));
    if (typeof renderOrders === 'function') {
        renderOrders();
    }
}
