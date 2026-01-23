// get all products data
var products = JSON.parse(localStorage.getItem('products')) || [];

// call getCart() function to display elements of cart
getCart();


// get data from cart and all products then display data
function getCart() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;
    const fullCartData = cart.map(item => {
        const productInfo = products.find(p => p.id == item.productId);
        if(productInfo) {
            totalPrice += productInfo.price * item.quantity;
        }
        return {
            ...productInfo,
            quantity: item.quantity
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
                    <button onclick='removeProduct(${cardObject.id})'>Remove Prouduct</button>
                </td>`
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
    }
    else {
        var sure = confirm("Are you sure you want to delete this item?");
        if (sure) {
            removeProduct(id)
        }
        else {
            element.value = 1;
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    getCart();

}


//remove item from cart
function removeProduct(id) {
    var cart = JSON.parse(localStorage.getItem("cart"));
    var updatedCart = cart.filter(item => item.productId != id);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    getCart();
}