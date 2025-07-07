// game.js - Complete Game Logic

// Global variables
let slotMachine = null;
let currentUsername = null;

// DOM elements
const reelsContainer = document.querySelector('.reels-container');
const spinBtn = document.getElementById('spin-btn');
const maxBetBtn = document.getElementById('max-bet-btn');
const autoSpinBtn = document.getElementById('auto-spin-btn');
const increaseBetBtn = document.getElementById('increase-bet');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseLinesBtn = document.getElementById('increase-lines');
const decreaseLinesBtn = document.getElementById('decrease-lines');
const betAmountDisplay = document.getElementById('bet-amount');
const activeLinesDisplay = document.getElementById('active-lines');
const userBalanceDisplay = document.getElementById('user-balance');
const usernameDisplay = document.getElementById('username-display');
const jackpotAmountDisplay = document.getElementById('jackpot-amount');
const logoutBtn = document.getElementById('logout-btn');
const paytableBtn = document.getElementById('paytable-btn');
const paytableModal = document.getElementById('paytable-modal');
const toggleAudioBtn = document.getElementById('toggle-audio');
const resultsHistory = document.getElementById('results-history');
const winAnimation = document.getElementById('win-animation');

// Game state
let autoSpinCount = 0;
let maxAutoSpins = 0;
let gameHistory = [];

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing game...");
    initGame();
});

// --- Auth Functions ---

// Check user login
function checkUserLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    console.log("Current user from localStorage:", currentUser);
    
    if (!currentUser) {
        console.log("No current user found, redirecting to login page");
        window.location.href = 'index.html';
        return false;
    }
    
    currentUsername = currentUser.username;
    console.log("Current username set to:", currentUsername);
    
    // Check if user is admin
    if (currentUser.role === 'admin') {
        console.log("User is admin, redirecting to admin page");
        window.location.href = 'admin.html';
        return false;
    }
    
    // Update UI with username
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUsername;
    }
    
    return true;
}

