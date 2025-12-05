// ==================== SISTEMA DE PRODUTOS VIA JSON ====================

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

// Sistema de produtos
let allProducts = []; // Todos os produtos do JSON
let filteredProducts = []; // Produtos após filtros
let currentCategory = 'all';
let sortBy = 'name-asc';
let minPrice = null;
let maxPrice = null;
let productsPerPage = 40; // Aumentado para melhor performance com 9000 produtos
let currentPage = 1;
let isLoading = false;
let productCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

// Elementos DOM
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
const heroBanner = document.getElementById('hero-banner');
const loadingContainer = document.getElementById('loading-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadMoreContainer = document.getElementById('load-more-container');
const productsCounter = document.getElementById('products-counter');
const productsCount = document.getElementById('products-count');
const searchTime = document.getElementById('search-time');
const visibleProducts = document.getElementById('visible-products');
const shownCount = document.getElementById('shown-count');
const totalCount = document.getElementById('total-count');
const sortSelect = document.getElementById('sort-select');
const priceMin = document.getElementById('price-min');
const priceMax = document.getElementById('price-max');
const applyFilters = document.getElementById('apply-filters');
const filterButtons = document.querySelectorAll('.filter-btn');
const adminToolsBtn = document.getElementById('admin-tools-btn');

// ==================== FUNÇÕES UTILITÁRIAS ====================

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

function calculateDeliveryFee(zone) {
    switch (zone) {
        case 'sul': return 8.00;
        case 'leste': return 12.00;
        case 'norte': return 15.00;
        default: return 0.00;
    }
}

// ==================== SISTEMA DE CACHE DE PRODUTOS ====================

async function loadProducts() {
    isLoading = true;
    
    try {
        // Verificar cache
        const now = Date.now();
        const cachedData = localStorage.getItem('familia_products_data');
        const cachedTime = localStorage.getItem('familia_products_time');
        
        if (cachedData && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION) {
            // Usar cache
            allProducts = JSON.parse(cachedData);
            console.log(`Carregados ${allProducts.length} produtos do cache`);
        } else {
            // Carregar do JSON
            showLoading(true);
            const response = await fetch('assets/data/products.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allProducts = await response.json();
            
            // Validar e processar produtos
            allProducts = allProducts.map(product => ({
                id: product.id || generateProductId(product),
                code: product.code || '',
                name: product.name || 'Produto sem nome',
                price: parseFloat(product.price) || 0,
                category: product.category || 'outros',
                img: product.img || getDefaultImage(product.category),
                description: product.description || '',
                brand: product.brand || '',
                weight: product.weight || '',
                unit: product.unit || 'un'
            }));
            
            // Salvar no cache
            localStorage.setItem('familia_products_data', JSON.stringify(allProducts));
            localStorage.setItem('familia_products_time', now.toString());
            
            console.log(`Carregados ${allProducts.length} produtos do JSON`);
        }
        
        // Inicializar filtros
        filteredProducts = [...allProducts];
        
        // Atualizar interface
        updateProductsCounter();
        applyCurrentFilters();
        setupFilterButtons();
        
        showToast(`Carregados ${allProducts.length} produtos`);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast('Erro ao carregar produtos. Usando dados de exemplo.');
        
        // Fallback para produtos de exemplo
        allProducts = getSampleProducts();
        filteredProducts = [...allProducts];
        applyCurrentFilters();
        
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

function generateProductId(product) {
    // Gera um ID único baseado no nome e código
    return Math.abs(product.name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0));
}

function getDefaultImage(category) {
    // Imagens padrão por categoria
    const defaultImages = {
        'alimentos': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'bebidas': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'limpeza': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'higiene': 'https://images.unsplash.com/photo-1620916297392-9a5a6d09428a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'frios': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'hortifruti': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        'carnes': 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    };
    
    return defaultImages[category] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80';
}

function getSampleProducts() {
    // Produtos de exemplo em caso de erro
    return [
        { id: 1, name: "Arroz Camil 5kg", price: 22.50, category: "alimentos" },
        { id: 2, name: "Feijão Carioca 1kg", price: 8.90, category: "alimentos" },
        { id: 3, name: "Açúcar Cristal 1kg", price: 4.50, category: "alimentos" },
        { id: 4, name: "Óleo de Soja 900ml", price: 7.90, category: "alimentos" },
        { id: 5, name: "Café 3 Corações 500g", price: 18.90, category: "alimentos" }
    ];
}

function showLoading(show) {
    if (loadingContainer) {
        loadingContainer.style.display = show ? 'block' : 'none';
    }
}

// ==================== SISTEMA DE FILTROS E ORDENAÇÃO ====================

function applyCurrentFilters() {
    const startTime = performance.now();
    
    let filtered = [...allProducts];
    
    // Filtrar por categoria
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    // Filtrar por preço
    if (minPrice !== null && minPrice !== '') {
        filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice !== null && maxPrice !== '') {
        filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    // Ordenar
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });
    
    filteredProducts = filtered;
    currentPage = 1;
    
    // Atualizar contadores
    updateProductsCounter();
    updatePaginationInfo();
    
    // Calcular tempo de busca
    const endTime = performance.now();
    searchTime.textContent = `${Math.round(endTime - startTime)}ms`;
    
    // Renderizar produtos
    renderProducts();
}

function setupFilterButtons() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            // Adicionar active ao clicado
            btn.classList.add('active');
            // Atualizar categoria
            currentCategory = btn.dataset.category;
            // Aplicar filtros
            applyCurrentFilters();
        });
    });
}

