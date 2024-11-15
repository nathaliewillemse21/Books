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
    