// Logout function
function logout() {
    console.log("Logging out user...");
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// --- Game Initialization ---

function initGame() {
    console.log("Initializing game...");
    
    // Check user login
    if (!checkUserLogin()) {
        return;
    }
    
    // Create SlotMachine instance
    slotMachine = new SlotMachine(CONFIG);
    console.log("SlotMachine instance created");
    
    // Set event handlers
    slotMachine.onSpinStart = handleSpinStart;
    slotMachine.onSpinComplete = handleSpinComplete;
    slotMachine.onWin = handleWin;
    slotMachine.onBalanceChange = updateBalanceDisplay;
    slotMachine.onError = showError;
    
    // Set username
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        slotMachine.setUsername(currentUser.username);
        console.log("Username set in slot machine:", currentUser.username);
    }
    
    // Render game
    if (reelsContainer) {
        slotMachine.renderTo(reelsContainer);
        console.log("Game rendered to reels container");
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Render pay table
    renderPayTable();
    
    // Update UI
    updateUI();
    
    console.log("Game initialization complete");
}

// --- Event Handlers ---

function setupEventListeners() {
    // Spin controls
    if (spinBtn) {
        spinBtn.addEventListener('click', handleSpin);
    }
    
    if (maxBetBtn) {
        maxBetBtn.addEventListener('click', handleMaxBet);
    }
    
    if (autoSpinBtn) {
        autoSpinBtn.addEventListener('click', handleAutoSpin);
    }
    
    // Bet controls
    if (increaseBetBtn) {
        increaseBetBtn.addEventListener('click', () => changeBet(CONFIG.betIncrement));
    }
    
    if (decreaseBetBtn) {
        decreaseBetBtn.addEventListener('click', () => changeBet(-CONFIG.betIncrement));
    }
    
    // Lines controls
    if (increaseLinesBtn) {
        increaseLinesBtn.addEventListener('click', () => changeLines(1));
    }
    
    if (decreaseLinesBtn) {
        decreaseLinesBtn.addEventListener('click', () => changeLines(-1));
    }
    
    // Other controls
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (paytableBtn) {
        paytableBtn.addEventListener('click', showPaytable);
    }
    
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', toggleAudio);
    }
    
    // Modal close
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', hidePaytable);
    }
    
    // Close modal when clicking outside
    if (paytableModal) {
        paytableModal.addEventListener('click', function(e) {
            if (e.target === paytableModal) {
                hidePaytable();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Handle spin button click
function handleSpin() {
    if (!slotMachine || slotMachine.isSpinning) return;
    
    slotMachine.spin();
}

// Handle max bet
function handleMaxBet() {
    if (!slotMachine || slotMachine.isSpinning) return;
    
    slotMachine.setBet(CONFIG.maxBet);
    slotMachine.setActiveLines(CONFIG.maxLines);
    updateUI();
}

// Handle auto spin
function handleAutoSpin() {
    if (!slotMachine) return;
    
    if (slotMachine.autoSpinEnabled) {
        // Stop auto spin
        slotMachine.setAutoSpin(false);
        autoSpinBtn.textContent = '🔄 AUTO';
        autoSpinBtn.classList.remove('active');
    } else {
        // Start auto spin
        slotMachine.setAutoSpin(true);
        autoSpinBtn.textContent = '⏹️ STOP';
        autoSpinBtn.classList.add('active');
    }
}

// Change bet amount
function changeBet(delta) {
    if (!slotMachine || slotMachine.isSpinning) return;
    
    const newBet = slotMachine.bet + delta;
    if (slotMachine.setBet(newBet)) {
        updateUI();
    }
}

// Change active lines
function changeLines(delta) {
    if (!slotMachine || slotMachine.isSpinning) return;
    
    const newLines = slotMachine.activeLines + delta;
    if (slotMachine.setActiveLines(newLines)) {
        updateUI();
    }
}

// Handle keyboard shortcuts
function handleKeyboard(event) {
    if (!slotMachine || slotMachine.isSpinning) return;
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            handleSpin();
            break;
        case 'KeyM':
            event.preventDefault();
            handleMaxBet();
            break;
        case 'KeyA':
            event.preventDefault();
            handleAutoSpin();
            break;
        case 'ArrowUp':
            event.preventDefault();
            changeBet(CONFIG.betIncrement);
            break;
        case 'ArrowDown':
            event.preventDefault();
            changeBet(-CONFIG.betIncrement);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            changeLines(-1);
            break;
        case 'ArrowRight':
            event.preventDefault();
            changeLines(1);
            break;
    }
}

// --- Game Event Handlers ---

function handleSpinStart() {
    console.log("Spin started");
    
    // Disable controls
    setControlsEnabled(false);
    
    // Clear previous highlights
    slotMachine.clearHighlights();
    
    // Hide win animation
    if (winAnimation) {
        winAnimation.classList.remove('active');
    }
    
    // Play spin sound
    slotMachine.playSound('spin');
}

function handleSpinComplete(result) {
    console.log("Spin complete:", result);
    
    // Enable controls
    setControlsEnabled(true);
    
    // Add to history
    addToHistory(result);
    
    // Update jackpot display
    updateJackpotDisplay();
}

function handleWin(result) {
    console.log("Win!", result);
    
    // Show win animation
    showWinAnimation(result);
    
    // Play win sound
    if (result.isJackpot) {
        slotMachine.playSound('jackpot');
    } else {
        slotMachine.playSound('win');
    }
    
    // Celebrate symbols
    result.wins.forEach(win => {
        win.symbols.forEach((symbol, index) => {
            if (index < win.count) {
                symbol.celebrateWin(win.amount);
            }
        });
    });
}

// --- UI Functions ---

function updateUI() {
    if (!slotMachine) return;
    
    // Update bet display
    if (betAmountDisplay) {
        betAmountDisplay.textContent = formatCurrency(slotMachine.bet);
    }
    
    // Update lines display
    if (activeLinesDisplay) {
        activeLinesDisplay.textContent = slotMachine.activeLines;
    }
    
    // Update balance display
    updateBalanceDisplay(slotMachine.balance);
    
    // Update jackpot display
    updateJackpotDisplay();
}

function updateBalanceDisplay(balance) {
    if (userBalanceDisplay) {
        userBalanceDisplay.textContent = formatCurrency(balance);
    }
}

function updateJackpotDisplay() {
    if (jackpotAmountDisplay && slotMachine) {
        jackpotAmountDisplay.textContent = formatCurrency(slotMachine.getProgressiveJackpot());
    }
}

function setControlsEnabled(enabled) {
    const controls = [spinBtn, maxBetBtn, autoSpinBtn, increaseBetBtn, decreaseBetBtn, increaseLinesBtn, decreaseLinesBtn];
    
    controls.forEach(btn => {
        if (btn) {
            btn.disabled = !enabled;
            if (enabled) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        }
    });
}

function showWinAnimation(result) {
    if (!winAnimation) return;
    
    const winText = winAnimation.querySelector('.win-text');
    const winAmount = winAnimation.querySelector('.win-amount');
    
    // Set win text based on amount
    if (result.isJackpot) {
        winAnimation.classList.add('jackpot');
        winText.textContent = '🏆 JACKPOT! 🏆';
        createFireworks();
    } else if (result.totalWin >= slotMachine.bet * 10) {
        winText.textContent = '💎 BIG WIN! 💎';
    } else {
        winText.textContent = '🎉 MENANG! 🎉';
    }
    
    // Set win amount
    if (winAmount) {
        winAmount.textContent = formatCurrency(result.totalWin);
    }
    
    // Show animation
    winAnimation.classList.add('active');
    
    // Hide after delay
    setTimeout(() => {
        winAnimation.classList.remove('active', 'jackpot');
    }, result.isJackpot ? 5000 : 3000);
}

function createFireworks() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                animation: fireworkExplode 2s ease-out forwards;
            `;
            
            document.body.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }, i * 100);
    }
}

function addToHistory(result) {
    const historyItem = {
        spin: gameHistory.length + 1,
        bet: result.bet,
        win: result.totalWin,
        isJackpot: result.isJackpot,
        timestamp: new Date()
    };
    
    gameHistory.unshift(historyItem);
    
    // Keep only last 10 results
    if (gameHistory.length > 10) {
        gameHistory = gameHistory.slice(0, 10);
    }
    
    // Update history display
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (!resultsHistory) return;
    
    resultsHistory.innerHTML = '';
    
    gameHistory.forEach(item => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        
        const spinDiv = document.createElement('div');
        spinDiv.className = 'result-spin';
        spinDiv.textContent = `Spin #${item.spin}`;
        
        const amountDiv = document.createElement('div');
        amountDiv.className = 'result-amount';
        
        if (item.win > 0) {
            amountDiv.classList.add(item.isJackpot ? 'jackpot' : 'win');
            amountDiv.textContent = `+${formatCurrency(item.win)}`;
        } else {
            amountDiv.classList.add('loss');
            amountDiv.textContent = `-${formatCurrency(item.bet)}`;
        }
        
        resultDiv.appendChild(spinDiv);
        resultDiv.appendChild(amountDiv);
        resultsHistory.appendChild(resultDiv);
    });
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f87171;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            errorDiv.remove();
        }, 300);
    }, 3000);
}