// ==================== SISTEMA DE PAGINAÇÃO ====================

function getVisibleProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(0, endIndex);
}

function updatePaginationInfo() {
    if (shownCount && totalCount) {
        const visibleCount = getVisibleProducts().length;
        shownCount.textContent = visibleCount;
        totalCount.textContent = filteredProducts.length;
        
        // Mostrar/ocultar botão "Carregar Mais"
        if (loadMoreBtn && loadMoreContainer) {
            if (visibleCount < filteredProducts.length) {
                loadMoreContainer.style.display = 'block';
                loadMoreBtn.disabled = false;
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }
}

function loadMoreProducts() {
    currentPage++;
    renderProducts();
    updatePaginationInfo();
    
    // Scroll suave para o novo conteúdo
    setTimeout(() => {
        window.scrollBy({ top: 300, behavior: 'smooth' });
    }, 100);
}

// ==================== RENDERIZAÇÃO DE PRODUTOS ====================

function renderProducts() {
    const visibleProductsList = getVisibleProducts();
    
    if (visibleProductsList.length === 0) {
        productListSection.innerHTML = `
            <div class="no-products" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar seus filtros ou busca</p>
                <button onclick="clearAllFilters()" class="btn-primary-v2" style="margin-top: 15px;">
                    Limpar Filtros
                </button>
            </div>
        `;
        return;
    }
    
    // Agrupar produtos por categoria
    const categories = {};
    visibleProductsList.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });
    
    productListSection.innerHTML = '';
    
    // Renderizar cada categoria
    Object.keys(categories).forEach(category => {
        const categoryInfo = getCategoryInfo(category);
        const categoryHTML = `
            <div class="product-category" id="${category}" data-category="${category}">
                <div class="category-header">
                    <i class="${categoryInfo.icon}"></i>
                    <h2>${categoryInfo.name} <span class="category-count">(${categories[category].length})</span></h2>
                </div>
                <div class="product-grid-v2" id="grid-${category}">
                    ${categories[category].map(product => `
                        <div class="product-card-v2" data-id="${product.id}">
                            <div class="product-image-v2">
                                <img src="${product.img}" 
                                     alt="${product.name}" 
                                     loading="lazy"
                                     onerror="this.src='${getDefaultImage(category)}'">
                            </div>
                            ${product.code ? `<div class="product-code">Cód: ${product.code}</div>` : ''}
                            <h3>${product.name}</h3>
                            ${product.description ? `<p class="product-description">${product.description.substring(0, 60)}...</p>` : ''}
                            <div class="product-price">
                                R$ ${formatPrice(product.price)}
                                ${product.weight ? `<small> / ${product.weight}</small>` : `<small> / ${product.unit}</small>`}
                            </div>
                            <button class="add-to-cart-v2" onclick="addToCart(${product.id})" 
                                    title="Adicionar ${product.name} ao carrinho">
                                <i class="fas fa-cart-plus"></i> Adicionar
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        productListSection.innerHTML += categoryHTML;
    });
    
    // Atualizar contador de produtos visíveis
    if (visibleProducts) {
        visibleProducts.textContent = `${visibleProductsList.length} visíveis`;
    }
}

