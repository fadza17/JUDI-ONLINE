// final-integration.js - Script untuk memastikan semua komponen bekerja dengan sempurna

document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting final game integration...');
    
    // 1. Initialize all required components
    initializeGameComponents();
    
    // 2. Setup error handling
    setupGlobalErrorHandling();
    
    // 3. Create missing elements if needed
    createMissingElements();
    
    // 4. Apply final fixes
    applyFinalFixes();
    
    // 5. Start the game
    startGame();
});

function initializeGameComponents() {
    console.log('Initializing game components...');
    
    // Ensure all required CSS is loaded
    if (!document.querySelector('link[href*="main.css"]')) {
        const mainCSS = document.createElement('link');
        mainCSS.rel = 'stylesheet';
        mainCSS.href = 'css/main.css';
        document.head.appendChild(mainCSS);
    }
    
    // Add enhanced CSS
    const enhancedCSS = document.createElement('style');
    enhancedCSS.textContent = `
        /* Fallback styles untuk symbols */
        .symbol-seven:not([style*="background-image"]) {
            background: #000 !important;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
        }
        .symbol-seven:not([style*="background-image"])::after {
            content: '7';
        }
        
        .symbol-bar_triple:not([style*="background-image"]) {
            background: #000 !important;
            border: 2px solid #FFD700;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #FFD700;
            font-weight: bold;
        }
        .symbol-bar_triple:not([style*="background-image"])::after {
            content: 'BAR\\ABAR\\ABAR';
            white-space: pre;
            line-height: 1.2;
            text-align: center;
        }
        
        .symbol-bar_double:not([style*="background-image"]) {
            background: #000 !important;
            border: 2px solid #FFD700;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #FFD700;
            font-weight: bold;
        }
        .symbol-bar_double:not([style*="background-image"])::after {
            content: 'BAR\\ABAR';
            white-space: pre;
            line-height: 1.4;
            text-align: center;
        }
        
        .symbol-bar_single:not([style*="background-image"]) {
            background: #000 !important;
            border: 2px solid #FFD700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #FFD700;
            font-weight: bold;
        }
        .symbol-bar_single:not([style*="background-image"])::after {
            content: 'BAR';
        }
        
        .symbol-cherry:not([style*="background-image"]) {
            background: #000 !important;
            border: 2px solid #DC143C;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        .symbol-cherry:not([style*="background-image"])::after {
            content: '🍒';
        }
        
        .symbol-blank {
            background: #222 !important;
            border: 2px solid #444;
        }
    `;
    document.head.appendChild(enhancedCSS);
    
    // Initialize localStorage data
    initializeLocalStorageData();
}

function initializeLocalStorageData() {
    // Initialize users
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@example.com',
                role: 'admin',
                balance: 1000000,
                status: 'active',
                joinDate: new Date().toISOString()
            },
            {
                id: 2,
                username: 'user',
                password: 'user123',
                email: 'user@example.com',
                role: 'user',
                balance: 500000,
                status: 'active',
                joinDate: new Date().toISOString()
            },
            {
                id: 3,
                username: 'demo',
                password: 'demo123',
                email: 'demo@example.com',
                role: 'user',
                balance: 250000,
                status: 'active',
                joinDate: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Initialize admin settings
    if (!localStorage.getItem('adminSettings')) {
        const defaultAdminSettings = {
            forceWinEnabled: false,
            winFrequency: 30,
            defaultWinAmount: 'medium',
            forceWinAfterSpins: 10
        };
        localStorage.setItem('adminSettings', JSON.stringify(defaultAdminSettings));
    }
    
    // Initialize game logs
    if (!localStorage.getItem('gameLogs')) {
        localStorage.setItem('gameLogs', JSON.stringify([]));
    }
    
    // Initialize user settings
    if (!localStorage.getItem('userSettings')) {
        localStorage.setItem('userSettings', JSON.stringify({}));
    }
}

function setupGlobalErrorHandling() {
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        showErrorNotification('Terjadi kesalahan: ' + event.error.message);
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showErrorNotification('Terjadi kesalahan sistem');
    });
}