// --- Paytable Functions ---

function renderPayTable() {
    const paytableContent = document.getElementById('paytable-content');
    if (!paytableContent || !slotMachine) return;
    
    paytableContent.innerHTML = '';
    
    // Get symbols from config
    CONFIG.reels.symbols.forEach(symbolConfig => {
        if (symbolConfig.id === 'blank') return; // Skip blank symbols
        
        const payItem = document.createElement('div');
        payItem.className = 'pay-item';
        
        // Symbol preview
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'pay-symbol';
        symbolDiv.style.backgroundImage = `url(${symbolConfig.image || symbolConfig.fallbackSvg})`;
        symbolDiv.style.backgroundSize = 'contain';
        symbolDiv.style.backgroundRepeat = 'no-repeat';
        symbolDiv.style.backgroundPosition = 'center';
        
        // Symbol info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'pay-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'pay-name';
        nameDiv.textContent = getSymbolDisplayName(symbolConfig);
        
        const valuesDiv = document.createElement('div');
        symbolConfig.payouts.forEach((payout, index) => {
            if (payout > 0) {
                const valueDiv = document.createElement('div');
                valueDiv.className = 'pay-value';
                valueDiv.textContent = `${index + 1}x: ${payout}x taruhan`;
                valuesDiv.appendChild(valueDiv);
            }
        });
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(valuesDiv);
        
        payItem.appendChild(symbolDiv);
        payItem.appendChild(infoDiv);
        paytableContent.appendChild(payItem);
    });
}

