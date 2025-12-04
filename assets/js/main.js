// Estado da aplicação
let currentStep = 1;
let cart = JSON.parse(localStorage.getItem('familia_cart')) || [];
let selectedZone = localStorage.getItem('familia_zone') || 'sul';
let deliveryFee = 0;
let customerData = JSON.parse(localStorage.getItem('familia_customer')) || {
    name: '',
    phone: '',
    address: '',
    complement: '',
    payment: 'PIX'
};

// Dados dos produtos (Exemplo)
const products = {
    1: { name: "Açúcar Mascavo Unão 1kg", price: 22.49, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Açucar" },
    2: { name: "Arroz Camil Tipo 1 1kg", price: 3.85, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Arroz" },
    3: { name: "Feijão Carioca Brasileirinho 1kg", price: 4.50, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Feijao" },
    4: { name: "Farinha de Mandioca Soberano 1kg", price: 4.40, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Farinha" },
    5: { name: "Atum Gomes Ralado Natural 170g", price: 5.90, category: "carnes", img: "https://via.placeholder.com/150x150?text=Atum" },
    6: { name: "Carne Mista Desfiar Target 320g", price: 8.68, category: "carnes", img: "https://via.placeholder.com/150x150?text=Carne" },
    7: { name: "Almôndegas ao Molho Target 420g", price: 8.70, category: "carnes", img: "https://via.placeholder.com/150x150?text=Almondegas" },
    8: { name: "Água Sanitária Limpax 1L", price: 3.99, category: "limpeza", img: "https://via.placeholder.com/150x150?text=Agua+Sanitaria" },
    9: { name: "Sabão em Pó Omo Lavagem Perfeita 1,6kg", price: 28.90, category: "limpeza", img: "https://via.placeholder.com/150x150?text=Sabao+Po" },
    10: { name: "Refrigerante Coca-Cola 2L", price: 8.50, category: "bebidas", img: "https://via.placeholder.com/150x150?text=Coca-Cola" },
    11: { name: "Cerveja Heineken Long Neck 330ml", price: 6.99, category: "bebidas", img: "https://via.placeholder.com/150x150?text=Heineken" },
    12: { name: "Shampoo Anticaspa Clear 400ml", price: 24.99, category: "higiene", img: "https://via.placeholder.com/150x150?text=Shampoo" },
    13: { name: "Sabonete Líquido Palmolive 250ml", price: 7.90, category: "higiene", img: "https://via.placeholder.com/150x150?text=Sabonete" },
    14: { name: "Banana Prata (kg)", price: 7.99, category: "hortifruti", img: "https://via.placeholder.com/150x150?text=Banana" },
    15: { name: "Tomate Italiano (kg)", price: 6.50, category: "hortifruti", img: "https://via.placeholder.com/150x150?text=Tomate" },
    16: { name: "Leite Integral Tirol 1L", price: 4.99, category: "frios", img: "https://via.placeholder.com/150x150?text=Leite" },
    17: { name: "Manteiga Aviação 200g", price: 12.90, category: "frios", img: "https://via.placeholder.com/150x150?text=Manteiga" }
};

// =================== ELEMENTOS DOM ===================
const floatingCart = document.getElementById('floating-cart');
const floatingCartToggle = document.getElementById('floating-cart-toggle');
const floatingCartClose = document.getElementById('floating-cart-close');
const floatingCartBody = document.getElementById('floating-cart-body');
const floatingCartTotal = document.getElementById('floating-cart-total');
const cartCountBadge = document.getElementById('cart-count-badge');
const checkoutButton = document.getElementById('checkout-button');
const clearCartBtn = document.getElementById('clear-cart-btn');
const productListSection = document.getElementById('product-list-section');
const checkoutSteps = document.getElementById('checkout-steps');
const notificationToast = document.getElementById('notification-toast');
const toastMessage = document.getElementById('toast-message');

// =================== FUNÇÕES DE UTILIDADE ===================

function showToast(message) {
    toastMessage.textContent = message;
    notificationToast.classList.add('show');
    setTimeout(() => {
        notificationToast.classList.remove('show');
    }, 3000);
}

function updateLocalStorage() {
    localStorage.setItem('familia_cart', JSON.stringify(cart));
    localStorage.setItem('familia_zone', selectedZone);
    localStorage.setItem('familia_customer', JSON.stringify(customerData));
}

function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

// =================== FUNÇÕES DO CARRINHO ===================

function addToCart(productId) {
    const productInfo = products[productId];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productInfo.name,
            price: productInfo.price,
            quantity: 1
        });
    }

    updateFloatingCart();
    showToast(`"${productInfo.name}" adicionado ao carrinho!`);
    updateLocalStorage();
}

function clearCart() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        cart = [];
        updateFloatingCart();
        updateLocalStorage();
        showToast('Carrinho limpo com sucesso.');
    }
}

