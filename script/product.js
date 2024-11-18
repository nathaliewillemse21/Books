// Book Store Class Structure
class BookStore {
    constructor() {
        this.books = [];
        this.cart = [];
        this.favorites = [];
        this.searchQuery = '';
        this.selectedCategory = 'all';
    }

    initializeStore(booksData) {
        this.books = booksData;
        this.displayBooks();
        this.setupEventListeners();
        this.loadCartFromLocalStorage();
        this.loadFavoritesFromLocalStorage();
    }

    getSortedAndFilteredBooks() {
        // First filter books based on search query and category
        let filteredBooks = this.books.filter(book => {
            const matchesSearch = 
                book.Title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                book.Category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                book.Tags.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            const matchesCategory = 
                this.selectedCategory === 'all' || 
                book.Category === this.selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Then apply category priority sorting
        const categoryPriority = [
            'Chinese manhua',
            'Japanese manga',
            'Korean manhwa'
        ];

        return filteredBooks.sort((a, b) => {
            const priorityA = categoryPriority.indexOf(a.Category);
            const priorityB = categoryPriority.indexOf(b.Category);
            return priorityA - priorityB;
        });
    }

    displayBooks() {
        const productsContainer = document.getElementById('productGrid') || this.createProductGrid();
        const filteredAndSortedBooks = this.getSortedAndFilteredBooks();

        if (filteredAndSortedBooks.length === 0) {
            productsContainer.innerHTML = '<p class="text-center w-100">No books found</p>';
            return;
        }


    // Display books in the UI
        const booksHTML = this.books.map(book => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="position-relative">
                        <img src="${book.Cover}" class="card-img-top" alt="${book.Title}" style="height: 400px; object-fit: cover;">
                        <button class="btn btn-outline-light position-absolute top-0 end-0 m-2 favorite-btn" 
                                onclick="bookStore.toggleFavorite('${book.BookID}')">
                            ${this.favorites.includes(book.BookID) ? '❤️' : '🤍'}
                        </button>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-primary me-1">${book.Category}</span>
                            <span class="badge bg-secondary">${book.Tags}</span>
                        </div>
                        <h5 class="card-title">${book.Title}</h5>
                        <p class="card-text small text-muted mb-3">${this.truncateText(book.Summary, 100)}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="h5 mb-0">R${book.Price.toFixed(2)}</span>
                                <div class="btn-group">
                                    <button class="btn btn-dark" onclick="bookStore.addToCart('${book.BookID}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart-check-fill" viewBox="0 0 16 16">
  <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-1.646-7.646-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708"/>
</svg>  
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        productsContainer.innerHTML = booksHTML;
        this.updateCartCount();
    }

    // Create product grid if it doesn't exist
    createProductGrid() {
        const container = document.createElement('div');
        container.id = 'productGrid';
        container.className = 'row';
        document.querySelector('.container').appendChild(container);
        return container;
    }

    // Truncate text helper
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Add to cart functionality
    addToCart(bookId) {
        const book = this.books.find(b => b.BookID === bookId);
        if (book) {
            const cartItem = this.cart.find(item => item.BookID === bookId);
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                this.cart.push({ ...book, quantity: 1 });
            }
            this.updateCartCount();
            this.showToast(`Added ${book.Title} to cart!`);
            this.saveCartToLocalStorage();
        }
    }

    // Remove from cart
    removeFromCart(bookId) {
        this.cart = this.cart.filter(item => item.BookID !== bookId);
        this.updateCartCount();
        this.saveCartToLocalStorage();
        this.displayCart();
    }

    // Toggle favorite status
    toggleFavorite(bookId) {
        const index = this.favorites.indexOf(bookId);
        if (index === -1) {
            this.favorites.push(bookId);
        } else {
            this.favorites.splice(index, 1);
        }
        this.saveFavoritesToLocalStorage();
        this.displayBooks();
    }

    // Update cart count in UI
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Display cart contents
    displayCart() {
        const cartModal = document.getElementById('cartModal');
        if (!cartModal) {
            this.createCartModal();
        }

        const cartBody = document.querySelector('.cart-body');
        if (this.cart.length === 0) {
            cartBody.innerHTML = '<p class="text-center">Your cart is empty</p>';
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.Price * item.quantity), 0);

        cartBody.innerHTML = `
            ${this.cart.map(item => `
                <div class="cart-item mb-3 d-flex align-items-center">
                    <img src="${item.Cover}" alt="${item.Title}" style="width: 60px; height: 80px; object-fit: cover;">
                    <div class="ms-3 flex-grow-1">
                        <h6 class="mb-0">${item.Title}</h6>
                        <p class="mb-0 text-muted">R${item.Price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="bookStore.removeFromCart('${item.BookID}')">
                        Remove
                    </button>
                </div>
            `).join('')}
            <div class="mt-3 border-top pt-3">
                <h5>Total: R${total.toFixed(2)}</h5>
                <button class="btn btn-success w-100" onclick="bookStore.checkout()">
                    Proceed to Checkout
                </button>
            </div>
        `;
    }

    // Create cart modal
    createCartModal() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal fade" id="cartModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Shopping Cart</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body cart-body"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredBooks = this.books.filter(book =>
                    book.Title.toLowerCase().includes(searchTerm) ||
                    book.Category.toLowerCase().includes(searchTerm) ||
                    book.Tags.toLowerCase().includes(searchTerm)
                );
                this.displayFilteredBooks(filteredBooks);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortType = e.target.value;
                this.sortBooks(sortType);
            });
        }
    }

    // Display filtered books
    displayFilteredBooks(filteredBooks) {
        const productsContainer = document.getElementById('productGrid');
        if (filteredBooks.length === 0) {
            productsContainer.innerHTML = '<p class="text-center w-100">No books found</p>';
        } else {
            this.books = filteredBooks;
            this.displayBooks();
        }
    }

    // Sort books
    sortBooks(sortType) {
        switch (sortType) {
            case 'price-asc':
                this.books.sort((a, b) => a.Price - b.Price);
                break;
            case 'price-desc':
                this.books.sort((a, b) => b.Price - a.Price);
                break;
            case 'title':
                this.books.sort((a, b) => a.Title.localeCompare(b.Title));
                break;
        }
        this.displayBooks();
    }

    // Local storage functions
    saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartCount();
        }
    }

    saveFavoritesToLocalStorage() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    loadFavoritesFromLocalStorage() {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            this.favorites = JSON.parse(savedFavorites);
        }
    }

    // Checkout function (placeholder)
    checkout() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!');
            return;
        }
        alert('Proceeding to checkout...');
        // Implement actual checkout logic here
    }
}