function getCategoryInfo(category) {
    const categories = {
        'alimentos': { name: 'Alimentos Básicos', icon: 'fas fa-bread-slice' },
        'frios': { name: 'Frios e Laticínios', icon: 'fas fa-cheese' },
        'limpeza': { name: 'Produtos de Limpeza', icon: 'fas fa-spray-can' },
        'bebidas': { name: 'Bebidas', icon: 'fas fa-beer' },
        'higiene': { name: 'Higiene Pessoal', icon: 'fas fa-soap' },
        'hortifruti': { name: 'Hortifrúti', icon: 'fas fa-apple-alt' },
        'carnes': { name: 'Carnes', icon: 'fas fa-drumstick-bite' },
        'padaria': { name: 'Padaria', icon: 'fas fa-bread-slice' },
        'biscoitos': { name: 'Biscoitos', icon: 'fas fa-cookie' },
        'enlatados': { name: 'Enlatados', icon: 'fas fa-can' },
        'laticinios': { name: 'Laticínios', icon: 'fas fa-cheese' },
        'outros': { name: 'Outros Produtos', icon: 'fas fa-box' }
    };
    
    return categories[category] || categories['outros'];
}

function updateProductsCounter() {
    if (productsCount) {
        productsCount.textContent = `${filteredProducts.length} produtos encontrados`;
    }
}

function clearAllFilters() {
    currentCategory = 'all';
    sortBy = 'name-asc';
    minPrice = null;
    maxPrice = null;
    
    // Resetar UI
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    if (sortSelect) sortSelect.value = 'name-asc';
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    applyCurrentFilters();
    showToast('Filtros limpos');
}

// ==================== SISTEMA DE BUSCA ====================

function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.code && product.code.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    updateProductsCounter();
    renderProducts();
    updatePaginationInfo();
}

function clearSearch() {
    searchInput.value = '';
    filteredProducts = [...allProducts];
    currentPage = 1;
    updateProductsCounter();
    renderProducts();
    updatePaginationInfo();
}

// ==================== SISTEMA DO CARRINHO ====================

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        showToast('Produto não encontrado');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            code: product.code
        });
    }
    
    updateFloatingCart();
    showToast(`${product.name} adicionado ao carrinho!`);
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
                        ${item.code ? `<small>Cód: ${item.code}</small>` : ''}
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

// ==================== SISTEMA DE CHECKOUT ====================

function renderStep1() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
    
    checkoutSteps.innerHTML = `
        <div class="step-header">
            <h2>Passo 1: Seleção de Zona</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)" ${cart.length === 0 ? 'disabled' : ''} class="btn-next">
                    Próximo <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
        <div class="step-content">
            <h3>Selecione sua Zona de Entrega:</h3>
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

            <h3 style="margin-top: 30px;">Resumo do Carrinho:</h3>
            <div class="cart-summary-step1">
                <span>Subtotal: <span>R$ ${formatPrice(subtotal)}</span></span>
                <span>Taxa de Entrega: <span>R$ ${formatPrice(deliveryFee)}</span></span>
                <span>Total: <span>R$ ${formatPrice(total)}</span></span>
            </div>
            
            <p style="margin-top: 20px; text-align: center;">
                <button onclick="closeCheckout(true)" class="btn-primary-v2" style="background: transparent; color: var(--primary); border: 2px solid var(--primary);">
                    <i class="fas fa-edit"></i> Editar Produtos
                </button>
            </p>
        </div>
    `;

    document.querySelectorAll('.zone-option').forEach(zoneDiv => {
        zoneDiv.addEventListener('click', () => {
            document.querySelectorAll('.zone-option').forEach(el => el.classList.remove('selected'));
            zoneDiv.classList.add('selected');
            selectedZone = zoneDiv.dataset.zone;
            updateFloatingCart();
            renderStep1();
            updateLocalStorage();
        });
    });
}