function calculateDeliveryFee(zone) {
    switch (zone) {
        case 'sul':
            return 8.00;
        case 'leste':
            return 12.00;
        case 'norte':
            return 15.00;
        default:
            return 0.00;
    }
}

function updateFloatingCart() {
    floatingCartBody.innerHTML = '';
    deliveryFee = calculateDeliveryFee(selectedZone);

    if (cart.length === 0) {
        floatingCartBody.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Carrinho vazio</p>';
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItemHTML = `
                <div class="floating-cart-item">
                    <div class="floating-cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="floating-cart-item-quantity">Qtd: ${item.quantity}</div>
                    </div>
                    <div class="floating-cart-item-price">R$ ${formatPrice(itemTotal)}</div>
                </div>
            `;
            floatingCartBody.innerHTML += cartItemHTML;
        });
    }
    
    // Calcular total
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let total = subtotal + deliveryFee;

    // Adiciona o item da taxa de entrega
    if (subtotal > 0) {
        const deliveryFeeHTML = `
            <div class="floating-cart-item">
                <div class="floating-cart-item-info">
                    <h4>Taxa de Entrega (${selectedZone.toUpperCase()})</h4>
                </div>
                <div class="floating-cart-item-price">R$ ${formatPrice(deliveryFee)}</div>
            </div>
        `;
        floatingCartBody.innerHTML += deliveryFeeHTML;
    }

    floatingCartTotal.textContent = `R$ ${formatPrice(total)}`;
    
    // Atualizar badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;
    
    // Atualizar botão de limpar carrinho
    clearCartBtn.disabled = cart.length === 0;
}

// =================== FUNÇÕES DE RENDERIZAÇÃO ===================

function renderProducts() {
    // Agrupa produtos por categoria
    const categories = Object.values(products).reduce((acc, product) => {
        const categoryKey = product.category;
        if (!acc[categoryKey]) {
            acc[categoryKey] = [];
        }
        acc[categoryKey].push(product);
        return acc;
    }, {});

    // Renderiza o grid para cada categoria
    for (const category in categories) {
        const gridElement = document.getElementById(`grid-${category}`);
        if (gridElement) {
            gridElement.innerHTML = categories[category].map(product => `
                <div class="product-card-v2" id="product-${product.id}">
                    <div class="product-image-v2">
                        <img src="${product.img}" alt="${product.name}" loading="lazy">
                    </div>
                    <h3>${product.name}</h3>
                    <div class="product-price">
                        R$ ${formatPrice(product.price)}<small> / uni</small>
                    </div>
                    <button class="add-to-cart-v2" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </div>
            `).join('');
        }
    }
}

// =================== FUNÇÕES DO CHECKOUT ===================

