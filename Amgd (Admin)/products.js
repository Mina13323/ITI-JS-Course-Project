import { initStorage, getProducts, saveProducts, getCategories, resetStorage } from "./storage.js";
initStorage();



// Render Products

const productsBody = document.getElementById("products-body");
function renderProducts(){
  let allProducts = getProducts()
  const allCategories = getCategories()
  productsBody.innerHTML = ""
  for(let product of allProducts){
    const category = allCategories.find(cat => cat.id === product.categoryId)
    const catName = category ? category.name : "Unknown"
    let tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${product.id}</td>
    <td>${product.name}</td>
    <td>${product.image !== "-" ? `<img src="${product.image}" width="50">` : "-"}</td>
    <td>${product.description !== "-" ? product.description : "-"}</td>
    <td>${product.price}</td>
    <td>${product.stock}</td>
    <td>${catName}</td>
    <td>
      <button class="edit-btn" onClick="editProduct(${product.id})">Edit</button>
      <button class="delete-btn" onClick="deleteProduct(${product.id})">Delete</button>
    </td>
    `
    productsBody.appendChild(tr)
  }
}

// Render Categories Options
const categorySelect = document.getElementById("product-category")
function renderCatOptions(){
  if(!categorySelect) return;
  const categories = getCategories();
  categorySelect.innerHTML = `<option value="0">-- Select a Category --</option>`
  categories.forEach(cat => {
    const option = document.createElement("option")
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option)
  })
}
renderCatOptions()

// Delete Product 
function deleteProduct(productId){
  const ok = confirm("Are You sure you want to delete this product?");
  if(!ok) return;
  const allProducts = getProducts();
  const newProducts = allProducts.filter(product => product.id != productId);
  saveProducts(newProducts)
  renderProducts()
}
window.deleteProduct = deleteProduct;


// Add & Edit Product
const addProductBtn = document.getElementById("add-product-btn");
const productForm = document.getElementById("product-form");
let editingProductId = null;
function editProduct(productId){
  productForm.style.display = "block"
  const products = getProducts()
  const product = products.find(p => p.id === productId)
  if(!product) return;
  productForm.elements["name"].value = product.name;
  productForm.elements["price"].value = product.price;
  productForm.elements["stock"].value = product.stock;
  productForm.elements["category"].value = product.categoryId;
  productForm.elements["description"].value = product.description && product.description !== "-" ? product.description : "-";
  productForm.elements["image"].value = product.image && product.image !== "-" ? product.image : "-";

  editingProductId = productId;
  productForm.querySelector("button[type='submit']").textContent = "Update"
}
window.editProduct =editProduct;


addProductBtn.addEventListener("click", function(){
  const isHidden = productForm.style.display === "none";
  productForm.style.display = isHidden ? "block" : "none";
  addProductBtn.textContent = isHidden  ? "Close Form" : "Add Product"
})


productForm.addEventListener("submit", function(e){
  e.preventDefault()
  // Inputs
  const productName = e.target.elements["name"].value.trim().replace(/\s+/, " ");
  const price = Number(e.target.elements["price"].value);
  const stock = Number(e.target.elements["stock"].value);
  const categoryId = Number(e.target.elements["category"].value);
  const description = e.target.elements["description"].value.trim();
  const image = e.target.elements["image"].value.trim();
  // Name Validation
  let isNameValid = false
  const nameErr = document.getElementById("name-error");
  if(productName.length < 3){
    nameErr.innerHTML = "Product name must be more than 3 Characters"
  } else {
    nameErr.innerHTML = ""
    isNameValid = true
  }
  // Price Validation
  let isPriceValid = false;
  const priceErr = document.getElementById("price-error");
  if(price <= 0){
    priceErr.innerHTML = "Price must be greater than Zero"
  } else{
    priceErr.innerHTML = ""
    isPriceValid = true;
  }
 
  // Desc Validation
  let isDescValid = false;
  let descErr = document.getElementById("description-error");
  if(description.length < 5){
      descErr.textContent = "Description must be at least 5 characters";
  }else{
      descErr.textContent = "";
      isDescValid = true;
  }
  // Stock Validation
  let isStockValid = false;
  const stockErr = document.getElementById("stock-error");
  if(stock < 0){
    stockErr.innerHTML = "Stock must be 0 or greater";
  }
  else {
    stockErr.innerHTML = ""
    isStockValid = true;
  }
  // Category Validation
  let isCatValid = false;
  const catErr = document.getElementById("category-error");
  if(categoryId === 0){
    catErr.innerHTML = "Please Select A Category"
  } else {
    catErr.innerHTML = ""
    isCatValid = true;
  }
  // Save Product
  if(isNameValid && isCatValid && isPriceValid && isStockValid){
    const allProducts = getProducts();
    // Add
    if(editingProductId === null){
      const newProduct = {
      id: Date.now(),
      name: productName,
      image: image || "-",
      description: description || "-",
      price,
      stock,
      categoryId,
    }
    allProducts.push(newProduct)
    } 
    // Edit
    else {
      const index = allProducts.findIndex(p => p.id === editingProductId);
      allProducts[index] = {
        ...allProducts[index],
        name: productName,
        image: image || "-",
        description: description || "-",
        price,
        stock,
        categoryId
      }
    }
   
    saveProducts(allProducts);
    renderProducts();
    e.target.reset();
    editingProductId = null;
    productForm.querySelector("button[type='submit']").textContent = "Add"
  }
})

// Cancel 
let cancelBtn = document.getElementById("cancel-btn");
cancelBtn.addEventListener("click", function(){
  editingProductId = null;
  productForm.reset()
  productForm.querySelector("button[type='submit']").textContent = "Add";
  document.getElementById("name-error").textContent = ""
  document.getElementById("price-error").textContent = ""
  document.getElementById("stock-error").textContent = ""
  document.getElementById("category-error").textContent = ""
})

renderProducts()