function renderStep2() {
    checkoutSteps.innerHTML = `
        <div class="step-header">
            <h2>Passo 2: Dados e Pagamento</h2>
            <div class="step-navigation">
                <button onclick="changeStep(1)" class="btn-prev">
                    <i class="fas fa-arrow-left"></i> Anterior
                </button>
                <button onclick="changeStep(3)" class="btn-next">
                    Próximo <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
        <div class="step-content">
            <form id="customer-form">
                <h3>Dados de Contato</h3>
                <div class="form-group">
                    <label for="name">Nome Completo *</label>
                    <input type="text" id="name" name="name" value="${customerData.name}" required placeholder="Seu nome completo">
                </div>
                <div class="form-group">
                    <label for="phone">Telefone (WhatsApp) *</label>
                    <input type="tel" id="phone" name="phone" value="${customerData.phone}" required placeholder="(69) 99255-7719">
                </div>
                <div class="form-group">
                    <label for="address">Endereço de Entrega *</label>
                    <input type="text" id="address" name="address" value="${customerData.address}" required placeholder="Rua, Número, Bairro">
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
                
                <p style="margin-top: 20px; font-size: 0.9rem; color: var(--gray);">
                    <i class="fas fa-info-circle"></i> Campos marcados com * são obrigatórios
                </p>
            </form>
        </div>
    `;
    
    const form = document.getElementById('customer-form');
    if (form) {
        form.addEventListener('input', (e) => {
            if (e.target.name) {
                customerData[e.target.name] = e.target.value;
                updateLocalStorage();
            }
        });
        
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                customerData.payment = e.target.value;
                updateLocalStorage();
            });
        });
    }
}

function renderStep3() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    const itemsList = cart.map(item => 
        `• ${item.name} ${item.code ? `(Cód: ${item.code})` : ''} - ${item.quantity}x = R$ ${formatPrice(item.price * item.quantity)}`
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

    const whatsappNumber = "556992557719";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    checkoutSteps.innerHTML = `
        <div class="step-header">
            <h2>Passo 3: Revisar Pedido</h2>
            <div class="step-navigation">
                <button onclick="changeStep(2)" class="btn-prev">
                    <i class="fas fa-arrow-left"></i> Anterior
                </button>
            </div>
        </div>
        <div class="step-content">
            <div class="review-section">
                <div class="review-info">
                    <h4><i class="fas fa-user"></i> Seus Dados</h4>
                    <div class="info-grid">
                        <div>
                            <strong>Nome:</strong>
                            <span>${customerData.name}</span>
                        </div>
                        <div>
                            <strong>Telefone:</strong>
                            <span>${customerData.phone}</span>
                        </div>
                        <div>
                            <strong>Endereço:</strong>
                            <span>${customerData.address}</span>
                        </div>
                        <div>
                            <strong>Complemento:</strong>
                            <span>${customerData.complement || 'Não informado'}</span>
                        </div>
                        <div>
                            <strong>Zona:</strong>
                            <span>${selectedZone.toUpperCase()}</span>
                        </div>
                        <div>
                            <strong>Pagamento:</strong>
                            <span>${customerData.payment}</span>
                        </div>
                    </div>
                </div>
                
                <div class="review-info">
                    <h4><i class="fas fa-shopping-cart"></i> Resumo do Pedido</h4>
                    <div class="cart-summary-review">
                        <div class="summary-item">
                            <span>Subtotal:</span>
                            <span>R$ ${formatPrice(subtotal)}</span>
                        </div>
                        <div class="summary-item">
                            <span>Entrega:</span>
                            <span>R$ ${formatPrice(deliveryFee)}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total:</span>
                            <span>R$ ${formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
                
                <a href="${whatsappLink}" target="_blank" class="btn-whatsapp" onclick="completeOrder()">
                    <i class="fab fa-whatsapp"></i> Finalizar no WhatsApp
                </a>
                
                <p style="text-align: center; color: var(--gray); font-size: 0.9rem; margin-top: 15px;">
                    <i class="fas fa-info-circle"></i> Ao clicar, você será direcionado para nosso WhatsApp.
                </p>
            </div>
        </div>
    `;
}

