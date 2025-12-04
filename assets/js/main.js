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

// Dados dos produtos atualizados
const products = {
    1: { name: "Açúcar Mascavo Unão 1kg", price: 22.49, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Açucar" },
    2: { name: "Arroz Camil Tipo 1 5kg", price: 18.50, category: "alimentos", img: "https://via.placeholder.com/150x150?text=Arroz" },
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
    17: { name: "Manteiga Aviação 200g", price: 12.90, category: "frios", img: "https://via.placeholder.com/150x150?text=Manteiga" },
    18: { name: "Queijo Mussarela Kg", price: 35.90, category: "frios", img: "https://via.placeholder.com/150x150?text=Queijo" },
    19: { name: "Presunto Sadia Kg", price: 28.50, category: "frios", img: "https://via.placeholder.com/150x150?text=Presunto" },
    20: { name: "Desinfetante Veja 500ml", price: 6.99, category: "limpeza", img: "https://via.placeholder.com/150x150?text=Desinfetante" },
    21: { name: "Água Mineral 500ml", price: 2.50, category: "bebidas", img: "https://via.placeholder.com/150x150?text=Agua" },
    22: { name: "Suco Del Valle 1L", price: 7.50, category: "bebidas", img: "https://via.placeholder.com/150x150?text=Suco" },
    23: { name: "Creme Dental Colgate 90g", price: 4.99, category: "higiene", img: "https://via.placeholder.com/150x150?text=Creme+Dental" },
    24: { name: "Batata Kg", price: 5.50, category: "hortifruti", img: "https://via.placeholder.com/150x150?text=Batata" }
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
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const verProdutosBtn = document.getElementById('ver-produtos-btn');

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

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        
        updateFloatingCart();
        updateLocalStorage();
        showToast('Produto removido do carrinho');
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
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
        checkoutButton.style.opacity = '0.6';
    } else {
        checkoutButton.disabled = false;
        checkoutButton.style.opacity = '1';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItemHTML = `
                <div class="floating-cart-item" data-id="${item.id}">
                    <div class="floating-cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="floating-cart-item-quantity">
                            <button class="quantity-btn minus" onclick="removeFromCart(${item.id})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="addToCart(${item.id})">+</button>
                        </div>
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
            gridElement.innerHTML = categories[category].map(product => {
                // Encontrar o ID do produto
                const productId = Object.keys(products).find(key => products[key] === product);
                return `
                    <div class="product-card-v2" id="product-${productId}">
                        <div class="product-image-v2">
                            <img src="${product.img}" alt="${product.name}" loading="lazy">
                        </div>
                        <h3>${product.name}</h3>
                        <div class="product-price">
                            R$ ${formatPrice(product.price)}<small> / uni</small>
                        </div>
                        <button class="add-to-cart-v2" onclick="addToCart(${productId})">
                            <i class="fas fa-cart-plus"></i> Adicionar
                        </button>
                    </div>
                `;
            }).join('');
        }
    }
}

// =================== FUNÇÃO DE PESQUISA ===================

function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Se a pesquisa estiver vazia, mostra todos os produtos
        document.querySelectorAll('.product-category').forEach(category => {
            category.style.display = 'block';
        });
        renderProducts();
        return;
    }
    
    // Esconde todas as categorias primeiro
    document.querySelectorAll('.product-category').forEach(category => {
        category.style.display = 'none';
    });
    
    // Filtra produtos
    const filteredProducts = {};
    Object.keys(products).forEach(id => {
        const product = products[id];
        if (product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)) {
            if (!filteredProducts[product.category]) {
                filteredProducts[product.category] = [];
            }
            filteredProducts[product.category].push({...product, id});
        }
    });
    
    // Renderiza os produtos filtrados
    for (const category in filteredProducts) {
        const gridElement = document.getElementById(`grid-${category}`);
        const categoryElement = document.getElementById(category);
        
        if (gridElement && categoryElement) {
            categoryElement.style.display = 'block';
            gridElement.innerHTML = filteredProducts[category].map(product => `
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
    
    // Mostra mensagem se não encontrar produtos
    if (Object.keys(filteredProducts).length === 0) {
        productListSection.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente buscar por outro termo</p>
                <button class="btn-primary-v2" onclick="clearSearch()">Limpar Busca</button>
            </div>
        `;
    }
}

function clearSearch() {
    searchInput.value = '';
    location.reload(); // Recarrega a página para mostrar todos os produtos
}

// =================== FUNÇÕES DO CHECKOUT ===================

function renderStep1() {
    // Renderiza a seleção de zona de entrega
    const step1HTML = `
        <div class="step-header">
            <h2>Passo 1: Seleção de Zona de Entrega</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)" ${cart.length === 0 ? 'disabled' : ''} class="btn-next">Próximo <i class="fas fa-arrow-right"></i></button>
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
            
            <p style="margin-top: 20px; text-align: center;">
                <button onclick="closeCheckout(true)" class="btn-edit-products">
                    <i class="fas fa-edit"></i> Editar Produtos
                </button>
            </p>
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
                <button onclick="changeStep(1)" class="btn-prev"><i class="fas fa-arrow-left"></i> Anterior</button>
                <button onclick="changeStep(3)" class="btn-next">Próximo <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        <div class="step-content">
            <form id="customer-form">
                <h3>Dados de Contato e Entrega</h3>
                <div class="form-group">
                    <label for="name">Nome Completo *</label>
                    <input type="text" id="name" name="name" value="${customerData.name}" required placeholder="Digite seu nome completo">
                </div>
                <div class="form-group">
                    <label for="phone">Telefone (WhatsApp) *</label>
                    <input type="tel" id="phone" name="phone" value="${customerData.phone}" required placeholder="(69) 99255-7719">
                </div>
                <div class="form-group">
                    <label for="address">Endereço de Entrega (Rua, Número) *</label>
                    <input type="text" id="address" name="address" value="${customerData.address}" required placeholder="Rua Exemplo, 123">
                </div>
                <div class="form-group">
                    <label for="complement">Complemento (Opcional)</label>
                    <input type="text" id="complement" name="complement" value="${customerData.complement}" placeholder="Apartamento, Bloco, Referência">
                </div>

                <h3>Forma de Pagamento *</h3>
                <div class="payment-options">
                    <div>
                        <input type="radio" id="pix" name="payment" value="PIX" ${customerData.payment === 'PIX' ? 'checked' : ''} required>
                        <label for="pix"><i class="fas fa-qrcode"></i> PIX (Recomendado)</label>
                    </div>
                    <div>
                        <input type="radio" id="debito" name="payment" value="Cartão de Débito" ${customerData.payment === 'Cartão de Débito' ? 'checked' : ''}>
                        <label for="debito"><i class="fas fa-credit-card"></i> Cartão de Débito</label>
                    </div>
                    <div>
                        <input type="radio" id="credito" name="payment" value="Cartão de Crédito" ${customerData.payment === 'Cartão de Crédito' ? 'checked' : ''}>
                        <label for="credito"><i class="fas fa-credit-card"></i> Cartão de Crédito</label>
                    </div>
                    <div>
                        <input type="radio" id="ticket" name="payment" value="Ticket Alimentação" ${customerData.payment === 'Ticket Alimentação' ? 'checked' : ''}>
                        <label for="ticket"><i class="fas fa-ticket-alt"></i> Ticket Alimentação</label>
                    </div>
                </div>
                
                <div class="form-notes">
                    <p><small>* Campos obrigatórios</small></p>
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
    
    // Adiciona evento para os radio buttons
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            customerData.payment = e.target.value;
            updateLocalStorage();
        });
    });
}