function createMissingElements() {
    // Check and create loading overlay if missing
    if (!document.getElementById('loading-overlay')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        `;
        
        loadingOverlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(255, 215, 0, 0.3); border-top: 4px solid #FFD700; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div style="font-size: 24px; margin-bottom: 10px;">🎰 Loading Slot Master...</div>
                <div style="font-size: 16px; color: #aaa;">Memuat permainan slot...</div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
    }
    
    // Ensure all required game elements exist
    const requiredElements = [
        { id: 'reels-container', defaultContent: '<div class="reel-placeholder">Reels will be rendered here</div>' },
        { id: 'spin-btn', defaultContent: '🎰 PUTAR' },
        { id: 'bet-amount', defaultContent: 'Rp 50.000' },
        { id: 'active-lines', defaultContent: '5' },
        { id: 'user-balance', defaultContent: 'Rp 500.000' },
        { id: 'username-display', defaultContent: 'User' },
        { id: 'jackpot-amount', defaultContent: 'Rp 1.000.000' }
    ];
    
    requiredElements.forEach(element => {
        if (!document.getElementById(element.id)) {
            console.warn(`Creating missing element: ${element.id}`);
            const el = document.createElement('div');
            el.id = element.id;
            el.innerHTML = element.defaultContent;
            
            // Try to find a suitable parent
            const gameContainer = document.querySelector('.game-container') || document.body;
            gameContainer.appendChild(el);
        }
    });
}

function applyFinalFixes() {
    // Fix image loading issues
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace broken images with fallback
            if (this.src.includes('logo.png')) {
                this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22120%22 height%3D%2260%22%3E%3Crect width%3D%22120%22 height%3D%2260%22 fill%3D%22%23FFD700%22 rx%3D%228%22%2F%3E%3Ctext x%3D%2260%22 y%3D%2235%22 font-family%3D%22Arial%20Black%22 font-size%3D%2216%22 fill%3D%22%23000%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22%3ESlot Master%3C%2Ftext%3E%3C%2Fsvg%3E';
            } else if (this.src.includes('audio')) {
                this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2224%22 height%3D%2224%22 viewBox%3D%220 0 24 24%22 fill%3D%22%23FFD700%22%3E%3Cpath d%3D%22M3 9v6h4l5 5V4L7 9H3z%22%2F%3E%3Cpath d%3D%22M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 2.76-1.46 5.18-3.64 6.51l-.72-1.43C16.07 16.2 17 14.22 17 12s-.93-4.2-2.36-5.08l.72-1.43C17.54 6.82 19 9.24 19 12z%22%2F%3E%3C%2Fsvg%3E';
            }
        });
    });
    
    // Add missing animations CSS
    const animationCSS = document.createElement('style');
    animationCSS.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(animationCSS);
}

function startGame() {
    console.log('Starting game...');
    
    // Show loading
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Wait for all components to be ready
    setTimeout(() => {
        try {
            // Initialize the game based on current page
            const currentPage = window.location.pathname.split('/').pop();
            
            if (currentPage === 'game.html' || currentPage === '') {
                initializeSlotGame();
            } else if (currentPage === 'admin.html') {
                initializeAdminPanel();
            } else if (currentPage === 'index.html') {
                initializeLoginPage();
            }
            
            // Hide loading
            if (loadingOverlay) {
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 1000);
            }
            
            console.log('Game started successfully!');
            
        } catch (error) {
            console.error('Error starting game:', error);
            showErrorNotification('Gagal memulai permainan: ' + error.message);
            
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        }
    }, 1500);
}

function initializeSlotGame() {
    console.log('Initializing slot game...');
    
    // Check if we're on the game page and user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    if (currentUser.role === 'admin') {
        window.location.href = 'admin.html';
        return;
    }
    
    // Initialize game components if they exist
    if (typeof initGame === 'function') {
        initGame();
    } else {
        console.error('initGame function not found');
        // Fallback initialization
        fallbackGameInit();
    }
}

function fallbackGameInit() {
    console.log('Using fallback game initialization...');
    
    // Basic game setup
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update UI elements
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    const userBalance = document.getElementById('user-balance');
    if (userBalance && currentUser) {
        userBalance.textContent = formatCurrency(currentUser.balance || 500000);
    }
    
    // Setup basic event listeners
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', function() {
            showSuccessNotification('Spin button clicked! (Demo mode)');
        });
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

function initializeAdminPanel() {
    console.log('Initializing admin panel...');
    
    // Check if user is admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize admin UI if available
    if (typeof AdminUI === 'function') {
        window.adminUI = new AdminUI();
    } else {
        console.error('AdminUI class not found');
        // Basic admin setup
        fallbackAdminInit();
    }
}

function fallbackAdminInit() {
    console.log('Using fallback admin initialization...');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update admin name
    const adminName = document.getElementById('admin-name');
    if (adminName && currentUser) {
        adminName.textContent = currentUser.username;
    }
    
    // Setup logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.remove