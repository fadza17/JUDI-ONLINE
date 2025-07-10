// js/ui/AdminUI.js - COMPLETE VERSION dengan User Management yang lengkap

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
        
        // Setup components
        this.setupRTPControls();
        this.setupUserManagement();
        this.setupLogsManagement();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('AdminUI initialized with all components');
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
        console.log('Loaded users:', this.users.length);
    }
    
    loadGameLogs() {
        this.gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        console.log('Loaded game logs:', this.gameLogs.length);
    }
    
    loadUserRTPSettings() {
        this.userRTPSettings = JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
        console.log('Loaded RTP settings:', Object.keys(this.userRTPSettings).length);
    }
    
    setupEventListeners() {
        // Navigation menu
        this.setupNavigation();
        
        // RTP controls
        this.setupRTPEventListeners();
        
        // User management
        this.setupUserManagementListeners();
        
        // Game settings
        this.setupGameSettingsListeners();
        
        // Basic controls
        this.setupBasicEventListeners();
    }
    
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu li[data-section]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.switchToSection(section);
            });
        });
    }
    
    switchToSection(sectionId) {
        console.log(`Switching to section: ${sectionId}`);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update menu active state
        document.querySelectorAll('.menu li').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        const sectionNames = {
            'dashboard': 'Dashboard',
            'rtp-control': 'Kontrol RTP',
            'game-settings': 'Pengaturan Game',
            'win-settings': 'Pengaturan Kemenangan',
            'users': 'Manajemen User',
            'logs': 'Log Permainan'
        };
        if (pageTitle) {
            pageTitle.textContent = sectionNames[sectionId] || 'Dashboard';
        }
        
        // Refresh data for the section
        this.refreshSectionData(sectionId);
    }
    
    refreshSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'rtp-control':
                this.updateUserRTPTable();
                break;
            case 'users':
                this.renderUsersTable();
                break;
            case 'logs':
                this.renderLogsTable();
                break;
        }
    }
    
    setupBasicEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
        
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
    }
    
    setupRTPEventListeners() {
        // RTP Control toggle
        const rtpControlEnabled = document.getElementById('rtp-control-enabled');
        if (rtpControlEnabled) {
            rtpControlEnabled.addEventListener('change', () => {
                this.updateAdminSettings();
            });
        }
        
        // Global RTP slider
        const globalRTPSlider = document.getElementById('global-rtp');
        const globalRTPValue = document.getElementById('global-rtp-value');
        
        if (globalRTPSlider && globalRTPValue) {
            globalRTPSlider.addEventListener('input', (e) => {
                globalRTPValue.textContent = e.target.value + '%';
            });
        }
        
        // Apply RTP settings button
        const applyRTPBtn = document.getElementById('apply-rtp-settings');
        if (applyRTPBtn) {
            applyRTPBtn.addEventListener('click', () => {
                this.applyAllRTPSettings();
            });
        }
        
        // User search
        const searchBtn = document.getElementById('search-rtp-user');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchUsers();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-rtp-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshRTPData();
            });
        }
    }
    
    setupUserManagementListeners() {
        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showUserModal('add');
            });
        }
        
        // User search
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
        
        // User form submission
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }
        
        // Cancel user edit
        const cancelUserEditBtn = document.getElementById('cancel-user-edit');
        if (cancelUserEditBtn) {
            cancelUserEditBtn.addEventListener('click', () => {
                this.hideUserModal();
            });
        }
        
        // Close modal buttons
        const closeModalBtns = document.querySelectorAll('.close');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideUserModal();
            });
        });
        
        // Modal click outside to close
        const userModal = document.getElementById('user-modal');
        if (userModal) {
            userModal.addEventListener('click', (e) => {
                if (e.target === userModal) {
                    this.hideUserModal();
                }
            });
        }
    }
    
    setupGameSettingsListeners() {
        // Save game settings
        const saveGameSettingsBtn = document.getElementById('save-game-settings');
        if (saveGameSettingsBtn) {
            saveGameSettingsBtn.addEventListener('click', () => {
                this.saveGameSettings();
            });
        }
        
        // Reset game settings
        const resetGameSettingsBtn = document.getElementById('reset-game-settings');
        if (resetGameSettingsBtn) {
            resetGameSettingsBtn.addEventListener('click', () => {
                this.resetGameSettings();
            });
        }
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
    
    // ==================== USER MANAGEMENT ====================
    
    setupUserManagement() {
        this.renderUsersTable();
        this.setupUserTableActions();
    }
    
    setupUserTableActions() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;
        
        // Use event delegation for dynamically added buttons
        usersTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            
            if (target.classList.contains('edit-btn')) {
                this.editUser(row);
            } else if (target.classList.contains('delete-btn')) {
                this.deleteUser(row);
            } else if (target.onclick && target.onclick.toString().includes('forceUserWin')) {
                // Handle force win buttons
                const username = this.getUsernameFromRow(row);
                this.forceUserWin(username, 'medium');
            }
        });
    }
    
    renderUsersTable() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) {
            console.error('Users table body not found');
            return;
        }
        
        console.log('Rendering users table with', this.users.length, 'users');
        
        usersTableBody.innerHTML = '';
        
        this.users.forEach(user => {
            const userStats = this.calculateUserRTPStats(this.gameLogs.filter(log => log.username === user.username));
            const userSettings = this.userRTPSettings[user.username] || {};
            
            const row = document.createElement('tr');
            row.setAttribute('data-username', user.username);
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>
                    <strong>${user.username}</strong>
                    ${userSettings.customRTP ? `<br><small style="color: #4ade80;">Target RTP: ${userSettings.customRTP}%</small>` : ''}
                    ${userSettings.nextForcedResult ? `<br><small style="color: #fbbf24;">Next: ${userSettings.nextForcedResult}</small>` : ''}
                </td>
                <td>${user.email || 'N/A'}</td>
                <td>${this.formatCurrency(user.balance || 0)}</td>
                <td>
                    <strong>${userStats.totalSpins}</strong>
                    ${userStats.currentRTP > 0 ? `<br><small style="color: #60a5fa;">RTP: ${userStats.currentRTP}%</small>` : ''}
                    ${userStats.consecutiveLosses > 0 ? `<br><small style="color: #f87171;">Losses: ${userStats.consecutiveLosses}</small>` : ''}
                </td>
                <td>${this.formatDate(user.joinDate || new Date())}</td>
                <td>
                    <span class="status ${user.status === 'inactive' ? 'inactive' : 'active'}">
                        ${user.status === 'inactive' ? 'Diblokir' : 'Aktif'}
                    </span>
                </td>
                <td>
                    <div class="user-actions">
                        <button class="btn small-btn edit-btn" style="background: #4361ee; color: white; margin: 2px;">
                            ✏️ Edit
                        </button>
                        <button class="btn small-btn delete-btn" style="background: #ef4444; color: white; margin: 2px;">
                            🗑️ Hapus
                        </button>
                        <br>
                        <button class="btn tiny-btn" onclick="adminUI.forceUserWin('${user.username}', 'medium')" 
                                style="background: #4ade80; color: white; padding: 4px 8px; margin: 1px; font-size: 11px;">
                            🏆 Force Win
                        </button>
                        <button class="btn tiny-btn" onclick="adminUI.setUserRTP('${user.username}', 97)" 
                                style="background: #f59e0b; color: white; padding: 4px 8px; margin: 1px; font-size: 11px;">
                            📈 High RTP
                        </button>
                    </div>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        console.log('Users table rendered successfully');
    }
    
    getUsernameFromRow(row) {
        return row.getAttribute('data-username') || 
               row.querySelector('strong')?.textContent || 
               '';
    }
    
    editUser(row) {
        const username = this.getUsernameFromRow(row);
        const user = this.users.find(u => u.username === username);
        
        if (!user) {
            console.error('User not found:', username);
            return;
        }
        
        console.log('Editing user:', user);
        this.showUserModal('edit', user);
    }
    
    deleteUser(row) {
        const username = this.getUsernameFromRow(row);
        
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${username}?`)) {
            console.log('Deleting user:', username);
            
            // Remove from users array
            this.users = this.users.filter(u => u.username !== username);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // Remove RTP settings
            delete this.userRTPSettings[username];
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            
            // Remove from game logs
            this.gameLogs = this.gameLogs.filter(log => log.username !== username);
            localStorage.setItem('gameLogs', JSON.stringify(this.gameLogs));
            
            // Refresh tables
            this.renderUsersTable();
            this.updateUserRTPTable();
            this.updateDashboard();
            
            this.showNotification(`Pengguna ${username} berhasil dihapus!`, 'success');
        }
    }
    
    showUserModal(mode, userData = null) {
        const modal = document.getElementById('user-modal');
        const modalTitle = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        
        if (!modal || !modalTitle || !form) {
            console.error('User modal elements not found');
            return;
        }
        
        form.reset();
        
        if (mode === 'add') {
            modalTitle.textContent = 'Tambah Pengguna';
            form.setAttribute('data-mode', 'add');
            form.removeAttribute('data-user-id');
            form.removeAttribute('data-username');
        } else if (mode === 'edit' && userData) {
            modalTitle.textContent = 'Edit Pengguna';
            form.setAttribute('data-mode', 'edit');
            form.setAttribute('data-user-id', userData.id);
            form.setAttribute('data-username', userData.username);
            
            // Populate form
            document.getElementById('user-username').value = userData.username;
            document.getElementById('user-email').value = userData.email || '';
            document.getElementById('user-balance').value = userData.balance || 0;
            document.getElementById('user-status').value = userData.status || 'active';
            document.getElementById('user-role').value = userData.role || 'user';
            
            // Don't populate password for security
            document.getElementById('user-password').value = '';
        }
        
        modal.style.display = 'block';
        console.log('User modal opened:', mode, userData);
    }
    
    hideUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    saveUser() {
        const form = document.getElementById('user-form');
        const mode = form.getAttribute('data-mode');
        
        console.log('Saving user, mode:', mode);
        
        const userData = {
            username: document.getElementById('user-username').value.trim(),
            email: document.getElementById('user-email').value.trim(),
            password: document.getElementById('user-password').value,
            balance: parseFloat(document.getElementById('user-balance').value) || 0,
            status: document.getElementById('user-status').value,
            role: document.getElementById('user-role').value
        };
        
        // Validation
        if (!userData.username) {
            this.showNotification('Username tidak boleh kosong!', 'error');
            return;
        }
        
        if (mode === 'add') {
            // Check if username exists
            if (this.users.some(u => u.username === userData.username)) {
                this.showNotification('Username sudah digunakan!', 'error');
                return;
            }
            
            if (!userData.password) {
                this.showNotification('Password tidak boleh kosong untuk user baru!', 'error');
                return;
            }
            
            // Add new user
            userData.id = Math.max(...this.users.map(u => u.id), 0) + 1;
            userData.joinDate = new Date().toISOString();
            this.users.push(userData);
            
            console.log('New user added:', userData);
            
        } else if (mode === 'edit') {
            const username = form.getAttribute('data-username');
            const userIndex = this.users.findIndex(u => u.username === username);
            
            if (userIndex === -1) {
                this.showNotification('User tidak ditemukan!', 'error');
                return;
            }
            
            // Update existing user
            const existingUser = this.users[userIndex];
            
            // Don't update password if empty
            if (!userData.password) {
                delete userData.password;
            }
            
            this.users[userIndex] = { ...existingUser, ...userData };
            
            console.log('User updated:', this.users[userIndex]);
        }
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Close modal
        this.hideUserModal();
        
        // Refresh tables
        this.renderUsersTable();
        this.updateUserRTPTable();
        this.updateDashboard();
        
        this.showNotification('Pengguna berhasil disimpan!', 'success');
    }
    
    searchUsers(query = '') {
        console.log('Searching users:', query);
        
        const rows = document.querySelectorAll('#users-table-body tr');
        
        rows.forEach(row => {
            const username = row.children[1].textContent.toLowerCase();
            const email = row.children[2].textContent.toLowerCase();
            
            if (query === '' || 
                username.includes(query.toLowerCase()) || 
                email.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        this.showNotification(`Pencarian: "${query}"`, 'info');
    }
    
    // ==================== RTP CONTROL ====================
    
    setupRTPControls() {
        this.createRTPControlsSection();
        this.updateUserRTPTable();
    }
    
    createRTPControlsSection() {
        // Check if RTP controls section exists
        let rtpSection = document.getElementById('rtp-controls-section');
        
        if (!rtpSection) {
            console.log('Creating RTP controls section');
            
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
                        <button id="refresh-rtp-data" class="btn secondary-btn">🔄 Refresh</button>
                    </div>
                    
                    <table class="user-rtp-control-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>RTP Saat Ini</th>
                                <th>Target RTP</th>
                                <th>Total Spins</th>
                                <th>Consecutive Losses</th>
                                <th>Status</th>
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
                        <button class="btn btn-success" onclick="adminUI.forceWinAllUsers()">🏆 Paksa Menang Semua</button>
                        <button class="btn btn-warning" onclick="adminUI.setLowRTPMode()">📉 Mode RTP Rendah</button>
                        <button class="btn btn-info" onclick="adminUI.setHighRTPMode()">📈 Mode RTP Tinggi</button>
                        <button class="btn btn-danger" onclick="adminUI.resetAllUserRTP()">🔄 Reset Semua</button>
                    </div>
                </div>
            `;
            
            // Find where to insert the section
            const rtpControlSection = document.getElementById('rtp-control');
            if (rtpControlSection) {
                rtpControlSection.appendChild(rtpSection);
            } else {
                console.error('RTP control section not found');
            }
        }
        
        // Re-setup event listeners for RTP controls
        this.setupRTPEventListeners();
        
        // Add CSS for RTP styling
        this.addRTPStyling();
    }
    
    updateUserRTPTable() {
        const userRTPTableBody = document.getElementById('user-rtp-control-body');
        if (!userRTPTableBody) {
            console.warn('User RTP table body not found, will retry...');
            setTimeout(() => this.updateUserRTPTable(), 1000);
            return;
        }
        
        console.log('Updating user RTP table');
        
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
                    <span class="status-indicator ${userSettings.nextForcedResult ? 'forced-result' : 'normal'}">
                        ${userSettings.nextForcedResult ? `Next: ${userSettings.nextForcedResult}` : 'Normal'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn small-btn btn-primary" onclick="adminUI.saveUserRTPSettings('${user.username}')">💾 Simpan</button>
                        <button class="btn small-btn btn-success" onclick="adminUI.forceUserWin('${user.username}', 'medium')">🏆 Paksa Menang</button>
                        <button class="btn small-btn btn-danger" onclick="adminUI.resetUserRTP('${user.username}')">🔄 Reset</button>
                    </div>
                    <div class="win-type-buttons">
                        <button class="btn tiny-btn btn-sm" onclick="adminUI.forceUserWin('${user.username}', 'small')" title="Small Win">S</button>
                        <button class="btn tiny-btn btn-md" onclick="adminUI.forceUserWin('${user.username}', 'medium')" title="Medium Win">M</button>
                        <button class="btn tiny-btn btn-lg" onclick="adminUI.forceUserWin('${user.username}', 'large')" title="Large Win">L</button>
                        <button class="btn tiny-btn btn-jackpot" onclick="adminUI.forceUserWin('${user.username}', 'jackpot')" title="Jackpot">J</button>
                    </div>
                </td>
            `;
            
            userRTPTableBody.appendChild(row);
        });
        
        console.log('User RTP table updated with', activeUsers.length, 'users');
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
                .high-loss { color: #ff4444; font-weight: bold; animation: pulse 1s infinite; }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .user-rtp-control-table {
                    width: 100%;
                    margin-top: 15px;
                    border-collapse: collapse;
                }
                
                .user-rtp-control-table th,
                .user-rtp-control-table td {
                    padding: 10px;
                    text-align: center;
                    border: 1px solid var(--border-color);
                    font-size: 13px;
                }
                
                .user-rtp-control-table th {
                    background: rgba(67, 97, 238, 0.2);
                    font-weight: 600;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .win-type-buttons {
                    display: flex;
                    gap: 3px;
                    justify-content: center;
                }
                
                .tiny-btn {
                    padding: 3px 8px;
                    font-size: 11px;
                    min-width: 25px;
                    border-radius: 3px;
                }
                
                .btn-sm { background: #4ade80; color: white; }
                .btn-md { background: #60a5fa; color: white; }
                .btn-lg { background: #f59e0b; color: white; }
                .btn-jackpot { background: #ef4444; color: white; }
                
                .btn-primary { background: #4361ee; color: white; }
                .btn-success { background: #4ade80; color: white; }
                .btn-danger { background: #ef4444; color: white; }
                .btn-warning { background: #f59e0b; color: white; }
                .btn-info { background: #06b6d4; color: white; }
                
                .rtp-target-input {
                    width: 70px;
                    padding: 5px;
                    margin: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-light);
                    border-radius: 4px;
                }
                
                .status-indicator {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                }
                
                .status-indicator.normal {
                    background: rgba(74, 222, 128, 0.3);
                    color: #4ade80;
                }
                
                .status-indicator.forced-result {
                    background: rgba(251, 191, 36, 0.3);
                    color: #fbbf24;
                    animation: blink 1s infinite;
                }
                
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                
                .rtp-global-controls,
                .rtp-user-controls,
                .rtp-quick-actions {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    border-left: 4px solid var(--primary-color);
                }
                
                .quick-action-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                }
                
                .user-rtp-search {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .user-rtp-search input {
                    flex: 1;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-light);
                    border-radius: 5px;
                }
                
                .user-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    align-items: center;
                }
                
                .status.active {
                    background: rgba(74, 222, 128, 0.2);
                    color: #4ade80;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .status.inactive {
                    background: rgba(248, 113, 113, 0.2);
                    color: #f87171;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ==================== RTP CONTROL METHODS ====================
    
    saveUserRTPSettings(username) {
        console.log(`Saving RTP settings for: ${username}`);
        
        const targetRTPInput = document.querySelector(`input.rtp-target-input[data-username="${username}"]`);
        
        if (!targetRTPInput) {
            this.showNotification('Input elements not found!', 'error');
            return;
        }
        
        const targetRTP = parseFloat(targetRTPInput.value);
        
        // Validate input
        if (targetRTP < 80 || targetRTP > 99) {
            this.showNotification('RTP harus antara 80% - 99%!', 'error');
            return;
        }
        
        // Update user RTP settings
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = targetRTP;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply to slot machine if user is currently playing
        if (window.slotMachine && window.slotMachine.currentUsername === username) {
            window.slotMachine.setUserRTP(username, targetRTP);
            console.log(`Applied RTP ${targetRTP}% to current user ${username}`);
        }
        
        this.showNotification(`RTP settings saved for ${username}: ${targetRTP}%`, 'success');
    }
    
    setUserRTP(username, rtp) {
        console.log(`Setting RTP for ${username}: ${rtp}%`);
        
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = rtp;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply to slot machine if user is currently playing
        if (window.slotMachine && window.slotMachine.currentUsername === username) {
            window.slotMachine.setUserRTP(username, rtp);
        }
        
        // Update tables
        this.updateUserRTPTable();
        this.renderUsersTable();
        
        this.showNotification(`RTP set to ${rtp}% for ${username}`, 'success');
    }
    
    forceUserWin(username, winType = 'medium') {
        console.log(`Forcing ${winType} win for ${username}`);
        
        // Update user RTP settings
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].nextForcedResult = winType;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply to slot machine if user is currently playing
        if (window.slotMachine && window.slotMachine.currentUsername === username) {
            window.slotMachine.forceUserWin(username, winType);
            console.log(`Applied forced ${winType} win to current user ${username}`);
        }
        
        // Update tables to show forced result
        this.updateUserRTPTable();
        this.renderUsersTable();
        
        this.showNotification(`Forced ${winType} win for ${username}!`, 'success');
    }
    
    resetUserRTP(username) {
        if (confirm(`Reset RTP statistics for ${username}?`)) {
            console.log(`Resetting RTP for ${username}`);
            
            // Clear user RTP settings
            delete this.userRTPSettings[username];
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            
            // Clear user logs
            this.gameLogs = this.gameLogs.filter(log => log.username !== username);
            localStorage.setItem('gameLogs', JSON.stringify(this.gameLogs));
            
            // Reset in slot machine if user is currently playing
            if (window.slotMachine && window.slotMachine.currentUsername === username) {
                window.slotMachine.loadUserSpecificRTP(username);
                window.slotMachine.loadUserStatistics(username);
            }
            
            this.updateUserRTPTable();
            this.renderUsersTable();
            this.updateDashboard();
            
            this.showNotification(`RTP reset for ${username}!`, 'success');
        }
    }
    
    applyAllRTPSettings() {
        const globalRTP = parseFloat(document.getElementById('global-rtp').value);
        const maxSpinsWithoutWin = parseInt(document.getElementById('max-spins-without-win').value);
        const rtpControlEnabled = document.getElementById('rtp-control-enabled').checked;
        
        console.log(`Applying global RTP: ${globalRTP}%, Max spins: ${maxSpinsWithoutWin}, Enabled: ${rtpControlEnabled}`);
        
        // Update admin settings
        const adminSettings = {
            globalRTP: globalRTP,
            maxSpinsWithoutWin: maxSpinsWithoutWin,
            rtpControlEnabled: rtpControlEnabled,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
        
        // Apply to all users
        const activeUsers = this.users.filter(u => u.role === 'user');
        activeUsers.forEach(user => {
            if (!this.userRTPSettings[user.username]) {
                this.userRTPSettings[user.username] = {};
            }
            this.userRTPSettings[user.username].customRTP = globalRTP;
            this.userRTPSettings[user.username].maxSpinsWithoutWin = maxSpinsWithoutWin;
        });
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply to slot machine if active
        if (window.slotMachine) {
            window.slotMachine.loadAdminSettings();
            window.slotMachine.loadUserSpecificRTP(window.slotMachine.currentUsername);
        }
        
        this.updateUserRTPTable();
        this.showNotification(`Global RTP settings applied: ${globalRTP}%!`, 'success');
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
    
    setLowRTPMode() {
        if (confirm('Set all users to low RTP mode (85%)?')) {
            const activeUsers = this.users.filter(u => u.role === 'user');
            
            activeUsers.forEach(user => {
                this.setUserRTP(user.username, 85.0);
            });
            
            this.showNotification('Low RTP mode activated (85%)!', 'warning');
        }
    }
    
    setHighRTPMode() {
        if (confirm('Set all users to high RTP mode (97%)?')) {
            const activeUsers = this.users.filter(u => u.role === 'user');
            
            activeUsers.forEach(user => {
                this.setUserRTP(user.username, 97.0);
            });
            
            this.showNotification('High RTP mode activated (97%)!', 'success');
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
                window.slotMachine.loadUserSpecificRTP(window.slotMachine.currentUsername);
                window.slotMachine.loadUserStatistics(window.slotMachine.currentUsername);
            }
            
            this.updateUserRTPTable();
            this.renderUsersTable();
            this.updateDashboard();
            
            this.showNotification('All user RTP statistics reset!', 'success');
        }
    }
    
    refreshRTPData() {
        console.log('Refreshing RTP data...');
        
        this.loadUsers();
        this.loadGameLogs();
        this.loadUserRTPSettings();
        this.updateUserRTPTable();
        this.renderUsersTable();
        this.updateDashboard();
        
        // Force reload slot machine settings if active
        if (window.slotMachine) {
            window.slotMachine.loadUserSpecificRTP(window.slotMachine.currentUsername);
            window.slotMachine.loadUserStatistics(window.slotMachine.currentUsername);
        }
        
        this.showNotification('RTP data refreshed!', 'info');
    }
    
    // ==================== DASHBOARD ====================
    
    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
    }
    
    updateStats() {
        const stats = this.calculateStats();
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-value').textContent = stats.totalPlayers;
            statCards[1].querySelector('.stat-value').textContent = stats.totalSpins.toLocaleString();
            statCards[2].querySelector('.stat-value').textContent = this.formatCurrency(stats.houseEdge);
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
        
        const recentLogs = this.gameLogs.slice(-10).reverse();
        
        recentActivityTable.innerHTML = '';
        
        recentLogs.forEach(log => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${this.formatDateTime(log.timestamp)}</td>
                <td>
                    <strong>${log.username || 'Unknown'}</strong>
                    ${log.rtp ? `<br><small>RTP: ${log.rtp.toFixed(1)}%</small>` : ''}
                </td>
                <td>${log.type || 'Spin'}</td>
                <td>${this.formatCurrency(log.bet || 0)}</td>
                <td class="${log.win > 0 ? 'win' : 'loss'}">
                    ${log.win > 0 ? '+' + this.formatCurrency(log.win) : '-' + this.formatCurrency(log.bet || 0)}
                </td>
                <td>
                    <span class="rtp-status-indicator ${log.rtp < 90 ? 'rtp-low' : log.rtp > 97 ? 'rtp-high' : 'rtp-normal'}">
                        ${log.rtp ? log.rtp.toFixed(1) + '%' : 'N/A'}
                    </span>
                </td>
            `;
            
            recentActivityTable.appendChild(row);
        });
    }
    
    // ==================== LOGS MANAGEMENT ====================
    
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
                <td>
                    <span class="rtp-status-indicator ${log.rtp < 90 ? 'rtp-low' : log.rtp > 97 ? 'rtp-high' : 'rtp-normal'}">
                        ${log.rtp ? log.rtp.toFixed(1) + '%' : 'N/A'}
                    </span>
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
    
    // ==================== GAME SETTINGS ====================
    
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
    
    resetGameSettings() {
        if (confirm('Reset pengaturan game ke default?')) {
            localStorage.removeItem('gameSettings');
            this.showNotification('Pengaturan game direset ke default!', 'info');
        }
    }
    
    // ==================== REAL-TIME UPDATES ====================
    
    setupRealTimeUpdates() {
        // Update dashboard every 10 seconds
        setInterval(() => {
            this.loadGameLogs();
            this.updateDashboard();
        }, 10000);
        
        // Update RTP table every 15 seconds
        setInterval(() => {
            this.loadUserRTPSettings();
            this.updateUserRTPTable();
        }, 15000);
        
        // Update users table every 30 seconds
        setInterval(() => {
            this.loadUsers();
            this.renderUsersTable();
        }, 30000);
    }
    
    updateAdminSettings() {
        const settings = {
            forceWinEnabled: document.getElementById('force-win-enabled')?.checked || false,
            winFrequency: parseInt(document.getElementById('win-frequency')?.value || 30),
            rtpControlEnabled: document.getElementById('rtp-control-enabled')?.checked || false,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        
        // Apply to slot machine if active
        if (window.slotMachine) {
            window.slotMachine.loadAdminSettings();
        }
    }
    
    // ==================== UTILITY METHODS ====================
    
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
        console.log(`Notification: ${message} (${type})`);
        
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
    console.log('Initializing AdminUI...');
    window.adminUI = new AdminUI();
});

// Global utility functions for inline onclick handlers
window.adminUtils = {
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
    
    setUserRTP: (username, rtp) => {
        if (window.adminUI) {
            window.adminUI.setUserRTP(username, rtp);
        }
    }
};