// login.js - Kode yang diperbaiki untuk menangani login dan registrasi

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerToggle = document.getElementById('register-toggle');
    const loginToggle = document.getElementById('login-toggle');
    const errorMessage = document.getElementById('error-message');
    
    // Inisialisasi users jika belum ada di localStorage
    initializeUsers();
    
    // Toggle between login and register forms
    registerToggle.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';
    });
    
    loginToggle.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Authenticate user
        const user = authenticateUser(username, password);
        
        if (user) {
            // Set current user in session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on user role
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'game.html';
            }
        } else {
            showError('Username atau password salah');
        }
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        // Basic validation
        if (password !== confirmPassword) {
            showError('Password tidak cocok');
            return;
        }
        
        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(user => user.username === username)) {
            showError('Username sudah digunakan');
            return;
        }
        
        // Register new user
        const newUser = registerUser(username, email, password);
        
        if (newUser) {
            showSuccess('Registrasi berhasil! Silakan login');
            
            // Clear form and switch to login
            registerForm.reset();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        } else {
            showError('Gagal mendaftarkan pengguna');
        }
    });
    
    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.backgroundColor = 'rgba(255, 78, 80, 0.3)';
    }
    
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.backgroundColor = 'rgba(75, 181, 67, 0.3)';
    }
});

// Initialize default users if not already present
function initializeUsers() {
    // Check if users array exists in localStorage
    if (!localStorage.getItem('users')) {
        // Create default users
        const defaultUsers = [
            { 
                id: 1, 
                username: 'admin', 
                password: 'admin123', 
                email: 'admin@example.com',
                role: 'admin',
                balance: 1000000
            },
            { 
                id: 2, 
                username: 'user', 
                password: 'user123', 
                email: 'user@example.com',
                role: 'user',
                balance: 500000
            }
        ];
        
        // Store in localStorage
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Authenticate user function
function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.username === username && user.password === password) || null;
}

// Register new user function
function registerUser(username, email, password) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Create new user object
        const newUser = {
            id: users.length + 1,
            username: username,
            email: email,
            password: password,
            role: 'user',
            balance: 100000 // Starting balance for new users
        };
        
        // Add to users array
        users.push(newUser);
        
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('User registered successfully:', newUser);
        return newUser;
    } catch (error) {
        console.error('Error registering user:', error);
        return null;
    }
}

// Debug function to check users in localStorage
function debugUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Current users in localStorage:', users);
}

// Call debug function when page loads to check current users
debugUsers();