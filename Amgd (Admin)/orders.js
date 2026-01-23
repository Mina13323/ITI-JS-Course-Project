import { getOrders, getProducts, saveOrders, resetStorage } from "./storage.js";
// resetStorage()
const ordersBody = document.getElementById("orders-body")

function renderOrders(){
    const orders = getOrders();
    const products = getProducts();
    ordersBody.innerHTML = ""
    for(let order of orders){
        const itemStr = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const name = product ? product.name : "unknown product";
            return `${name} x ${item.quantity}`
        })
        let tr = document.createElement("tr")
        tr.innerHTML = `
        <td>${order.id}</td>
        <td>${order.customerName}</td>
        <td>${itemStr}</td>
        <td>${order.status}</td>
        <td>
            <button class="confirm-btn" data-id="${order.id}" ${order.status !== "pending" ? "disabled" : ""}>Confirm</button>
            <button class="reject-btn" data-id="${order.id}" ${order.status !== "pending" ? "disabled" : ""}>Reject</button>
        </td>
        `
        ordersBody.appendChild(tr)
    }
}

// Event Delegation
ordersBody.addEventListener("click", function(e){
    const btn = e.target;
    const orderId = Number(btn.dataset.id)
    if(!orderId) return;
    if(e.target.classList.contains("confirm-btn")){
        confirmOrder(orderId)
    }
    if(e.target.classList.contains("reject-btn")){
        rejectOrder(orderId)
    }
})

function rejectOrder(orderId){
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if(index === -1) return;
    if(orders[index].status == "pending"){
        orders[index] = {
            ...orders[index],
            status: "rejected"
        }
    } else{
        return
    }
    saveOrders(orders)
    renderOrders()
}

function confirmOrder(orderId){
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if(index === -1) return;
    if(orders[index].status == "pending"){
        orders[index] = {
            ...orders[index],
            status: "confirmed"
        }
    } else{
        return
    }
    saveOrders(orders)
    renderOrders()
}
renderOrders()