function renderStep3() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    const itemsList = cart.map(item => 
        `• ${item.name} - ${item.quantity}x = R$ ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    const whatsappMessage = `*NOVO PEDIDO - SUPERMERCADO FAMÍLIA*\n\n` +
        `*CLIENTE:* ${customerData.name}\n` +
        `*TELEFONE:* ${customerData.phone}\n` +
        `*ENDEREÇO:* ${customerData.address}\n` +
        `*COMPLEMENTO:* ${customerData.complement || 'Nenhum'}\n` +
        `*ZONA:* ${selectedZone.toUpperCase()}\n\n` +
        `*ITENS DO PEDIDO:*\n${itemsList}\n\n` +
        `*RESUMO DO VALOR:*\n` +
        `Subtotal: R$ ${formatPrice(subtotal)}\n` +
        `Taxa de Entrega: R$ ${formatPrice(deliveryFee)}\n` +
        `*TOTAL: R$ ${formatPrice(total)}*\n\n` +
        `*FORMA DE PAGAMENTO:* ${customerData.payment}\n\n` +
        `*OBSERVAÇÕES:* Pedido realizado via site.`;

    // Formata o número para o link do WhatsApp
    const whatsappNumber = "556992557719"; // 55 69 99255-7719 sem espaços e traços
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    const step3HTML = `
        <div class="step-header">
            <h2>Passo 3: Revisar e Finalizar Pedido</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)" class="btn-prev"><i class="fas fa-arrow-left"></i> Anterior</button>
            </div>
        </div>
        <div class="step-content">
            <div class="review-section">
                <div class="review-card">
                    <h3><i class="fas fa-check-circle"></i> Pedido Confirmado!</h3>
                    <p>Revise seus dados abaixo e clique em "Finalizar no WhatsApp" para enviar seu pedido.</p>
                </div>
                
                <div class="review-info">
                    <h4><i class="fas fa-user"></i> Dados Pessoais</h4>
                    <div class="info-grid">
                        <div><strong>Nome:</strong> ${customerData.name}</div>
                        <div><strong>Telefone:</strong> ${customerData.phone}</div>
                        <div><strong>Endereço:</strong> ${customerData.address}</div>
                        <div><strong>Complemento:</strong> ${customerData.complement || 'Não informado'}</div>
                        <div><strong>Zona:</strong> ${selectedZone.toUpperCase()}</div>
                        <div><strong>Pagamento:</strong> ${customerData.payment}</div>
                    </div>
                </div>
                
                <div class="review-info">
                    <h4><i class="fas fa-shopping-cart"></i> Resumo do Pedido</h4>
                    <div class="cart-summary-review">
                        <div class="summary-item">
                            <span>Subtotal dos produtos:</span>
                            <span>R$ ${formatPrice(subtotal)}</span>
                        </div>
                        <div class="summary-item">
                            <span>Taxa de entrega:</span>
                            <span>R$ ${formatPrice(deliveryFee)}</span>
                        </div>
                        <div class="summary-item total">
                            <span><strong>Total a pagar:</strong></span>
                            <span><strong>R$ ${formatPrice(total)}</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <a href="${whatsappLink}" target="_blank" class="btn-whatsapp" onclick="completeOrder()">
                        <i class="fab fa-whatsapp"></i> Finalizar no WhatsApp
                    </a>
                    <button onclick="changeStep(2)" class="btn-edit">
                        <i class="fas fa-edit"></i> Editar Dados
                    </button>
                </div>
                
                <p class="instructions">
                    <i class="fas fa-info-circle"></i> Ao clicar em "Finalizar no WhatsApp", você será direcionado para nosso WhatsApp com todos os dados do pedido pré-preenchidos.
                </p>
            </div>
        </div>
    `;
    checkoutSteps.innerHTML = step3HTML;
}

function completeOrder() {
    // Limpar carrinho após finalizar pedido
    setTimeout(() => {
        cart = [];
        updateFloatingCart();
        updateLocalStorage();
        closeCheckout(false);
        showToast('Pedido enviado com sucesso! Aguarde nosso contato.');
    }, 1000);
}

function changeStep(step) {
    if (step === 2 && cart.length === 0) {
        showToast('O carrinho está vazio! Adicione produtos antes de prosseguir.');
        return;
    }
    
    if (step === 3) {
        // Validação do formulário no Passo 2
        const form = document.getElementById('customer-form');
        const requiredFields = ['name', 'phone', 'address'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input || !input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger)';
            } else {
                input.style.borderColor = '';
            }
        });
        
        // Verificar forma de pagamento selecionada
        const paymentSelected = document.querySelector('input[name="payment"]:checked');
        if (!paymentSelected) {
            isValid = false;
            showToast('Selecione uma forma de pagamento.');
        }
        
        if (!isValid) {
            showToast('Preencha todos os campos obrigatórios.');
            return;
        }
        
        // Salvar dados do formulário
        const formData = new FormData(document.getElementById('customer-form'));
        for (let [key, value] of formData.entries()) {
            customerData[key] = value;
        }
        updateLocalStorage();
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
    document.querySelector('.checkout-container').scrollIntoView({ behavior: 'smooth' });
    renderStep1();
}

function closeCheckout(showProducts) {
    if (showProducts) {
        productListSection.style.display = 'block';
        productListSection.scrollIntoView({ behavior: 'smooth' });
    }
    checkoutSteps.classList.remove('active');
    // Fecha o carrinho flutuante
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
    if (cart.length === 0) {
        showToast('Adicione produtos ao carrinho antes de finalizar!');
        return;
    }
    floatingCart.classList.remove('open');
    openCheckout();
});

clearCartBtn.addEventListener('click', clearCart);

// Eventos para pesquisa
searchButton.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// Botão "Ver Produtos" no hero banner
if (verProdutosBtn) {
    verProdutosBtn.addEventListener('click', () => {
        document.getElementById('alimentos').scrollIntoView({ behavior: 'smooth' });
    });
}

// =================== INICIALIZAÇÃO ===================

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateFloatingCart();
    
    // Fechar carrinho ao clicar fora
    document.addEventListener('click', (e) => {
        if (!floatingCart.contains(e.target) && !floatingCartToggle.contains(e.target) && floatingCart.classList.contains('open')) {
            floatingCart.classList.remove('open');
        }
    });
});