function getSymbolDisplayName(symbolConfig) {
    const icons = {
        'seven': '🎯',
        'bar_triple': '🏆',
        'bar_double': '🥈',
        'bar_single': '🥉',
        'cherry': '🍒'
    };
    
    const icon = icons[symbolConfig.id] || '💎';
    return `${icon} ${symbolConfig.name}`;
}

function showPaytable() {
    if (paytableModal) {
        paytableModal.style.display = 'block';
    }
}

function hidePaytable() {
    if (paytableModal) {
        paytableModal.style.display = 'none';
    }
}

// --- Audio Functions ---

function toggleAudio() {
    if (!slotMachine) return;
    
    slotMachine.soundEnabled = !slotMachine.soundEnabled;
    
    const audioImg = toggleAudioBtn.querySelector('img');
    if (audioImg) {
        if (slotMachine.soundEnabled) {
            audioImg.src = 'assets/images/ui/audio-on.png';
            audioImg.alt = 'Audio On';
        } else {
            audioImg.src = 'assets/images/ui/audio-off.png';
            audioImg.alt = 'Audio Off';
        }
    }
}

// --- Utility Functions ---

function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

// --- Admin Functions (for testing) ---

function getAdminSettings() {
    const settings = localStorage.getItem('adminSettings');
    return settings ? JSON.parse(settings) : {
        forceWinEnabled: false,
        winFrequency: 30,
        defaultWinAmount: 'medium',
        forceWinAfterSpins: 10
    };
}

function saveAdminSettings(settings) {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    if (slotMachine) {
        slotMachine.loadAdminSettings();
    }
}

// --- CSS Animations ---

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fireworkExplode {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        50% {
            transform: scale(20);
            opacity: 0.8;
        }
        100% {
            transform: scale(40);
            opacity: 0;
        }
    }
    
    .error-notification {
        animation: slideIn 0.3s ease-out;
    }
    
    .disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
    }
    
    .result-item {
        transition: transform 0.2s ease;
    }
    
    .result-item:hover {
        transform: translateY(-2px);
    }
`;

document.head.appendChild(style);

// --- Debug Functions (Remove in production) ---

function debugGameState() {
    if (slotMachine) {
        console.log('Game State:', slotMachine.getStatistics());
        console.log('Current User:', currentUsername);
        console.log('Game History:', gameHistory);
    }
}

// Make debug function available globally
window.debugGameState = debugGameState;

// --- Initialization Check ---

// Ensure all required elements exist
function checkRequiredElements() {
    const required = [
        'reels-container', 'spin-btn', 'bet-amount', 'active-lines',
        'user-balance', 'username-display', 'jackpot-amount'
    ];
    
    const missing = required.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
        console.error('Missing required elements:', missing);
        return false;
    }
    
    return true;
}

// Final initialization
document.addEventListener('DOMContentLoaded', function() {
    if (!checkRequiredElements()) {
        console.error('Cannot initialize game: missing required elements');
        return;
    }
    
    // Add loading state
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        
        // Hide loading after game initialization
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 2000);
    }
});

// Export functions for global access
window.slotGame = {
    formatCurrency,
    debugGameState,
    getAdminSettings,
    saveAdminSettings
};