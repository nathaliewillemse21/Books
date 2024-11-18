console.log('Annyeonghaseyo')
// Assuming bookStore.js is already loaded and the `BookStore` class is initialized
// (Make sure to initialize the `bookStore` object as done previously)

document.addEventListener('DOMContentLoaded', () => {
    // Assuming the BookStore object is already initialized and cart is loaded
    bookStore.loadCartFromLocalStorage();
    bookStore.loadFavoritesFromLocalStorage();

    // Set up event listeners for the checkout actions
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Add event listener for the cart modal (show cart items)
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            bookStore.displayCart();  // This will display the cart items in the modal
        });
    }
});

// Checkout handler function
function handleCheckout() {
    // Step 1: Check if the cart is empty
    if (bookStore.cart.length === 0) {
        bookStore.showToast('Your cart is empty! Please add some books.');
        return;  // Do not proceed to checkout if cart is empty
    }

    // Step 2: Calculate total price for the checkout process
    const totalAmount = bookStore.cart.reduce((total, item) => total + (item.Price * item.quantity), 0);

    // Step 3: Display a confirmation (or proceed with actual payment gateway integration)
    const confirmationMessage = `
        <h4>Order Summary</h4>
        <ul>
            ${bookStore.cart.map(item => `
                <li>${item.Title} - R${item.Price.toFixed(2)} x ${item.quantity}</li>
            `).join('')}
        </ul>
        <h5>Total: R${totalAmount.toFixed(2)}</h5>
        <p>Your order will be processed shortly. Thank you for shopping with us!</p>
    `;

    // Create a simple checkout confirmation modal or alert
    const checkoutModal = document.createElement('div');
    checkoutModal.classList.add('modal', 'fade');
    checkoutModal.id = 'checkoutModal';
    checkoutModal.tabIndex = '-1';
    checkoutModal.setAttribute('aria-labelledby', 'checkoutModalLabel');
    checkoutModal.setAttribute('aria-hidden', 'true');

    checkoutModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="checkoutModalLabel">Checkout Confirmation</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${confirmationMessage}
                    <button class="btn btn-success" onclick="confirmCheckout()">Confirm Checkout</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(checkoutModal);
    const bootstrapModal = new bootstrap.Modal(checkoutModal);
    bootstrapModal.show();
}

// Confirm the checkout
function confirmCheckout() {
    // Step 4: Simulate checkout process (e.g., clear the cart and show a success message)
    bookStore.cart = [];  // Empty the cart after checkout
    bookStore.saveCartToLocalStorage();  // Save empty cart to localStorage
    bookStore.updateCartCount();  // Update the cart count UI
    bookStore.showToast('Your order has been successfully placed!');

    // Close the modal after confirmation
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        const bootstrapModal = bootstrap.Modal.getInstance(checkoutModal);
        bootstrapModal.hide();
        checkoutModal.remove();  // Remove modal from DOM
    }
}

// Optionally, you can add logic to handle payment gateways, order history, etc.