function renderStep1() {
    // Renderiza a seleção de zona de entrega
    const step1HTML = `
        <div class="step-header">
            <h2>Passo 1: Seleção de Zona e Carrinho</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)" ${cart.length === 0 ? 'disabled' : ''}>Próximo <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="step-content">
            <h3>Selecione sua Zona de Entrega (Porto Velho):</h3>
            <div class="zone-selector">
                <div class="zone-option ${selectedZone === 'sul' ? 'selected' : ''}" data-zone="sul">
                    Zona Sul (R$ ${formatPrice(calculateDeliveryFee('sul'))})
                </div>
                <div class="zone-option ${selectedZone === 'leste' ? 'selected' : ''}" data-zone="leste">
                    Zona Leste (R$ ${formatPrice(calculateDeliveryFee('leste'))})
                </div>
                <div class="zone-option ${selectedZone === 'norte' ? 'selected' : ''}" data-zone="norte">
                    Zona Norte (R$ ${formatPrice(calculateDeliveryFee('norte'))})
                </div>
            </div>

            <h3>Resumo do Carrinho:</h3>
            <div class="cart-summary-step1">
                <span>Subtotal: R$ ${formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                <span>Taxa de Entrega: R$ ${formatPrice(deliveryFee)}</span>
                <span style="color: var(--primary);">Total: R$ ${formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryFee)}</span>
            </div>
            
            <p style="margin-top: 20px; text-align: center;"><button onclick="closeCheckout(true)" style="background: none; color: var(--danger); font-weight: 600;">Editar Produtos</button></p>
        </div>
    `;
    checkoutSteps.innerHTML = step1HTML;

    // Adiciona evento de clique para seleção de zona
    document.querySelectorAll('.zone-option').forEach(zoneDiv => {
        zoneDiv.addEventListener('click', () => {
            document.querySelectorAll('.zone-option').forEach(el => el.classList.remove('selected'));
            zoneDiv.classList.add('selected');
            selectedZone = zoneDiv.dataset.zone;
            updateFloatingCart(); // Atualiza a taxa de entrega e total
            renderStep1(); // Rerenderiza o passo 1
            updateLocalStorage();
        });
    });
}

function renderStep2() {
    const step2HTML = `
        <div class="step-header">
            <h2>Passo 2: Dados Pessoais e Pagamento</h2>
            <div class="step-navigation">
                <button onclick="changeStep(1)"><i class="fas fa-arrow-left"></i> Anterior</button>
                <button onclick="changeStep(3)">Próximo <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="step-content">
            <form id="customer-form">
                <h3>Dados de Contato e Entrega</h3>
                <div class="form-group">
                    <label for="name">Nome Completo</label>
                    <input type="text" id="name" name="name" value="${customerData.name}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Telefone (WhatsApp)</label>
                    <input type="tel" id="phone" name="phone" value="${customerData.phone}" required>
                </div>
                <div class="form-group">
                    <label for="address">Endereço de Entrega (Rua, Número)</label>
                    <input type="text" id="address" name="address" value="${customerData.address}" required>
                </div>
                <div class="form-group">
                    <label for="complement">Complemento (Ex: Apartamento, Bloco)</label>
                    <input type="text" id="complement" name="complement" value="${customerData.complement}">
                </div>

                <h3>Forma de Pagamento</h3>
                <div class="payment-options">
                    <div>
                        <input type="radio" id="pix" name="payment" value="PIX" ${customerData.payment === 'PIX' ? 'checked' : ''} required hidden>
                        <label for="pix"><i class="fas fa-qrcode"></i> PIX (Recomendado)</label>
                    </div>
                    <div>
                        <input type="radio" id="card" name="payment" value="Cartão" ${customerData.payment === 'Cartão' ? 'checked' : ''} hidden>
                        <label for="card"><i class="fas fa-credit-card"></i> Cartão (Débito/Crédito na entrega)</label>
                    </div>
                    <div>
                        <input type="radio" id="cash" name="payment" value="Dinheiro" ${customerData.payment === 'Dinheiro' ? 'checked' : ''} hidden>
                        <label for="cash"><i class="fas fa-money-bill-wave"></i> Dinheiro (Troco para?)</label>
                    </div>
                </div>
            </form>
        </div>
    `;
    checkoutSteps.innerHTML = step2HTML;
    
    // Adiciona evento para salvar dados ao digitar/selecionar
    document.getElementById('customer-form').addEventListener('input', (e) => {
        customerData[e.target.name] = e.target.value;
        updateLocalStorage();
    });
}

