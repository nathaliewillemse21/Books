console.log('Annyeonghaseyo')

// Sample product data
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 99.99,
        category: "electronics",
        image: "https://via.placeholder.com/300",
        description: "High-quality wireless headphones with noise cancellation."
    },
    {
        id: 2,
        name: "Classic T-Shirt",
        price: 24.99,
        category: "clothing",
        image: "https://via.placeholder.com/300",
        description: "Comfortable cotton t-shirt in various colors."
    },
    {
        id: 3,
        name: "Bestseller Novel",
        price: 19.99,
        category: "books",
        image: "https://via.placeholder.com/300",
        description: "Award-winning fiction novel, hardcover edition."
    },
    // Add more products as needed
];

// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <div class="mt-auto">
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100" onclick="addToCart(${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to display products
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

// Function to filter products
function filterProducts() {
    const categoryValue = document.getElementById('categoryFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;

    let filteredProducts = products.filter(product => {
        const matchesCategory = categoryValue === 'all' || product.category === categoryValue;
        const matchesSearch = product.name.toLowerCase().includes(searchValue) || 
                            product.description.toLowerCase().includes(searchValue);
        return matchesCategory && matchesSearch;
    });

    // Sort products
    switch(sortValue) {
        case 'priceLow':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'priceHigh':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'nameAZ':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    displayProducts(filteredProducts);
}

// Function to add to cart (you can implement this based on your needs)
function addToCart(productId) {
    alert(`Product ${productId} added to cart!`);
    // Implement your cart logic here
}

// Event listeners for filters
document.getElementById('categoryFilter').addEventListener('change', filterProducts);
document.getElementById('searchInput').addEventListener('input', filterProducts);
document.getElementById('sortSelect').addEventListener('change', filterProducts);

// Theme toggle functionality (your existing theme code)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;
const html = document.documentElement;

function toggleTheme() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeIcon.textContent = '🌙';
        themeToggle.classList.remove('btn-outline-light');
        themeToggle.classList.add('btn-outline-dark');
        html.setAttribute('data-bs-theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeIcon.textContent = '🌞';
        themeToggle.classList.remove('btn-outline-dark');
        themeToggle.classList.add('btn-outline-light');
        html.setAttribute('data-bs-theme', 'dark');
    }
}

themeToggle.addEventListener('click', toggleTheme);

// Initial display of products
displayProducts(products);
