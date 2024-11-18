console.log('Annyeonghaseyo')

        // Theme toggle functionality
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

        // Save theme preference to localStorage
        function saveThemePreference() {
            const isDarkMode = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        }

        // Load theme preference from localStorage
        function loadThemePreference() {
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode !== body.classList.contains('dark-mode')) {
                toggleTheme();
            }
        }

        themeToggle.addEventListener('click', saveThemePreference);
        document.addEventListener('DOMContentLoaded', loadThemePreference);
    
// Chat functionality
function toggleChat() {
  const widget = document.querySelector('.chat-widget');
  widget.classList.toggle('open');
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (message) {
      addMessage(message, 'sent');
      input.value = '';
      
      // Simulate response after 1 second
      setTimeout(() => {
          addMessage('Thanks for your message! Our team will get back to you soon.', 'received');
      }, 1000);
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
      sendMessage();
  }
}

function addMessage(text, type) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
  toggleChat(); // Start with chat closed
});