// Initialize the store
const bookStore = new BookStore();

// Your book data
const booksData = [
    {
        "BookID": "1",
        "Title": "Everyone Pampers the Small Blessing!",
        "Category": "Chinese manhua",
        "Tags": "Historical fiction",
        "Summary": "The girl who transmigrated threw four-year-old Yu into a snowy mountain in order to change her fate...",
        "Cover": "https://i.ibb.co/2kRZWHR/Screenshot-2024-03-06-131544.png",
        "Price": 300
    },
    {
        "BookID": "2",
        "Title": "The Spider Queen",
        "Category": "Chinese manhua",
        "Tags": "Sci-fi",
        "Summary": "In the Year 30XX...... Humans have long been discovering the wonders of the universe and exploring the great galaxies beyond the milky way. They are not alone.",
        "Cover": "https://i.ibb.co/n6vL0nD/Screenshot-2024-03-06-132227.png",
        "Price": 430
    },
    {
        "BookID": "3",
        "Title": "Reborn In The Apocalypse: It Had Always Been You",
        "Category": "Chinese manhua", "Tags": "Sci-fi, romance",
        "Summary": "Su Shanshan died a violent death eight years into the apocalypse but somehow, she opened her eyes to find herself reborn. Time had turned back to the day before the apocalypse. Having the chance to start over filled her with hope. Having lived through the bloody violence of the apocalypse, she now had the skills and knowledge to survive and thrive in the end times. She would repay the man who gave his life trying to save her even though she broke his heart.The big brother whom she had reviled in her previous life. This time, she would take a chance on love.As if blessed by the heavens, she had unexpectedly been given a spatial superpower, with which she hoarded resources that would sustain her in the apocalypse.When the world changed in an instant on Doomsday, and hordes of flesh-eating zombies roamed the place, she set off on a dangerous journey to find him, determined to alter the course of events that unfolded and change what happened in the past.",
        "Cover": "https://i.ibb.co/6gZPX8t/Screenshot-2024-03-06-132604.png",
        "UserID": null,
        "Price": 350
    },
    {
        "BookID": "4",
        "Title": "Rising Phoenix",
        "Category": "Chinese manhua",
        "Tags": "Historical Fiction",
        "Summary": "Dynasties rise and dynasties fall, like the tide washing the sand. On one side, he suffers from intrigue and hides his great ambition; on the other, the mysterious girl hides her anger behind her gentle smile.Who toppled the country, establishing their dynasty?",
        "Cover": "https://i.ibb.co/Gdfxy9s/Screenshot-2024-03-06-132722.png",
        "UserID": null,
        "Price": 500
    },
    {
        "BookID": "5",
        "Title": "My House of Horrors",
        "Category": "Chinese manhua",
        "Tags": "Horror, mystery",
        "Summary": "The hearse with the weird odor slowed to a stop before the entrance. The sound of pebbles could be heard bouncing on the ceiling. There were footsteps coming from the corridor, and there seemed to be someone sawing next door. The door knob to the room rattled slightly, and the faucet in the bathroom kept dripping even though it had been screwed shut. There was a rubber ball that rolled on its own underneath the bed. Wet footsteps started to surface one after another on the floor.At 3 am, Chen Ge held a cleaver in his hand as he hid beside the room heater. The call he was trying to make was finally answered. 'Landlord, is this what you meant by `the house can be a little crowded at night`?'",
        "Cover": "https://i.ibb.co/2KQntkM/Screenshot-2024-03-06-133245.png",
        "UserID": null,
        "Price": 450
    },
    {
        "BookID": "6",
        "Title": "Supreme Magus",
        "Category": "Chinese manhua",
        "Tags": "Fantasy, action",
        "Summary": "Derek McCoy was a man who spent his entire life facing adversity and injustice. After being forced to settle with surviving rather than living, he had finally found his place in the world, until everything was taken from him one last time. After losing his life to avenge his murdered brother, he reincarnates until he finds a world worth living in, a world filled with magic and monsters. Follow him along his journey, from grieving brother to alien soldier. From infant to Supreme Magus.",
        "Cover": "https://i.ibb.co/t3dMmg7/Screenshot-2024-03-06-133744.png",
        "UserID": null,
        "Price": 450
    }, {
        "BookID": "7",
        "Title": "Shadow Slave",
        "Category": "Chinese manhua",
        "Tags": "Fantasy, action,romance",
        "Summary": "Growing up in poverty, Sunny never expected anything good from life. However, even he did not anticipate being chosen by the Nightmare Spell and becoming one of the Awakened - an elite group of people gifted with supernatural powers. Transported into a ruined magical world, he found himself facing against terrible monsters - and other Awakened - in a deadly battle of survival.What's worse, the divine power he received happened to possess a small, but potentially fatal side effect...",
        "Cover": "https://i.ibb.co/5W4RT3P/Screenshot-2024-03-07-084522.png",
        "UserID": null,
        "Price": 350
    },
    {
        "BookID": "8",
        "Title": "Lord of Mysteries",
        "Category": "Chinese manhua",
        "Tags": "Sci-fi, mystery",
        "Summary": "With the rising tide of steam power and machinery, who can come close to being a Beyonder? Shrouded in the fog of history and darkness, who or what is the lurking evil that murmurs into our ears?Waking up to be faced with a string of mysteries, Zhou Mingrui finds himself reincarnated as Klein Moretti in an alternate Victorian era world where he sees a world filled with machinery, cannons, dreadnoughts, airships, difference machines, as well as Potions, Divination, Hexes, Tarot Cards, Sealed Artifacts… The Light continues to shine but mystery has never gone far. Follow Klein as he finds himself entangled with the Churches of the world—both orthodox and unorthodox—while he slowly develops newfound powers thanks to the Beyonder potions.Like the corresponding tarot card, The Fool, which is numbered 0—a number of unlimited potential—this is the legend of 'The Fool.'",
        "Cover": "https://i.ibb.co/zHZT43B/Screenshot-2024-03-07-090713.png",
        "UserID": null,
        "Price": 250
    },
    {
        "BookID": "9",
        "Title": "Dual Cultivator Reborn",
        "Category": "Chinese manhua",
        "Tags": "Fantasy, action, comedy, romance",
        "Summary": "Yohan was a game maniac. He loved playing the cultivation game that was popular on Earth, and he was one of the famous players in the action genre, but unfortunately, he died while crossing the road. Truck Kun Hit him at a lightning-fast speed.After dying in an unfortunate accident his soul transmigrated into a world dominated by cultivators, Destiny played a cruel prank on him, the body he Acquired belonged to a trash dual cultivator who belong to the famous clan with no influence..",
        "Cover": "https://i.ibb.co/6sN0L5p/Screenshot-2024-03-07-090917.png",
        "UserID": null,
        "Price": 350
    },
    {
        "BookID": "10",
        "Title": "Sword God in a World of Magic",
        "Category": "Chinese manhua",
        "Tags": "Fantasy, action",
        "Summary": "The God of this world had grown angry and frustrated yet again.His world was supposed to entertain him! It was supposed to be fun to watch!",
        "Cover": "https://i.ibb.co/Y2XmPb0/Screenshot-2024-03-07-091339.png",
        "UserID": null,
        "Price": 550
    },
    {
        "BookID": "11",
        "Title": "Maki and Friends",
        "Category": "Korean manhwa",
        "Tags": "Comedy",
        "Summary": "Join Maki and his whacky but charming neighbors on their grand adventure through everyday life.",
        "Cover": "https://i.ibb.co/bgKd0sq/Screenshot-2024-03-07-153618.png",
        "UserID": null
        , "Price": 2150
    },
    {
        "BookID": "12",
        "Title": "Goblin",
        "Category": "Korean manhwa",
        "Tags": "Fantasy",
        "Summary": "I definitely died a moment ago, I swear! Who are these people? What do they want from me?",
        "Cover": "https://i.ibb.co/WkbVTM1/Screenshot-2024-03-07-153853.png",
        "UserID": null,
        "Price": 2100
    },
    {
        "BookID": "13",
        "Title": "Go Away, Mr.Demon",
        "Category": "Korean manhwa",
        "Tags": "Romance",
        "Summary": "Silver opened a book, and now he has to deal with a hungry demon lord! Will this relationship be alright?",
        "Cover": "https://i.ibb.co/Lnbft4y/Screenshot-2024-03-07-154433.png",
        "UserID": null,
        "Price": 2200
    },
    {
        "BookID": "14",
        "Title": "Can't See Can't Hear But Love",
        "Category": "Korean manhwa",
        "Tags": "Mystery, action",
        "Summary": "If I had stopped drawing when she told me, would I have been able to see? But then, I would've never met Melody…",
        "Cover": "https://i.ibb.co/bNnZMH2/Screenshot-2024-03-07-154531.png",
        "UserID": null,
        "Price": 2350
    },
    {
        "BookID": "15",
        "Title": "Volcanic Age",
        "Category": "Korean manhwa",
        "Tags": "Fantasy, action",
        "Summary": "Joo Seo-Cheon, a man who survives the age of war through sheer luck and becomes Mount Hua Sects elder only to live a life full of regrets and doubts. he then lies on his death bed waiting for the inevitable when he is returned to the past",
        "Cover": "https://i.ibb.co/6m0Y8pN/Screenshot-2024-03-07-154637.png",
        "UserID": null,
        "Price": 2450
    },
    {
        "BookID": "16",
        "Title": "Refusing the attachment of the emperor",
        "Category": "Korean manhwa",
        "Tags": "Romance, comedy",
        "Summary": "Loen Setia was the long-time lover of the emperor, Cassis Albinese, but was reduced to a mistress because of her status. In the end, Loen met her cruel death at the hands of the jealous Empress and Cassis, who had a change of heart…Before she knew it, she had been reincarnated on the day she entered the palace as Cassis's mistress. Although Loen is confused by her incredible situation, he is grateful for the opportunity she has been given and vows to take revenge on Cassis, who betrayed him, and her Empress's gang, who caused his death. One day, Loen faces a shocking truth in a corner of her imperial palace. When Loen learns of the contentsof her former emperor's will, which appoints her as her next empress, Loen trembles with her chagrin and becomes furious. Meanwhile, Cassis becomes more and more attracted to Loen, whose attitude is different from hers before. When she returns to her life, Rowen learns her terrible secret, and will he be able to successfully take revenge on her and regain his place…?",
        "Cover": "https://i.ibb.co/kx6Wk5W/Screenshot-2024-03-07-154941.png",
        "UserID": null,
        "Price": 2400
    },
    {
        "BookID": "17",
        "Title": "Nano Machine",
        "Category": "Korean manhwa",
        "Tags": "Action, Fantasy, Sci-fi",
        "Summary": "After being held in disdain and having his life put in danger, an orphan from the Demonic Cult, Cheon Yeo-Woon, has an unexpected visit from his descendant from the future who inserts a nano machine into Cheon Yeo-Woon's body, which drastically changes Cheon Yeo-Woon's life after its activation. The story of Cheon Yeo-Woon's journey of bypassing the Demonic Cult and rising to become the best martial artist has just begun.",
        "Cover": "https://i.ibb.co/SXSXVjt/Screenshot-2024-03-07-155230.png",
        "UserID": null,
        "Price": 2600
    },
    {
        "BookID": "18",
        "Title": "Overgeared",
        "Category": "Korean manhwa",
        "Tags": "Action, Fantasy",
        "Summary": "[Shin Youngwoo (Username: Grid)]The world's greatest VR game <Satisfy> Whether in reality or in the game, misfortune has always befallen upon him…An unexpected reward he discovered during a quest, 'Pagm's Rare Book'. Changing into a one of a kind, strongest, Legendary class amongst +2 billion users. “How are you still alive…?!” “Well, it's nothing complicated…” “I'm Overgeared.”",
        "Cover": "https://i.ibb.co/30xXVHq/Screenshot-2024-03-07-155338.png",
        "UserID": null,
        "Price": 2550
    },
    {
        "BookID": "19",
        "Title": "SSS-Class Suicide Hunter",
        "Category": "Korean manhwa",
        "Tags": "Mystery, action, fantasy",
        "Summary": "I want an S-Rank skill too! I want it so badly, I could die for it! [You have awakened an S-Rank skill.] [But it only works when you die.] Eh !? WHAT IS THE POINT OF GETTING ONE IF I DIE !?",
        "Cover": "https://i.ibb.co/8BQVYXS/Screenshot-2024-03-07-155601.png",
        "UserID": null, "Price": 2650
    },
    {
        "BookID": "20",
        "Title": "Kill The Hero",
        "Category": "Korean manhwa",
        "Tags": "Mystery, action, fantasy",
        "Summary": "One day, the world transformed into a game. 'Dungeons' and 'monsters' emerged in the middle of cities, and 'players' who had received the gods' authority appeared. Se-jun Lee, the guildmaster of the Messiah Guild that would bring salvation to the world. “Let us save the world together. Let's put an end to this nightmare.” The whole world celebrated the hero's appearance, And I became his comrade. But… He wasn't a hero nor a messiah like the world was hailing him. He was a deceitful hero with the secret ambition to rule the world. “You did well. If it weren't for you, I couldn't have come up till here.” I lost my life at his blade in the last dungeon. …or so i thought. The announcement I heard next to my ear the moment I died. [Starting the game.] I returned to the past, back when I still hadn't awakened as a player. And this time, It's my turn…… To 'hunt' him.",
        "Cover": "https://i.ibb.co/P4bkd56/Screenshot-2024-03-07-155648.png",
        "UserID": null,
        "Price": 2600
    },

    {
        "BookID": "21",
        "Title": "My Hero Academia",
        "Category": "Japanese manga",
        "Tags": "Comedy, action",
        "Summary": "My Hero Academia (僕のヒーローアカデミア) is one of the most popular ongoing manga in Weekly Shonen Jump with the theme of superhero. A young boy Izuku Midoriya with no special ability called Quirks tries hard to become a powerful hero to fight the Villains with other various heroes. Both the manga and its anime adaption are rated by international fans around the world.",
        "Cover": "https://i.ibb.co/dQZmGR7/Screenshot-2024-03-07-121201.png",
        "UserID": null,
        "Price": 950
    },
    {
        "BookID": "22",
        "Title": "Vagabond",
        "Category": "Japanese manga",
        "Tags": "Historical Fiction, action",
        "Summary": "Vagabond (バガボンド), an incomplete epic and historical manga, started to be published on Weekly Morning from 1998 but the writer has stopped writing since 2015. The story focuses on the life of the famous Japanese Samurai Musashi Miyamoto (who lived in 1584-1645). How the poor teenager grows and develops the sword skills as a Samurai is depicted in the manga.",
        "Cover": "https://i.ibb.co/fCZnXzm/Screenshot-2024-03-07-121254.png",
        "UserID": null,
        "Price": 800
    },
    {
        "BookID": "23",
        "Title": "Bleach",
        "Category": "Japanese manga",
        "Tags": "Mystery, comedy, action",
        "Summary": "Bleach (ブリーチ), an action and adventure manga, started on Weekly Shonen Jump in 2001 and the story was completed in 2016 with the 74 volumes. Bleach centers on the Samurai protagonist named Ichigo Kurosaki, who fights with monstrous Hollows as a Soul Reaper. The anime adaption was aired between 2004 and 2012, followed by the next series Thousand-Year Blood War from 2022.",
        "Cover": "https://i.ibb.co/C70qSB6/Screenshot-2024-03-07-121340.png",
        "UserID": null,
        "Price": 1200
    },
    {
        "BookID": "24",
        "Title": "One Punch Man",
        "Category": "Japanese manga",
        "Tags": "Mystery, action",
        "Summary": "One-Punch Man (ワンパンマン), one of the most popular manga worldwide, is a superhero and comedy title. It has been serialized on the free online manga magazine Tonari no Young Jump since 2012. The superhero-themed manga features the main character Saitama who looks a normal person but is the most strongest character. He can beat any enemies with just a single punch. It was adapted into an anime in 2015, which was followed by the second season in 2019.",
        "Cover": "https://i.ibb.co/3YfQSjN/Screenshot-2024-03-07-121445.png",
        "UserID": null,
        "Price": 1150
    },
    {
        "BookID": "25",
        "Title": "Beserk",
        "Category": "Japanese manga",
        "Tags": "Mystery, fantasy, young adult",
        "Summary": "Berserk (ベルセルク), a dark fantasy ongoing manga, has been published on Young Animal since 1989. The story focuses on the journey of the main character Guts, who survives the world in the fictional medieval Europe with his large sword. Berserk has been also made into an anime adaption and games.",
        "Cover": "https://i.ibb.co/Lxrw9Mw/Screenshot-2024-03-07-121534.png",
        "UserID": null,
        "Price": 950
    },
    {
        "BookID": "26",
        "Title": "Uzumaki",
        "Category": "Japanese manga",
        "Tags": "Mystery, action",
        "Summary": "Uzumaki (うずまき), which consists of three volumes of manga, has been popular among not only Japanese but also international fans since it was published in 1998-1999. The horror manga has the theme of Uzumaki which means spirals in Japanese. In the fictional cursed town named Kurouzu-cho, the main character Kirie Goshima and her boyfriend Shuichi Saito experiences strange supernatural incidents.",
        "Cover": "https://i.ibb.co/wrSZD85/Screenshot-2024-03-07-121617.png",
        "UserID": null,
        "Price": 900
    },
    {
        "BookID": "27",
        "Title": "Tokyo Ghoul",
        "Category": "Japanese manga",
        "Tags": "Fantasy, action",
        "Summary": "Tokyo Ghoul (東京喰種トーキョーグール) is a popular dark fantasy manga, serialized on Weekly Young Jump from 2011 to 2014 and followed by the sequel title Tokyo Ghoul:re (東京喰種トーキョーグール:re) until 2018. The setting is Tokyo where the creatures called Ghouls live in the human society. They look like a normal human but subsist on human flesh as food. Its anime adaption is also loved by the fans all over the world.",
        "Cover": "https://i.ibb.co/brN6S6r/Screenshot-2024-03-07-121741.png",
        "UserID": null, "Price": 1000
    }, {
        "BookID": "28", "Title": "Chainsaw Man",
        "Category": "Japanese manga",
        "Tags": "Mystery, action, fantasy, young adult",
        "Summary": "Chainsaw Man (チェンソーマン), a Japanese manga series written and illustrated by Tatsuki Fujimoto, is one of the best manga after the 2010s. Serialized in Weekly Shonen Jump from 2018 to 2020, the story blends dark fantasy elements with action and drama. After the first part, the second story arc started in Shonen Jump+ from July 2022. It was first adapted into a high-quaality anime by Mappa in 2022. Struggling with debt, young Denji makes a living by hunting devils. After being betrayed and killed, his pet devil dog, Pochita, revives him, resulting in their fusion. Now, as Chainsaw Man, Denji battles devils and navigates complex human relationships, all while seeking a simple, better life.",
        "Cover": "https://i.ibb.co/PQsnc5X/Screenshot-2024-03-07-121842.png",
        "UserID": null,
        "Price": 600
    },
    {
        "BookID": "29",
        "Title": "Jujutsu Kaisen",
        "Category": "Japanese manga",
        "Tags": "Mystery, action",
        "Summary": "Jujutsu Kaisen (呪術廻戦), written by Gege Akutami, is a modern dark-fantasy manga published in Weekly Shonen Jump since 2018. It has been made into an anime adaptation by Mappa since 2020. Mixed with horror and martial arts action, it's distinguished by its intense battles and intricate curse system. When Yuji Itadori consumes a cursed object, he becomes the host for a powerful Curse. Introduced to the clandestine world of Jujutsu Sorcerers, he joins Tokyo Jujutsu High. Alongside his peers, Yuji hunts down cursed objects and battles malevolent Cursed Spirits, while confronting the consequences of harboring a dangerous entity within.",
        "Cover": "https://i.ibb.co/tHnnDG9/Screenshot-2024-03-07-121954.png",
        "UserID": null, "Price": 750
    },
    {
        "BookID": "30",
        "Title": "Golden Kamuy",
        "Category": "Japanese manga",
        "Tags": "Mystery, action",
        "Summary": "A modern outstanding saga was just concluded in 2022. Golden Kamuy (ゴールデンカムイ) is a historical adventure manga written by Satoru Noda, starting its run in 2014 in Weekly Young Jump. There are 31 volumes in the manga series of Golden Kamuy, which was first adapted into an anime in 2018. It artfully combines Ainu culture, post-Russian-Japanese War settings, survival elements, and treasure hunting. Set in postwar Hokkaido, ex-soldier Saichi “Immortal” Sugimoto teams up with an Ainu girl, Asirpa, to find a hidden Ainu gold treasure using tattoos etched on escaped convicts. As they journey, they confront rivals, uncover dark secrets, and delve deep into the rich tapestry of Ainu culture and history.",
        "Cover": "https://i.ibb.co/4M63zq1/Screenshot-2024-03-07-141036.png",
        "UserID": null,
        "Price": 850
    },


]

// Initialize the store when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    bookStore.loadCartFromLocalStorage();
    bookStore.loadFavoritesFromLocalStorage();
    bookStore.initializeStore(booksData);
});