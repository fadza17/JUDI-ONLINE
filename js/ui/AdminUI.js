// js/ui/AdminUI.js - Admin Interface Handler

class AdminUI {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.gameLogs = [];
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
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize dashboard
        this.updateDashboard();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
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
    
    setupEventListeners() {
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
        
        // User management
        this.setupUserManagement();
        
        // Logs management
        this.setupLogsManagement();
    }
    
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
            userCell.textContent = log.username || 'Unknown';
            
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
    
    updateUserRTPTable() {
        const userRTPTableBody = document.getElementById('user-rtp-table-body');
        if (!userRTPTableBody) return;
        
        userRTPTableBody.innerHTML = '';
        
        // Get users with game activity
        const activeUsers = this.users.filter(u => u.role === 'user');
        
        activeUsers.forEach(user => {
            const userLogs = this.gameLogs.filter(log => log.username === user.username);
            const userRTP = this.calculateUserRTP(userLogs);
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${userRTP}%</td>
                <td>
                    <input type="number" value="${userRTP}" min="1" max="99" step="0.1" data-username="${user.username}">
                    <span class="unit">%</span>
                </td>
                <td>
                    <select data-username="${user.username}">
                        <option value="">Tidak Ada</option>
                        <option value="win-small">Menang Kecil</option>
                        <option value="win-medium">Menang Sedang</option>
                        <option value="win-large">Menang Besar</option>
                        <option value="jackpot">Jackpot</option>
                    </select>
                </td>
                <td>
                    <button class="btn small-btn" onclick="adminUI.saveUserRTP('${user.username}')">Simpan</button>
                </td>
            `;
            
            userRTPTableBody.appendChild(row);
        });
    }
    
    calculateUserRTP(userLogs) {
        const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        
        if (totalBets === 0) return 95.5;
        
        return ((totalWins / totalBets) * 100).toFixed(1);
    }
    
    renderUsersTable() {
        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${this.formatCurrency(user.balance || 0)}</td>
                <td>${this.getUserSpinCount(user.username)}</td>
                <td>${this.formatDate(user.joinDate || new Date())}</td>
                <td><span class="status ${user.status || 'active'}">${user.status === 'inactive' ? 'Diblokir' : 'Aktif'}</span></td>
                <td>
                    <button class="btn small-btn edit-btn">Edit</button>
                    <button class="btn small-btn delete-btn">Hapus</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
    }
    
    getUserSpinCount(username) {
        return this.gameLogs.filter(log => log.username === username).length;
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
                <td>${log.username || 'Unknown'}</td>
                <td>${log.type || 'Spin'}</td>
                <td>${this.formatCurrency(log.bet || 0)}</td>
                <td class="${log.win > 0 ? 'win' : 'loss'}">
                    ${log.win > 0 ? '+' + this.formatCurrency(log.win) : '-' + this.formatCurrency(log.bet || 0)}
                </td>
                <td>${this.formatCurrency(log.balanceBefore || 0)}</td>
                <td>${this.formatCurrency(log.balanceAfter || 0)}</td>
                <td>${log.combination || 'N/A'}</td>
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
            username: cells[1].textContent,
            email: cells[2].textContent,
            balance: parseFloat(cells[3].textContent.replace(/[^\d]/g, '')),
            status: cells[6].querySelector('.status').classList.contains('active') ? 'active' : 'inactive'
        };
        
        this.showUserModal('edit', userData);
    }
    
    deleteUser(row) {
        const username = row.children[1].textContent;
        
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${username}?`)) {
            this.users = this.users.filter(u => u.username !== username);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            this.renderUsersTable();
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
        
        // Refresh table
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
            forceWinAfterSpins: parseInt(document.getElementById('force-win-spins')?.value || 10)
        };
        
        localStorage.setItem('adminSettings', JSON.stringify(settings));
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
    
    saveUserRTP(username) {
        const row = document.querySelector(`input[data-username="${username}"]`).closest('tr');
        const rtpInput = row.querySelector('input[type="number"]');
        const nextSpinSelect = row.querySelector('select');
        
        const settings = {
            username: username,
            customRTP: parseFloat(rtpInput.value),
            nextSpin: nextSpinSelect.value
        };
        
        // Save user-specific settings
        let userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        userSettings[username] = settings;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        this.showNotification(`Pengaturan untuk ${username} berhasil disimpan!`, 'success');
    }
    
    // Logs management methods
    filterLogs() {
        this.renderLogsTable();
        this.showNotification('Log berhasil difilter!', 'info');
    }
    
    exportLogs() {
        const logs = this.getFilteredLogs();
        
        // Create CSV content
        const headers = ['ID', 'Tanggal & Waktu', 'Username', 'Aktivitas', 'Taruhan', 'Hasil', 'Saldo Sebelum', 'Saldo Sesudah', 'Kombinasi'];
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
                log.combination || ''
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
    
    // Game simulation for demo
    simulateGameActivity() {
        const users = this.users.filter(u => u.role === 'user');
        if (users.length === 0) return;
        
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const bets = [10000, 25000, 50000, 100000, 250000];
        const randomBet = bets[Math.floor(Math.random() * bets.length)];
        const isWin = Math.random() < 0.3; // 30% chance to win
        const winMultiplier = Math.random() < 0.1 ? 50 : (Math.random() < 0.3 ? 10 : 3); // Rare big wins
        
        const log = {
            id: this.gameLogs.length + 1,
            timestamp: new Date().toISOString(),
            username: randomUser.username,
            type: 'Spin',
            bet: randomBet,
            win: isWin ? randomBet * winMultiplier : 0,
            balanceBefore: randomUser.balance,
            balanceAfter: randomUser.balance + (isWin ? randomBet * winMultiplier : -randomBet),
            combination: this.generateRandomCombination()
        };
        
        this.gameLogs.push(log);
        
        // Update user balance
        randomUser.balance = log.balanceAfter;
        
        // Save to localStorage
        localStorage.setItem('gameLogs', JSON.stringify(this.gameLogs));
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Update displays
        this.updateRecentActivity();
        this.updateStats();
    }
    
    generateRandomCombination() {
        const symbols = ['Seven', 'Bar-Triple', 'Bar-Double', 'Bar-Single', 'Cherry'];
        const combination = [];
        
        for (let i = 0; i < 3; i++) {
            combination.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        
        return combination.join('-');
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
    
    // Initialize demo data if needed
    initializeDemoData() {
        // Add some demo game logs if none exist
        if (this.gameLogs.length === 0) {
            const demoLogs = [
                {
                    id: 1,
                    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
                    username: 'user',
                    type: 'Spin',
                    bet: 50000,
                    win: 150000,
                    balanceBefore: 400000,
                    balanceAfter: 500000,
                    combination: 'Bar-Triple-Bar-Triple-Bar-Triple'
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
                    username: 'user',
                    type: 'Spin',
                    bet: 25000,
                    win: 0,
                    balanceBefore: 500000,
                    balanceAfter: 475000,
                    combination: 'Cherry-Seven-Bar-Single'
                }
            ];
            
            this.gameLogs = demoLogs;
            localStorage.setItem('gameLogs', JSON.stringify(demoLogs));
        }
    }
    
    // Start demo mode (for testing)
    startDemoMode() {
        this.initializeDemoData();
        
        // Simulate game activity every 10-30 seconds
        setInterval(() => {
            if (Math.random() < 0.7) { // 70% chance to simulate activity
                this.simulateGameActivity();
            }
        }, Math.random() * 20000 + 10000); // Random interval between 10-30 seconds
    }
}

// Initialize AdminUI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminUI = new AdminUI();
    
    // Start demo mode for testing (remove in production)
    setTimeout(() => {
        window.adminUI.startDemoMode();
    }, 2000);
});

// Utility functions for global access
window.adminUtils = {
    formatCurrency: (amount) => `Rp ${amount.toLocaleString('id-ID')}`,
    
    saveUserRTP: (username) => {
        if (window.adminUI) {
            window.adminUI.saveUserRTP(username);
        }
    },
    
    exportLogs: () => {
        if (window.adminUI) {
            window.adminUI.exportLogs();
        }
    }
};