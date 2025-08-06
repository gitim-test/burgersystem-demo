// js/app.js

// Dados do sistema
let cart = [];
let orders = [
    {
        id: 1,
        items: [{ name: "Burger Clássico", quantity: 1, price: 29.90 }],
        total: 29.90,
        timestamp: new Date(Date.now() - 300000),
        status: "ready"
    }
];
let currentOrderNumber = 0;

// Mudar de tela
function showView(viewId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

// Atualizar carrinho
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-gray-500 py-4">Seu carrinho está vazio</p>';
        cartTotal.textContent = '0,00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <span>${item.name}</span>
            <div>
                <button onclick="updateQuantity(${index}, -1)" class="btn btn-secondary text-sm">−</button>
                <span class="mx-2">1</span>
                <button onclick="updateQuantity(${index}, 1)" class="btn btn-secondary text-sm">+</button>
                <button onclick="removeFromCart(${index})" class="text-red-500 ml-2">🗑️</button>
            </div>
            <span>R$ ${item.price.toFixed(2)}</span>
        `;
        cartItems.appendChild(itemEl);
    });

    cartTotal.textContent = total.toFixed(2).replace('.', ',');
}

// Adicionar ao carrinho
function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
}

// Atualizar quantidade
function updateQuantity(index, change) {
    // Neste exemplo, cada item é único
    if (change === -1) {
        removeFromCart(index);
    } else {
        cart.splice(index, 0, cart[index]);
        updateCart();
    }
}

// Remover do carrinho
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Finalizar pedido
function placeOrder() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    currentOrderNumber++;
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    orders.unshift({
        id: currentOrderNumber,
        items: cart.map(item => ({ name: item.name, quantity: 1, price: item.price })),
        total: total,
        timestamp: new Date(),
        status: 'pending'
    });

    cart = [];
    updateCart();
    showSuccessModal(currentOrderNumber);
    updateKitchenOrders();
}

// Mostrar modal de sucesso
function showSuccessModal(orderNumber) {
    document.getElementById('success-order-number').textContent = orderNumber.toString().padStart(3, '0');
    document.getElementById('success-modal').classList.remove('hidden');
}

// Fechar modal
function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

// Abas do admin
function showAdminTab(tab) {
    document.getElementById('admin-products').classList.add('hidden');
    document.getElementById('admin-categories').classList.add('hidden');
    document.getElementById('admin-orders').classList.add('hidden');
    document.getElementById('admin-' + tab).classList.remove('hidden');
}

// Atualizar pedidos na cozinha
function updateKitchenOrders() {
    const container = document.getElementById('kitchen-orders');
    container.innerHTML = '';

    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">Nenhum pedido em andamento</p>';
        return;
    }

    activeOrders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-item';
        orderEl.innerHTML = `
            <div class="flex justify-between mb-3">
                <h4 class="font-semibold">Pedido #${order.id.toString().padStart(3, '0')}</h4>
                <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="space-y-1 mb-3">
                ${order.items.map(i => `<div>${i.quantity}x ${i.name}</div>`).join('')}
            </div>
            <div class="flex gap-2">
                ${order.status === 'pending' ? 
                    `<button onclick="updateOrderStatus(${order.id}, 'ready')" class="btn btn-primary w-full">Pronto</button>` : 
                    order.status === 'ready' ? 
                    `<button onclick="updateOrderStatus(${order.id}, 'called')" class="btn btn-primary w-full">Chamar Cliente</button>` : 
                    ''}
            </div>
        `;
        container.appendChild(orderEl);
    });
}

// Atualizar status do pedido
function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        updateKitchenOrders();
        updateAdminOrders();
        updateCounterView();
    }
}

// Texto do status
function getStatusText(status) {
    const map = {
        pending: 'Em Preparo',
        ready: 'Pronto',
        called: 'Cliente Chamado',
        delivered: 'Entregue'
    };
    return map[status] || status;
}

// Atualizar pedidos no admin
function updateAdminOrders() {
    const container = document.getElementById('admin-order-list');
    container.innerHTML = '';

    orders.forEach(order => {
        const el = document.createElement('div');
        el.className = 'order-item';
        el.innerHTML = `
            <div class="flex justify-between mb-2">
                <span>Pedido #${order.id.toString().padStart(3, '0')}</span>
                <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="text-sm text-gray-600">R$ ${order.total.toFixed(2)}</div>
        `;
        container.appendChild(el);
    });
}

// Atualizar tela do balcão
function updateCounterView() {
    const container = document.getElementById('counter-orders');
    container.innerHTML = '';

    const calledOrders = orders.filter(o => o.status === 'called');
    
    if (calledOrders.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhum cliente chamado</p>';
        return;
    }

    calledOrders.forEach(order => {
        const el = document.createElement('div');
        el.className = 'p-4 bg-blue-50 rounded-lg mb-3';
        el.innerHTML = `
            <div class="font-bold text-blue-900">Pedido #${order.id.toString().padStart(3, '0')}</div>
            <button onclick="deliverOrder(${order.id})" class="btn btn-primary w-full mt-2">Entregue</button>
        `;
        container.appendChild(el);
    });
}

// Entregar pedido
function deliverOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'delivered';
        updateCounterView();
        updateKitchenOrders();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    updateKitchenOrders();
    updateAdminOrders();
    updateCounterView();
});