function renderStep3() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    const itemsList = cart.map(item => `- ${item.name} (${item.quantity}x) - R$ ${formatPrice(item.price * item.quantity)}`).join('\n');

    const whatsappMessage = `
Olá, Supermercado Família! Gostaria de fazer meu pedido:

*--- ITENS DO PEDIDO ---*
${itemsList}

*--- INFORMAÇÕES DE ENTREGA ---*
*Zona de Entrega:* ${selectedZone.toUpperCase()} (Taxa: R$ ${formatPrice(deliveryFee)})
*Nome:* ${customerData.name}
*Telefone:* ${customerData.phone}
*Endereço:* ${customerData.address}
*Complemento:* ${customerData.complement || 'Nenhum'}

*--- VALORES E PAGAMENTO ---*
*Subtotal:* R$ ${formatPrice(subtotal)}
*Total do Pedido:* R$ ${formatPrice(total)}
*Pagamento:* ${customerData.payment}

Aguardando a confirmação!
    `.trim();

    const whatsappLink = `https://api.whatsapp.com/send?phone=556999999999&text=${encodeURIComponent(whatsappMessage)}`;


    const step3HTML = `
        <div class="step-header">
            <h2>Passo 3: Revisão e Envio</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)"><i class="fas fa-arrow-left"></i> Anterior</button>
            </div>
        </div>
        <div class="step-content" style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 20px;">Quase lá! Revise seu pedido e clique em 'Enviar Pedido' para nos chamar no WhatsApp.</p>
            
            <div class="cart-info" style="margin-bottom: 30px; border: 1px solid var(--light-gray); padding: 20px; border-radius: var(--radius);">
                <h4 style="margin-bottom: 10px;">Endereço de Entrega</h4>
                <p><strong>Nome:</strong> ${customerData.name}</p>
                <p><strong>Telefone:</strong> ${customerData.phone}</p>
                <p><strong>Endereço:</strong> ${customerData.address}, ${customerData.complement || 'S/ Complemento'}</p>
                <p><strong>Zona:</strong> ${selectedZone.toUpperCase()}</p>
            </div>
            
            <div class="cart-summary-step1" style="margin-bottom: 30px;">
                <span>Subtotal: R$ ${formatPrice(subtotal)}</span>
                <span>Entrega: R$ ${formatPrice(deliveryFee)}</span>
                <span style="color: var(--primary);">TOTAL: R$ ${formatPrice(total)}</span>
            </div>

            <a href="${whatsappLink}" target="_blank" class="btn-primary-v2" style="font-size: 1.2rem; padding: 15px 30px;" onclick="closeCheckout(false)">
                <i class="fab fa-whatsapp"></i> Enviar Pedido (WhatsApp)
            </a>
            
            <p style="margin-top: 15px; color: var(--danger); font-size: 0.9rem;">Ao clicar, você será redirecionado para o WhatsApp com todos os dados preenchidos.</p>
        </div>
    `;
    checkoutSteps.innerHTML = step3HTML;
}

function changeStep(step) {
    if (step === 2 && cart.length === 0) {
        showToast('O carrinho está vazio! Adicione produtos antes de prosseguir.');
        return;
    }
    
    if (step === 3) {
        // Validação básica do formulário no Passo 2
        const form = document.getElementById('customer-form');
        if (!form || !form.checkValidity()) {
            showToast('Por favor, preencha todos os campos obrigatórios.');
            // Tenta forçar a validação (funciona no HTML5)
            if (form) form.reportValidity();
            return;
        }
    }

    currentStep = step;
    switch (currentStep) {
        case 1:
            renderStep1();
            break;
        case 2:
            renderStep2();
            break;
        case 3:
            renderStep3();
            break;
        default:
            currentStep = 1;
            renderStep1();
    }
}

function openCheckout() {
    // Esconde a lista de produtos e mostra o checkout
    productListSection.style.display = 'none';
    checkoutSteps.classList.add('active');
    renderStep1();
}

function closeCheckout(showProducts) {
    if (showProducts) {
        productListSection.style.display = 'block';
    }
    checkoutSteps.classList.remove('active');
    // Força o carrinho a fechar
    floatingCart.classList.remove('open');
}

// =================== EVENT LISTENERS ===================

floatingCartToggle.addEventListener('click', () => {
    floatingCart.classList.toggle('open');
});

floatingCartClose.addEventListener('click', () => {
    floatingCart.classList.remove('open');
});

checkoutButton.addEventListener('click', () => {
    floatingCart.classList.remove('open');
    openCheckout();
});

clearCartBtn.addEventListener('click', clearCart);


// =================== INICIALIZAÇÃO ===================

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateFloatingCart();
    
    // Se o usuário carregar a página e já estiver no checkout
    if (checkoutSteps.classList.contains('active')) {
        openCheckout();
    }
});
