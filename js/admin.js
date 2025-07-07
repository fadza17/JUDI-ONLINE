// admin.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const menuItems = document.querySelectorAll('.menu li');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Charts placeholders - would use a charting library in a real implementation
    const activityChart = document.getElementById('activity-chart');
    const winsDistributionChart = document.getElementById('wins-distribution-chart');
    const symbolWinChart = document.getElementById('symbol-win-chart');
    const spinWinChart = document.getElementById('spin-win-chart');
    
    // Game Settings
    const saveGameSettingsBtn = document.getElementById('save-game-settings');
    const resetGameSettingsBtn = document.getElementById('reset-game-settings');
    
    // Win Settings
    const forceWinEnabled = document.getElementById('force-win-enabled');
    const winFrequency = document.getElementById('win-frequency');
    const winFrequencyValue = document.getElementById('win-frequency-value');
    
    // User Management
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const userModalTitle = document.getElementById('user-modal-title');
    const userForm = document.getElementById('user-form');
    const cancelUserEditBtn = document.getElementById('cancel-user-edit');
    const editBtns = document.querySelectorAll('.edit-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const closeModalBtns = document.querySelectorAll('.close');
    
    // Logs
    const filterLogsBtn = document.getElementById('filter-logs-btn');
    const exportLogsBtn = document.getElementById('export-logs-btn');
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    // Navigation - Switch between sections
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Only process menu items with data-section attribute
            if (this.getAttribute('data-section')) {
                // Update active menu item
                menuItems.forEach(menuItem => menuItem.classList.remove('active'));
                this.classList.add('active');
                
                // Update page title
                pageTitle.textContent = this.querySelector('span:not(.icon)').textContent;
                
                // Show corresponding section
                const targetSection = this.getAttribute('data-section');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetSection) {
                        section.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Logout button
    logoutBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Win frequency slider
    if (winFrequency) {
        winFrequency.addEventListener('input', function() {
            winFrequencyValue.textContent = this.value + '%';
        });
    }
    
    // Game settings
    if (saveGameSettingsBtn) {
        saveGameSettingsBtn.addEventListener('click', function() {
            // In a real application, this would save the settings to the server
            showNotification('Pengaturan game berhasil disimpan!', 'success');
        });
    }
    
    if (resetGameSettingsBtn) {
        resetGameSettingsBtn.addEventListener('click', function() {
            // Reset form to default values
            showNotification('Pengaturan game telah direset ke default', 'info');
        });
    }
    
    // User management
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            openUserModal('add');
        });
    }
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userRow = this.closest('tr');
            const userId = userRow.cells[0].textContent;
            const username = userRow.cells[1].textContent;
            const email = userRow.cells[2].textContent;
            const balance = userRow.cells[3].textContent.replace(/[^\d]/g, '');
            const status = userRow.querySelector('.status').classList.contains('active') ? 'active' : 'inactive';
            
            openUserModal('edit', {
                id: userId,
                username: username,
                email: email,
                balance: balance,
                status: status
            });
        });
    });
    
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                // In a real application, this would delete the user from the server
                this.closest('tr').remove();
                showNotification('Pengguna berhasil dihapus!', 'success');
            }
        });
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Cancel user edit
    if (cancelUserEditBtn) {
        cancelUserEditBtn.addEventListener('click', function() {
            userModal.style.display = 'none';
        });
    }
    
    // Handle user form submission
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, this would save the user to the server
            showNotification('Pengguna berhasil disimpan!', 'success');
            userModal.style.display = 'none';
            
            // Optionally reload user list or append/update the user in the table
        });
    }
    
    // Logs filters
    if (filterLogsBtn) {
        filterLogsBtn.addEventListener('click', function() {
            // In a real application, this would filter logs based on selected criteria
            showNotification('Log berhasil difilter!', 'info');
        });
    }
    
    // Export logs
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', function() {
            // In a real application, this would generate and download a CSV file
            showNotification('Log berhasil diekspor!', 'success');
        });
    }
    
    // Pagination
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('active')) {
                document.querySelector('.pagination-btn.active').classList.remove('active');
                this.classList.add('active');
                
                // In a real application, this would load the corresponding page of data
            }
        });
    });
    
    // Initialize mock charts (in a real app, would use a library like Chart.js)
    initializeMockCharts();
    
    // Helper Functions
    
    // Function to open user modal for add or edit
    function openUserModal(mode, userData = null) {
        userForm.reset();
        
        if (mode === 'add') {
            userModalTitle.textContent = 'Tambah Pengguna';
            document.getElementById('user-username').value = '';
            document.getElementById('user-email').value = '';
            document.getElementById('user-password').value = '';
            document.getElementById('user-balance').value = '0';
            document.getElementById('user-status').value = 'active';
            document.getElementById('user-role').value = 'user';
        } else if (mode === 'edit' && userData) {
            userModalTitle.textContent = 'Edit Pengguna';
            document.getElementById('user-username').value = userData.username;
            document.getElementById('user-email').value = userData.email;
            document.getElementById('user-password').value = ''; // Don't populate password for security
            document.getElementById('user-balance').value = userData.balance;
            document.getElementById('user-status').value = userData.status;
            
            // Determine role based on username (for this demo)
            const role = userData.username === 'admin' ? 'admin' : 'user';
            document.getElementById('user-role').value = role;
            
            // Set a data attribute to track which user we're editing
            userForm.setAttribute('data-editing-id', userData.id);
        }
        
        userModal.style.display = 'block';
    }
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Append to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Function to initialize mock charts
    function initializeMockCharts() {
        // In a real application, this would use a charting library
        // For this demo, we'll just add text to the placeholders
        
        if (activityChart) {
            activityChart.querySelector('.chart-placeholder').textContent = 'Grafik aktivitas permainan akan ditampilkan di sini';
        }
        
        if (winsDistributionChart) {
            winsDistributionChart.querySelector('.chart-placeholder').textContent = 'Grafik distribusi kemenangan akan ditampilkan di sini';
        }
        
        if (symbolWinChart) {
            symbolWinChart.querySelector('.chart-placeholder').textContent = 'Grafik persentase kemenangan per simbol akan ditampilkan di sini';
        }
        
        if (spinWinChart) {
            spinWinChart.querySelector('.chart-placeholder').textContent = 'Grafik persentase kemenangan per putaran akan ditampilkan di sini';
        }
    }
});

// Add custom notification style
const style = document.createElement('style');
style.textContent = `
    .notification {
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
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification.success {
        background-color: #4ade80;
    }
    
    .notification.error {
        background-color: #f87171;
    }
    
    .notification.info {
        background-color: #4361ee;
    }
    
    .notification.warning {
        background-color: #fbbf24;
    }
`;
document.head.appendChild(style);