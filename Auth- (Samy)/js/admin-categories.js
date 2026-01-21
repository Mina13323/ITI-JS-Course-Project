// ===========================
// ADMIN PAGE LOGIC 
// ===========================
//  General Logic - loadAdminData() Initializes the dashboard.
//      It calls all the necessary render functions immediately upon page load to display 
//      categories, products, and orders, and populates the category dropdown menu.

function loadAdminData() {
    renderCategories();
    renderProducts();
    renderOrders();
    populateCategorySelect();
}

/**********************************\\
|        CATEGORY FUNCTIONS         |
\\**********************************/
//  renderCategories() - Retrieves the list of categories from localStorage and displays them as a list of badges.
//      It appends a small "x" link to each badge to allow deletion. 
//  addCategory() - Reads the value from the category input field. 
//      It validates that the input isn't empty, adds the new category to the stored array, saves it back to localStorage, and refreshes the page data.
//  deleteCategory(catName) - Prompts the user for confirmation, then filters the stored array to remove the specific category name.
//      It saves the updated list and refreshes the view. 
//  populateCategorySelect() - Retrieves current categories and dynamically generates HTML <option> tags
//      for the "Select Category" dropdown menu found in the product form.

// Render on page load
function renderCategories() {
    // 1. Get the categories array
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    // 2. Get the html container and clear it
    var container = document.getElementById('categoryList');
    container.innerHTML = "Current Categories: ";
    // 3. Loop through the categories array and display them
    for (var i = 0; i < categories.length; i++) {
        container.innerHTML += `
        <span style="background:#ddd; padding:5px; margin:5px;">${categories[i]}
            <a href="#" onclick="deleteCategory('${categories[i]}')" style="color:red; text-decoration:none;">
                x
            </a>
        </span>
        `;
    }
}

// Add
function addCategory() {
    // 1. get the input field
    var input = document.getElementById('categoryInput');
    // 2. get the category name the admin wants to add
    var categoryValue = input.value;
    // 3. warn if empty category name
    if (categoryValue === "") { alert("Enter a category name"); return; }
    // 4. get the categories array
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    // 5. add the new category to the array
    categories.push(categoryValue);
    // 6. save the array to local storage
    localStorage.setItem('categories', JSON.stringify(categories));
    // 7. clear the input field
    input.value = "";
    // 8. refresh
    loadAdminData();
}

// Delete
function deleteCategory(categoryName) {
    // 1. confirm desire for deletion 
    if (!confirm("Delete category: " + categoryName + "?")) return;
    // 2. get the categories array
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    // 3. array to hold categories except the one we want to delete
    var newCategories = [];
    // 4. add those categories
    for (var i = 0; i < categories.length; i++) { if (categories[i] !== categoryName) newCategories.push(categories[i]); }
    // 5. save the new categories to local storage
    localStorage.setItem('categories', JSON.stringify(newCategories));
    // 6. refresh
    loadAdminData();
}

// Populate Selection
function populateCategorySelect() {
    // 1. get the categories array
    var categories = JSON.parse(localStorage.getItem('categories')) || [];
    // 2. get the select element
    var select = document.getElementById('productCategory');
    // 3. clear the select element
    select.innerHTML = '<option value="">Select Category</option>';
    // 4. add the categories as option elements
    for (var i = 0; i < categories.length; i++) {
        select.innerHTML += `<option value="${categories[i]}">${categories[i]}</option>`;
    }
}