function completeOrder() {
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
        showToast('Adicione produtos ao carrinho antes de prosseguir.');
        return;
    }
    
    if (step === 3) {
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const address = document.getElementById('address');
        const payment = document.querySelector('input[name="payment"]:checked');
        
        let isValid = true;
        
        if (!name || !name.value.trim()) {
            isValid = false;
            name.style.borderColor = 'var(--danger)';
        } else {
            name.style.borderColor = '';
        }
        
        if (!phone || !phone.value.trim()) {
            isValid = false;
            phone.style.borderColor = 'var(--danger)';
        } else {
            phone.style.borderColor = '';
        }
        
        if (!address || !address.value.trim()) {
            isValid = false;
            address.style.borderColor = 'var(--danger)';
        } else {
            address.style.borderColor = '';
        }
        
        if (!payment) {
            isValid = false;
            showToast('Selecione uma forma de pagamento.');
        }
        
        if (!isValid) {
            showToast('Preencha todos os campos obrigatórios.');
            return;
        }
        
        customerData.name = name.value;
        customerData.phone = phone.value;
        customerData.address = address.value;
        customerData.complement = document.getElementById('complement') ? document.getElementById('complement').value : '';
        customerData.payment = payment.value;
        updateLocalStorage();
    }

    currentStep = step;
    switch (currentStep) {
        case 1: renderStep1(); break;
        case 2: renderStep2(); break;
        case 3: renderStep3(); break;
        default: renderStep1();
    }
}

function openCheckout() {
    productListSection.style.display = 'none';
    if (heroBanner) {
        heroBanner.style.display = 'none';
    }
    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
    }
    checkoutSteps.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderStep1();
}

function closeCheckout(showProducts) {
    if (showProducts) {
        productListSection.style.display = 'block';
        if (heroBanner) {
            heroBanner.style.display = '';
        }
        updatePaginationInfo();
        window.scrollTo({ top: productListSection.offsetTop - 100, behavior: 'smooth' });
    }
    checkoutSteps.classList.remove('active');
    floatingCart.classList.remove('open');
}

// ==================== FUNÇÕES AUXILIARES ====================

function showAllCategories() {
    // Rolagem suave para todas as categorias
    document.querySelector('.product-list-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function reloadProducts() {
    // Limpar cache e recarregar
    localStorage.removeItem('familia_products_data');
    localStorage.removeItem('familia_products_time');
    loadProducts();
    showToast('Recarregando produtos do JSON...');
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Carregar produtos
    loadProducts();
    
    // Atualizar carrinho
    updateFloatingCart();
    deliveryFee = calculateDeliveryFee(selectedZone);
    
    // Configurar botão "Carregar Mais"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Configurar ordenação
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            applyCurrentFilters();
        });
    }
    
    // Configurar filtros de preço
    if (applyFilters) {
        applyFilters.addEventListener('click', () => {
            minPrice = priceMin.value;
            maxPrice = priceMax.value;
            applyCurrentFilters();
            showToast('Filtros aplicados');
        });
    }
    
    // Permitir Enter no filtro de preço
    if (priceMin && priceMax) {
        priceMin.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                minPrice = priceMin.value;
                maxPrice = priceMax.value;
                applyCurrentFilters();
            }
        });
        
        priceMax.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                minPrice = priceMin.value;
                maxPrice = priceMax.value;
                applyCurrentFilters();
            }
        });
    }
    
    // Fechar carrinho ao clicar fora
    document.addEventListener('click', (e) => {
        if (floatingCart.classList.contains('open') &&
            !floatingCart.contains(e.target) &&
            !floatingCartToggle.contains(e.target)) {
            floatingCart.classList.remove('open');
        }
    });
    
    // Configurar botão de ferramentas admin
    if (adminToolsBtn) {
        adminToolsBtn.addEventListener('click', () => {
            if (confirm('Deseja recarregar os produtos do JSON?')) {
                reloadProducts();
            }
        });
    }
});

if (floatingCartToggle) {
    floatingCartToggle.addEventListener('click', () => {
        floatingCart.classList.toggle('open');
    });
}

if (floatingCartClose) {
    floatingCartClose.addEventListener('click', () => {
        floatingCart.classList.remove('open');
    });
}

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Adicione produtos ao carrinho antes de finalizar!');
            return;
        }
        floatingCart.classList.remove('open');
        openCheckout();
    });
}

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
}

if (searchButton) {
    searchButton.addEventListener('click', searchProducts);
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

if (verProdutosBtn) {
    verProdutosBtn.addEventListener('click', () => {
        document.querySelector('.product-list-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.clearSearch = clearSearch;
window.searchProducts = searchProducts;
window.changeStep = changeStep;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.completeOrder = completeOrder;
window.showAllCategories = showAllCategories;
window.clearAllFilters = clearAllFilters;
window.reloadProducts = reloadProducts;