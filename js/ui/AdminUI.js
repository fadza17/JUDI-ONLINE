// js/ui/AdminUI.js - Enhanced Admin Interface dengan RTP Control

class AdminUI {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.gameLogs = [];
        this.userRTPSettings = {};
        this.charts = {};
        
        this.init();
    }
    
    init() {
        // Check admin authentication
        if (!this.checkAdminAuth()) {
            window.location.href = 'index.html';
            return;
        }
        
        // Load data
        this.loadUsers();
        this.loadGameLogs();
        this.loadUserRTPSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize dashboard
        this.updateDashboard();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        // Setup RTP controls
        this.setupRTPControls();
    }
    
    checkAdminAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        if (!currentUser || currentUser.role !== 'admin') {
            return false;
        }
        
        this.currentUser = currentUser;
        
        // Update admin name display
        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) {
            adminNameEl.textContent = currentUser.username;
        }
        
        return true;
    }
    
    loadUsers() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
    }
    
    loadGameLogs() {
        this.gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
    }
    
    loadUserRTPSettings() {
        this.userRTPSettings = JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    }
    
    setupEventListeners() {
        // Existing event listeners
        this.setupBasicEventListeners();
        
        // RTP specific event listeners
        this.setupRTPEventListeners();
        
        // User management
        this.setupUserManagement();
        
        // Logs management
        this.setupLogsManagement();
    }
    
    setupBasicEventListeners() {
        // Win frequency slider
        const winFrequencySlider = document.getElementById('win-frequency');
        const winFrequencyValue = document.getElementById('win-frequency-value');
        
        if (winFrequencySlider && winFrequencyValue) {
            winFrequencySlider.addEventListener('input', (e) => {
                winFrequencyValue.textContent = e.target.value + '%';
                this.updateAdminSettings();
            });
        }
        
        // Force win toggle
        const forceWinEnabled = document.getElementById('force-win-enabled');
        if (forceWinEnabled) {
            forceWinEnabled.addEventListener('change', () => {
                this.updateAdminSettings();
            });
        }
        
        // Save game settings
        const saveGameSettingsBtn = document.getElementById('save-game-settings');
        if (saveGameSettingsBtn) {
            saveGameSettingsBtn.addEventListener('click', () => {
                this.saveGameSettings();
            });
        }
    }
    
    setupRTPEventListeners() {
        // RTP Control toggle
        const rtpControlEnabled = document.getElementById('rtp-control-enabled');
        if (rtpControlEnabled) {
            rtpControlEnabled.addEventListener('change', () => {
                this.updateAdminSettings();
                this.toggleRTPControls(rtpControlEnabled.checked);
            });
        }
        
        // Global RTP settings
        const globalRTPSlider = document.getElementById('global-rtp');
        const globalRTPValue = document.getElementById('global-rtp-value');
        
        if (globalRTPSlider && globalRTPValue) {
            globalRTPSlider.addEventListener('input', (e) => {
                globalRTPValue.textContent = e.target.value + '%';
                this.updateGlobalRTP(parseFloat(e.target.value));
            });
        }
        
        // RTP adjustment speed
        const rtpAdjustmentSpeed = document.getElementById('rtp-adjustment-speed');
        if (rtpAdjustmentSpeed) {
            rtpAdjustmentSpeed.addEventListener('change', () => {
                this.updateAdminSettings();
            });
        }
        
        // Apply RTP settings button
        const applyRTPBtn = document.getElementById('apply-rtp-settings');
        if (applyRTPBtn) {
            applyRTPBtn.addEventListener('click', () => {
                this.applyAllRTPSettings();
            });
        }
    }
    
    setupRTPControls() {
        this.createRTPControlsSection();
        this.updateUserRTPTable();
    }
    
    createRTPControlsSection() {
        // Check if RTP controls section exists
        let rtpSection = document.getElementById('rtp-controls-section');
        
        if (!rtpSection) {
            // Create RTP controls section
            rtpSection = document.createElement('div');
            rtpSection.id = 'rtp-controls-section';
            rtpSection.className = 'settings-card';
            rtpSection.innerHTML = `
                <h3>🎯 Kontrol RTP (Return to Player)</h3>
                
                <div class="rtp-global-controls">
                    <h4>Pengaturan Global RTP</h4>
                    <div class="form-group">
                        <label for="rtp-control-enabled">Aktifkan Kontrol RTP</label>
                        <label class="switch">
                            <input type="checkbox" id="rtp-control-enabled" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="global-rtp">RTP Global Target</label>
                        <input type="range" id="global-rtp" min="85" max="98" value="95.5" step="0.1">
                        <span id="global-rtp-value">95.5%</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="rtp-adjustment-speed">Kecepatan Penyesuaian RTP</label>
                        <select id="rtp-adjustment-speed">
                            <option value="slow">Lambat</option>
                            <option value="normal" selected>Normal</option>
                            <option value="fast">Cepat</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="max-spins-without-win">Maksimal Spin Tanpa Menang</label>
                        <input type="number" id="max-spins-without-win" min="5" max="50" value="20">
                    </div>
                    
                    <button id="apply-rtp-settings" class="btn primary-btn">Terapkan Pengaturan RTP</button>
                </div>
                
                <div class="rtp-user-controls">
                    <h4>Kontrol RTP Per User</h4>
                    <div class="user-rtp-search">
                        <input type="text" id="rtp-user-search" placeholder="Cari username...">
                        <button id="search-rtp-user" class="btn">Cari</button>
                    </div>
                    
                    <table class="user-rtp-control-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>RTP Saat Ini</th>
                                <th>Target RTP</th>
                                <th>Total Spins</th>
                                <th>Consecutive Losses</th>
                                <th>Force Loss Spins</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="user-rtp-control-body">
                        </tbody>
                    </table>
                </div>
                
                <div class="rtp-quick-actions">
                    <h4>Aksi Cepat</h4>
                    <div class="quick-action-buttons">
                        <button class="btn" onclick="adminUI.forceWinAllUsers()">Paksa Menang Semua User</button>
                        <button class="btn" onclick="adminUI.resetAllUserRTP()">Reset RTP Semua User</button>
                        <button class="btn" onclick="adminUI.setLowRTPMode()">Mode RTP Rendah (85%)</button>
                        <button class="btn" onclick="adminUI.setHighRTPMode()">Mode RTP Tinggi (97%)</button>
                    </div>
                </div>
            `;
            
            // Insert after win settings section
            const winSettingsSection = document.getElementById('win-settings');
            if (winSettingsSection && winSettingsSection.parentNode) {
                winSettingsSection.parentNode.insertBefore(rtpSection, winSettingsSection.nextSibling);
            }
        }
        
        // Setup event listeners for new elements
        this.setupRTPEventListeners();
    }
    
    updateUserRTPTable() {
        const userRTPTableBody = document.getElementById('user-rtp-control-body');
        if (!userRTPTableBody) {
            setTimeout(() => this.updateUserRTPTable(), 1000);
            return;
        }
        
        userRTPTableBody.innerHTML = '';
        
        // Get users with game activity
        const activeUsers = this.users.filter(u => u.role === 'user');
        
        activeUsers.forEach(user => {
            const userLogs = this.gameLogs.filter(log => log.username === user.username);
            const userStats = this.calculateUserRTPStats(userLogs);
            const userSettings = this.userRTPSettings[user.username] || {};
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${user.username}</strong>
                    <br><small>Balance: ${this.formatCurrency(user.balance || 0)}</small>
                </td>
                <td>
                    <span class="rtp-current ${userStats.currentRTP < 90 ? 'rtp-low' : userStats.currentRTP > 97 ? 'rtp-high' : 'rtp-normal'}">
                        ${userStats.currentRTP}%
                    </span>
                </td>
                <td>
                    <input type="number" 
                           class="rtp-target-input" 
                           value="${userSettings.customRTP || 95.5}" 
                           min="80" max="99" step="0.1"
                           data-username="${user.username}">
                    <span class="unit">%</span>
                </td>
                <td>${userStats.totalSpins}</td>
                <td>
                    <span class="consecutive-losses ${userStats.consecutiveLosses > 10 ? 'high-loss' : ''}">
                        ${userStats.consecutiveLosses}
                    </span>
                </td>
                <td>
                    <input type="number" 
                           class="force-loss-input" 
                           value="${userSettings.forceLossSpins || 0}" 
                           min="0" max="100"
                           data-username="${user.username}">
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn small-btn" onclick="adminUI.saveUserRTPSettings('${user.username}')">Simpan</button>
                        <button class="btn small-btn" onclick="adminUI.forceUserWin('${user.username}')">Paksa Menang</button>
                        <button class="btn small-btn" onclick="adminUI.resetUserRTP('${user.username}')">Reset</button>
                    </div>
                    <div class="win-type-buttons">
                        <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}', 'small')">S</button>
                        <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}', 'medium')">M</button>
                        <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}', 'large')">L</button>
                        <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}', 'jackpot')">J</button>
                    </div>
                </td>
            `;
            
            userRTPTableBody.appendChild(row);
        });
        
        // Add CSS for RTP styling
        this.addRTPStyling();
    }
    
    calculateUserRTPStats(userLogs) {
        const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        const totalSpins = userLogs.length;
        
        let consecutiveLosses = 0;
        for (let i = userLogs.length - 1; i >= 0; i--) {
            if (userLogs[i].win > 0) {
                break;
            }
            consecutiveLosses++;
        }
        
        const currentRTP = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : '0.0';
        
        return {
            currentRTP: parseFloat(currentRTP),
            totalSpins,
            consecutiveLosses,
            totalBets,
            totalWins
        };
    }
    
    addRTPStyling() {
        if (!document.getElementById('rtp-styling')) {
            const style = document.createElement('style');
            style.id = 'rtp-styling';
            style.textContent = `
                .rtp-low { color: #ff4444; font-weight: bold; }
                .rtp-normal { color: #ffaa44; }
                .rtp-high { color: #44ff44; }
                .high-loss { color: #ff4444; font-weight: bold; }
                
                .user-rtp-control-table {
                    width: 100%;
                    margin-top: 15px;
                }
                
                .user-rtp-control-table th,
                .user-rtp-control-table td {
                    padding: 8px;
                    text-align: center;
                    border: 1px solid var(--border-color);
                }
                
                .action-buttons {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 5px;
                    flex-wrap: wrap;
                }
                
                .win-type-buttons {
                    display: flex;
                    gap: 2px;
                    justify-content: center;
                }
                
                .tiny-btn {
                    padding: 2px 6px;
                    font-size: 10px;
                    min-width: 20px;
                }
                
                .rtp-target-input,
                .force-loss-input {
                    width: 60px;
                    padding: 4px;
                    margin: 2px;
                }
                
                .rtp-global-controls,
                .rtp-user-controls,
                .rtp-quick-actions {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }
                
                .quick-action-buttons {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .user-rtp-search {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .user-rtp-search input {
                    flex: 1;
                    padding: 8px;
                }
                
                /* Warning style untuk RTP rendah */
                .rtp-target-input[value*="8"]:not([value*="9"]) {
                    background-color: rgba(255, 68, 68, 0.2);
                    border-color: #ff4444;
                }
                
                .force-loss-input:not([value="0"]) {
                    background-color: rgba(255, 68, 68, 0.1);
                    border-color: #ff6666;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // RTP Control Methods
    saveUserRTPSettings(username) {
        const targetRTPInput = document.querySelector(`input.rtp-target-input[data-username="${username}"]`);
        const forceLossInput = document.querySelector(`input.force-loss-input[data-username="${username}"]`);
        
        if (!targetRTPInput || !forceLossInput) {
            this.showNotification('Input elements not found!', 'error');
            return;
        }
        
        const targetRTP = parseFloat(targetRTPInput.value);
        const forceLossSpins = parseInt(forceLossInput.value);
        
        // Validate input
        if (targetRTP < 80 || targetRTP > 99) {
            this.showNotification('RTP harus antara 80% - 99%!', 'error');
            return;
        }
        
        if (forceLossSpins < 0 || forceLossSpins > 100) {
            this.showNotification('Force loss spins harus antara 0 - 100!', 'error');
            return;
        }
        
        // Update user RTP settings
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = targetRTP;
        this.userRTPSettings[username].forceLossSpins = forceLossSpins;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply to slot machine if user is currently playing
        if (window.slotMachine && window.slotMachine.currentUsername === username) {
            window.slotMachine.setUserRTP(username, targetRTP, forceLossSpins);
        }
        
        this.showNotification(`RTP settings saved for ${username}!`, 'success');
    }
    
    forceUserWin(username, winType = 'medium') {
        // Apply to slot machine if user is currently playing
        if (window.slotMachine && window.slotMachine.currentUsername === username) {
            window.slotMachine.forceUserWin(username, winType);
            this.showNotification(`Forced ${winType} win for ${username}!`, 'success');
        } else {
            // Store for when user logs in
            if (!this.userRTPSettings[username]) {
                this.userRTPSettings[username] = {};
            }
            this.userRTPSettings[username].nextForcedWin = winType;
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            this.showNotification(`Scheduled ${winType} win for ${username}!`, 'info');
        }
    }
    
    resetUserRTP(username) {
        if (confirm(`Reset RTP statistics for ${username}?`)) {
            // Clear user RTP settings
            delete this.userRTPSettings[username];
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            
            // Reset in slot machine if user is currently playing
            if (window.slotMachine && window.slotMachine.currentUsername === username) {
                window.slotMachine.resetUserStatistics(username);
            }
            
            // Clear user logs
            this.gameLogs = this.gameLogs.filter(log => log.username !== username);
            localStorage.setItem('gameLogs', JSON.stringify(this.gameLogs));
            
            this.updateUserRTPTable();
            this.showNotification(`RTP reset for ${username}!`, 'success');
        }
    }
    
    updateGlobalRTP(targetRTP) {
        // Update all users' target RTP
        const activeUsers = this.users.filter(u => u.role === 'user');
        
        activeUsers.forEach(user => {
            if (!this.userRTPSettings[user.username]) {
                this.userRTPSettings[user.username] = {};
            }
            this.userRTPSettings[user.username].customRTP = targetRTP;
        });
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Update admin settings
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        adminSettings.globalRTP = targetRTP;
        localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
        
        this.updateUserRTPTable();
        this.showNotification(`Global RTP set to ${targetRTP}%!`, 'info');
    }
    
    applyAllRTPSettings() {
        const globalRTP = parseFloat(document.getElementById('global-rtp').value);
        const maxSpinsWithoutWin = parseInt(document.getElementById('max-spins-without-win').value);
        const rtpAdjustmentSpeed = document.getElementById('rtp-adjustment-speed').value;
        
        // Update admin settings
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        adminSettings.globalRTP = globalRTP;
        adminSettings.maxSpinsWithoutWin = maxSpinsWithoutWin;
        adminSettings.rtpAdjustmentSpeed = rtpAdjustmentSpeed;
        adminSettings.rtpControlEnabled = document.getElementById('rtp-control-enabled').checked;
        localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
        
        // Apply to slot machine
        if (window.slotMachine) {
            window.slotMachine.loadAdminSettings();
        }
        
        this.showNotification('RTP settings applied!', 'success');
    }
    
    // Quick Action Methods
    forceWinAllUsers() {
        if (confirm('Force win for all active users?')) {
            const activeUsers = this.users.filter(u => u.role === 'user');
            
            activeUsers.forEach(user => {
                this.forceUserWin(user.username, 'medium');
            });
            
            this.showNotification(`Forced win for ${activeUsers.length} users!`, 'success');
        }
    }
    
    resetAllUserRTP() {
        if (confirm('Reset RTP for all users? This will clear all game statistics!')) {
            // Clear all user RTP settings
            this.userRTPSettings = {};
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            
            // Clear all game logs
            this.gameLogs = [];
            localStorage.setItem('gameLogs', JSON.stringify(this.gameLogs));
            
            // Reset slot machine if active
            if (window.slotMachine) {
                window.slotMachine.resetUserStatistics();
            }
            
            this.updateUserRTPTable();
            this.updateDashboard();
            this.showNotification('All user RTP statistics reset!', 'success');
        }
    }
    
    setLowRTPMode() {
        if (confirm('Set all users to low RTP mode (85%)?')) {
            this.updateGlobalRTP(85.0);
            
            // Also set higher force loss spins
            const activeUsers = this.users.filter(u => u.role === 'user');
            activeUsers.forEach(user => {
                if (!this.userRTPSettings[user.username]) {
                    this.userRTPSettings[user.username] = {};
                }
                this.userRTPSettings[user.username].forceLossSpins = 25;
                this.userRTPSettings[user.username].maxSpinsWithoutWin = 30;
            });
            
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            this.updateUserRTPTable();
            this.showNotification('Low RTP mode activated!', 'warning');
        }
    }
    
    setHighRTPMode() {
        if (confirm('Set all users to high RTP mode (97%)?')) {
            this.updateGlobalRTP(97.0);
            
            // Clear force loss spins
            const activeUsers = this.users.filter(u => u.role === 'user');
            activeUsers.forEach(user => {
                if (!this.userRTPSettings[user.username]) {
                    this.userRTPSettings[user.username] = {};
                }
                this.userRTPSettings[user.username].forceLossSpins = 0;
                this.userRTPSettings[user.username].maxSpinsWithoutWin = 10;
            });
            
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            this.updateUserRTPTable();
            this.showNotification('High RTP mode activated!', 'success');
        }
    }
    
    toggleRTPControls(enabled) {
        const rtpControlSections = document.querySelectorAll('.rtp-user-controls, .rtp-quick-actions');
        rtpControlSections.forEach(section => {
            section.style.display = enabled ? 'block' : 'none';
        });
    }
    
    // Existing methods (unchanged)
    setupUserManagement() {
        // Search users
        const searchUsersBtn = document.getElementById('search-users-btn');
        const usersSearch = document.getElementById('users-search');
        
        if (searchUsersBtn && usersSearch) {
            searchUsersBtn.addEventListener('click', () => {
                this.searchUsers(usersSearch.value);
            });
            
            usersSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchUsers(usersSearch.value);
                }
            });
        }
        
        // Add user
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showUserModal('add');
            });
        }
        
        // User form submission
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }
        
        // Edit and delete buttons
        this.setupUserActions();
    }
    
    setupUserActions() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;
        
        // Use event delegation for dynamically added buttons
        usersTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const row = e.target.closest('tr');
                this.editUser(row);
            } else if (e.target.classList.contains('delete-btn')) {
                const row = e.target.closest('tr');
                this.deleteUser(row);
            }
        });
    }
    
    setupLogsManagement() {
        // Filter logs
        const filterLogsBtn = document.getElementById('filter-logs-btn');
        if (filterLogsBtn) {
            filterLogsBtn.addEventListener('click', () => {
                this.filterLogs();
            });
        }
        
        // Export logs
        const exportLogsBtn = document.getElementById('export-logs-btn');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => {
                this.exportLogs();
            });
        }
    }
    
    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
        this.updateUserRTPTable();
        this.renderUsersTable();
        this.renderLogsTable();
    }
    
    updateStats() {
        const stats = this.calculateStats();
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            // Total players
            statCards[0].querySelector('.stat-value').textContent = stats.totalPlayers;
            
            // Total spins
            statCards[1].querySelector('.stat-value').textContent = stats.totalSpins.toLocaleString();
            
            // House edge
            statCards[2].querySelector('.stat-value').textContent = this.formatCurrency(stats.houseEdge);
            
            // Overall RTP
            statCards[3].querySelector('.stat-value').textContent = stats.overallRTP + '%';
        }
    }
    
    calculateStats() {
        const totalPlayers = this.users.filter(u => u.role === 'user').length;
        const totalSpins = this.gameLogs.length;
        const totalBets = this.gameLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        const totalWins = this.gameLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        const houseEdge = totalBets - totalWins;
        const overallRTP = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : 0;
        
        return {
            totalPlayers,
            totalSpins,
            houseEdge,
            overallRTP
        };
    }
    
    updateRecentActivity() {
        const recentActivityTable = document.getElementById('recent-activity-table');
        if (!recentActivityTable) return;
        
        // Get last 10 logs
        const recentLogs = this.gameLogs.slice(-10).reverse();
        
        recentActivityTable.innerHTML = '';
        
        recentLogs.forEach(log => {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            timeCell.textContent = this.formatDateTime(log.timestamp);
            
            const userCell = document.createElement('td');
            userCell.innerHTML = `
                <strong>${log.username || 'Unknown'}</strong>
                ${log.rtp ? `<br><small>RTP: ${log.rtp.toFixed(1)}%</small>` : ''}
            `;
            
            const activityCell = document.createElement('td');
            activityCell.textContent = log.type || 'Spin';
            
            const betCell = document.createElement('td');
            betCell.textContent = this.formatCurrency(log.bet || 0);
            
            const resultCell = document.createElement('td');
            if (log.win > 0) {
                resultCell.className = 'win';
                resultCell.textContent = '+' + this.formatCurrency(log.win);
            } else {
                resultCell.className = 'loss';
                resultCell.textContent = '-' + this.formatCurrency(log.bet || 0);
            }
            
            row.appendChild(timeCell);
            row.appendChild(userCell);
            row.appendChild(activityCell);
            row.appendChild(betCell);
            row.appendChild(resultCell);
            
            recentActivityTable.appendChild(row);
        });
    }
    
    renderUsersTable() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        this.users.forEach(user => {
            const userStats = this.calculateUserRTPStats(this.gameLogs.filter(log => log.username === user.username));
            const userSettings = this.userRTPSettings[user.username] || {};
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>
                    <strong>${user.username}</strong>
                    ${userSettings.customRTP ? `<br><small>Target RTP: ${userSettings.customRTP}%</small>` : ''}
                </td>
                <td>${user.email || 'N/A'}</td>
                <td>${this.formatCurrency(user.balance || 0)}</td>
                <td>
                    ${userStats.totalSpins}
                    ${userStats.currentRTP > 0 ? `<br><small>RTP: ${userStats.currentRTP}%</small>` : ''}
                </td>
                <td>${this.formatDate(user.joinDate || new Date())}</td>
                <td><span class="status ${user.status || 'active'}">${user.status === 'inactive' ? 'Diblokir' : 'Aktif'}</span></td>
                <td>
                    <button class="btn small-btn edit-btn">Edit</button>
                    <button class="btn small-btn delete-btn">Hapus</button>
                    <br>
                    <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}')">Force Win</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
    }
    
    renderLogsTable() {
        const logsTableBody = document.getElementById('logs-table-body');
        if (!logsTableBody) return;
        
        logsTableBody.innerHTML = '';
        
        // Get filtered logs (last 50 for performance)
        const displayLogs = this.getFilteredLogs().slice(-50).reverse();
        
        displayLogs.forEach((log, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${log.id || (index + 1)}</td>
                <td>${this.formatDateTime(log.timestamp)}</td>
                <td>
                    <strong>${log.username || 'Unknown'}</strong>
                    ${log.rtp ? `<br><small>RTP: ${log.rtp.toFixed(1)}%</small>` : ''}
                    ${log.targetRTP ? `<br><small>Target: ${log.targetRTP}%</small>` : ''}
                </td>
                <td>${log.type || 'Spin'}</td>
                <td>${this.formatCurrency(log.bet || 0)}</td>
                <td class="${log.win > 0 ? 'win' : 'loss'}">
                    ${log.win > 0 ? '+' + this.formatCurrency(log.win) : '-' + this.formatCurrency(log.bet || 0)}
                </td>
                <td>${this.formatCurrency(log.balanceBefore || 0)}</td>
                <td>${this.formatCurrency(log.balanceAfter || 0)}</td>
                <td>
                    ${log.combination || 'N/A'}
                    ${log.spinsSinceLastWin ? `<br><small>No Win: ${log.spinsSinceLastWin}</small>` : ''}
                </td>
            `;
            
            logsTableBody.appendChild(row);
        });
    }
    
    getFilteredLogs() {
        let filtered = [...this.gameLogs];
        
        // Apply filters
        const typeFilter = document.getElementById('log-type-filter');
        const dateFilter = document.getElementById('log-date-filter');
        const userFilter = document.getElementById('log-user-filter');
        
        if (typeFilter && typeFilter.value !== 'all') {
            filtered = filtered.filter(log => log.type === typeFilter.value);
        }
        
        if (dateFilter && dateFilter.value) {
            const filterDate = new Date(dateFilter.value);
            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.toDateString() === filterDate.toDateString();
            });
        }
        
        if (userFilter && userFilter.value) {
            filtered = filtered.filter(log => 
                log.username && log.username.toLowerCase().includes(userFilter.value.toLowerCase())
            );
        }
        
        return filtered;
    }
    
    // User management methods
    showUserModal(mode, userData = null) {
        const modal = document.getElementById('user-modal');
        const modalTitle = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        if (!modal || !modalTitle || !form) return;
        
        form.reset();
        
        if (mode === 'add') {
            modalTitle.textContent = 'Tambah Pengguna';
            form.setAttribute('data-mode', 'add');
        } else if (mode === 'edit' && userData) {
            modalTitle.textContent = 'Edit Pengguna';
            form.setAttribute('data-mode', 'edit');
            form.setAttribute('data-user-id', userData.id);
            
            // Populate form
            document.getElementById('user-username').value = userData.username;
            document.getElementById('user-email').value = userData.email || '';
            document.getElementById('user-balance').value = userData.balance || 0;
            document.getElementById('user-status').value = userData.status || 'active';
            document.getElementById('user-role').value = userData.role || 'user';
        }
        
        modal.style.display = 'block';
    }
    
    editUser(row) {
        const cells = row.children;
        const userData = {
            id: cells[0].textContent,
            username: cells[1].textContent.split('\n')[0],
            email: cells[2].textContent,
            balance: parseFloat(cells[3].textContent.replace(/[^\d]/g, '')),
            status: cells[6].querySelector('.status').classList.contains('active') ? 'active' : 'inactive'
        };
        
        this.showUserModal('edit', userData);
    }
    
    deleteUser(row) {
        const username = row.children[1].textContent.split('\n')[0];
        
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${username}?`)) {
            this.users = this.users.filter(u => u.username !== username);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // Also delete user RTP settings
            delete this.userRTPSettings[username];
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            
            this.renderUsersTable();
            this.updateUserRTPTable();
            this.showNotification('Pengguna berhasil dihapus!', 'success');
        }
    }
    
    saveUser() {
        const form = document.getElementById('user-form');
        const mode = form.getAttribute('data-mode');
        
        const userData = {
            username: document.getElementById('user-username').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            balance: parseFloat(document.getElementById('user-balance').value) || 0,
            status: document.getElementById('user-status').value,
            role: document.getElementById('user-role').value
        };
        
        if (mode === 'add') {
            // Check if username exists
            if (this.users.some(u => u.username === userData.username)) {
                this.showNotification('Username sudah digunakan!', 'error');
                return;
            }
            
            userData.id = this.users.length + 1;
            userData.joinDate = new Date().toISOString();
            this.users.push(userData);
            
        } else if (mode === 'edit') {
            const userId = form.getAttribute('data-user-id');
            const userIndex = this.users.findIndex(u => u.id == userId);
            
            if (userIndex !== -1) {
                // Don't update password if empty
                if (!userData.password) {
                    delete userData.password;
                }
                
                this.users[userIndex] = { ...this.users[userIndex], ...userData };
            }
        }
        
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Close modal
        document.getElementById('user-modal').style.display = 'none';
        
        // Refresh tables
        this.renderUsersTable();
        this.updateUserRTPTable();
        
        this.showNotification('Pengguna berhasil disimpan!', 'success');
    }
    
    searchUsers(query) {
        const rows = document.querySelectorAll('#users-table-body tr');
        
        rows.forEach(row => {
            const username = row.children[1].textContent.toLowerCase();
            const email = row.children[2].textContent.toLowerCase();
            
            if (username.includes(query.toLowerCase()) || email.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Admin settings methods
    updateAdminSettings() {
        const settings = {
            forceWinEnabled: document.getElementById('force-win-enabled')?.checked || false,
            winFrequency: parseInt(document.getElementById('win-frequency')?.value || 30),
            defaultWinAmount: document.getElementById('force-win-amount')?.value || 'medium',
            forceWinAfterSpins: parseInt(document.getElementById('force-win-spins')?.value || 10),
            rtpControlEnabled: document.getElementById('rtp-control-enabled')?.checked || false,
            globalRTP: parseFloat(document.getElementById('global-rtp')?.value || 95.5),
            rtpAdjustmentSpeed: document.getElementById('rtp-adjustment-speed')?.value || 'normal',
            maxSpinsWithoutWin: parseInt(document.getElementById('max-spins-without-win')?.value || 20)
        };
        
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        
        // Apply to slot machine if active
        if (window.slotMachine) {
            window.slotMachine.loadAdminSettings();
        }
        
        this.showNotification('Pengaturan berhasil diperbarui!', 'info');
    }
    
    saveGameSettings() {
        const settings = {
            minBet: parseInt(document.getElementById('min-bet')?.value || 10000),
            maxBet: parseInt(document.getElementById('max-bet')?.value || 1000000),
            maxLines: parseInt(document.getElementById('max-lines')?.value || 20),
            defaultRTP: parseFloat(document.getElementById('default-rtp')?.value || 95.5)
        };
        
        // Update symbols settings
        const symbolRows = document.querySelectorAll('#symbols-table-body tr');
        const symbols = [];
        
        symbolRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 5) {
                symbols.push({
                    name: inputs[0].value,
                    payout3: parseInt(inputs[1].value || 0),
                    payout4: parseInt(inputs[2].value || 0),
                    payout5: parseInt(inputs[3].value || 0),
                    frequency: parseInt(inputs[4].value || 1)
                });
            }
        });
        
        settings.symbols = symbols;
        
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        this.showNotification('Pengaturan game berhasil disimpan!', 'success');
    }
    
    // Logs management methods
    filterLogs() {
        this.renderLogsTable();
        this.showNotification('Log berhasil difilter!', 'info');
    }
    
    exportLogs() {
        const logs = this.getFilteredLogs();
        
        // Create CSV content
        const headers = ['ID', 'Tanggal & Waktu', 'Username', 'Aktivitas', 'Taruhan', 'Hasil', 'Saldo Sebelum', 'Saldo Sesudah', 'Kombinasi', 'RTP', 'Target RTP'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.id || '',
                this.formatDateTime(log.timestamp),
                log.username || '',
                log.type || 'Spin',
                log.bet || 0,
                log.win || 0,
                log.balanceBefore || 0,
                log.balanceAfter || 0,
                log.combination || '',
                log.rtp || '',
                log.targetRTP || ''
            ].join(','))
        ].join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `game_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Log berhasil diekspor!', 'success');
    }
    
    // Real-time updates
    setupRealTimeUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            this.loadUsers();
            this.loadGameLogs();
            this.loadUserRTPSettings();
            this.updateDashboard();
        }, 30000);
        
        // Update jackpot display every 5 seconds
        setInterval(() => {
            this.updateJackpotDisplay();
        }, 5000);
    }
    
    updateJackpotDisplay() {
        // Simulate jackpot growth
        const jackpotElements = document.querySelectorAll('.jackpot-amount');
        jackpotElements.forEach(el => {
            const current = parseInt(el.textContent.replace(/[^\d]/g, ''));
            const increment = Math.floor(Math.random() * 1000) + 100;
            el.textContent = this.formatCurrency(current + increment);
        });
    }
    
    // Utility methods
    formatCurrency(amount) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }
    
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('id-ID');
    }
    
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('id-ID');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        // Set background color based on type
        const colors = {
            success: '#4ade80',
            error: '#f87171',
            warning: '#fbbf24',
            info: '#4361ee'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize AdminUI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminUI = new AdminUI();
});

// Utility functions for global access
window.adminUtils = {
    formatCurrency: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
    
    saveUserRTP: (username) => {
        if (window.adminUI) {
            window.adminUI.saveUserRTPSettings(username);
        }
    },
    
    forceUserWin: (username, winType = 'medium') => {
        if (window.adminUI) {
            window.adminUI.forceUserWin(username, winType);
        }
    },
    
    resetUserRTP: (username) => {
        if (window.adminUI) {
            window.adminUI.resetUserRTP(username);
        }
    },
    
    exportLogs: () => {
        if (window.adminUI) {
            window.adminUI.exportLogs();
        }
    }
};