// Main application JavaScript
class BuellDocsApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.initializeComponents();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('getStartedBtn')?.addEventListener('click', () => this.showModal('registerModal'));

        // Modal events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.hideModal(e.target.closest('.modal').id);
            });
        });

        // Modal switching
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Service card interactions
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                if (!this.isAuthenticated) {
                    this.showModal('loginModal');
                }
            });
        });
    }

    checkAuthStatus() {
        // Check if user is logged in (in a real app, this would check localStorage/sessionStorage or make an API call)
        const savedUser = localStorage.getItem('buelldocs_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.showDashboard();
        }
    }

    initializeComponents() {
        // Initialize any components that need setup
        this.initializeAnimations();
        this.initializeTooltips();
    }

    initializeAnimations() {
        // Add scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe service cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    initializeTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.classList.add('tooltip');
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            // Add animation class
            setTimeout(() => {
                modal.querySelector('.modal-content').style.transform = 'scale(1)';
                modal.querySelector('.modal-content').style.opacity = '1';
            }, 10);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const content = modal.querySelector('.modal-content');
            content.style.transform = 'scale(0.9)';
            content.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                // Reset form if it exists
                const form = modal.querySelector('form');
                if (form) form.reset();
            }, 300);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(1000);
            
            // For demo purposes, accept any email/password
            const user = {
                id: 1,
                name: 'Ferris Bueller',
                email: email,
                avatar: 'FB'
            };

            this.currentUser = user;
            this.isAuthenticated = true;
            localStorage.setItem('buelldocs_user', JSON.stringify(user));

            this.hideModal('loginModal');
            this.showDashboard();
            this.showMessage('Welcome back, ' + user.name + '!', 'success');

        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(1500);
            
            const user = {
                id: Date.now(),
                name: name,
                email: email,
                avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
            };

            this.currentUser = user;
            this.isAuthenticated = true;
            localStorage.setItem('buelldocs_user', JSON.stringify(user));

            this.hideModal('registerModal');
            this.showDashboard();
            this.showMessage('Account created successfully! Welcome to BuellDocs.', 'success');

        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showDashboard() {
        // Hide main content
        document.querySelector('.main-nav').style.display = 'none';
        document.querySelector('.hero').style.display = 'none';
        document.querySelector('.services').style.display = 'none';

        // Show dashboard
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.remove('hidden');

        // Update user info in sidebar
        this.updateUserInfo();

        // Initialize dashboard
        if (window.dashboardManager) {
            window.dashboardManager.init();
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userAvatar = document.querySelector('.user-avatar');
            const userName = document.querySelector('.user-name');
            const userEmail = document.querySelector('.user-email');

            if (userAvatar) userAvatar.textContent = this.currentUser.avatar;
            if (userName) userName.textContent = this.currentUser.name;
            if (userEmail) userEmail.textContent = this.currentUser.email;
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('buelldocs_user');

        // Show main content
        document.querySelector('.main-nav').style.display = 'block';
        document.querySelector('.hero').style.display = 'flex';
        document.querySelector('.services').style.display = 'block';

        // Hide dashboard
        document.getElementById('dashboard').classList.add('hidden');

        this.showMessage('You have been logged out successfully.', 'info');
    }

    showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <span class="message-icon">${this.getMessageIcon(type)}</span>
            <span class="message-text">${text}</span>
        `;

        // Add to page
        document.body.appendChild(message);

        // Position message
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.zIndex = '3000';
        message.style.maxWidth = '400px';
        message.style.transform = 'translateX(100%)';
        message.style.transition = 'transform 0.3s ease';

        // Animate in
        setTimeout(() => {
            message.style.transform = 'translateX(0)';
        }, 10);

        // Remove after delay
        setTimeout(() => {
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 5000);
    }

    getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    simulateApiCall(delay = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.buellDocsApp = new BuellDocsApp();
});

// Add some CSS for modal animations
const style = document.createElement('style');
style.textContent = `
    .modal-content {
        transform: scale(0.9);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .message {
        box-shadow: var(--shadow-lg);
    }
    
    .message-icon {
        font-size: 1.2rem;
    }
    
    .message-text {
        flex: 1;
    }
`;
document.head.appendChild(style);