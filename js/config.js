// Inisialisasi dengan default RTP SANGAT RENDAH
    if (!localStorage.getItem('userRTPSettings')) {
        localStorage.setItem('userRTPSettings', JSON.stringify({}));
    }
    
    if (!localStorage.getItem('rtpLogs')) {
        localStorage.setItem('rtpLogs', JSON.stringify([]));
    }
    
    // Set default admin settings dengan RTP RENDAH
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    if (!adminSettings.rtpControlEnabled) {
        adminSettings.rtpControlEnabled = true;
        adminSettings.globalRTPTarget = 82.0; // SANGAT RENDAH
        adminSettings.rtpAdjustmentSpeed = 'slow';
        adminSettings.maxSpinsWithoutWin = 35;
        adminSettings.forceWinEnabled = false;
        adminSettings.winFrequency = 12; // SANGAT RENDAH
        adminSettings.defaultWinAmount = 'small';
        admin// config.js - Enhanced configuration dengan sistem RTP yang dapat diatur

const CONFIG = {
    // Pengaturan umum
    gameName: 'Slot Master',
    baseUrl: './',
    minBet: 10000,
    maxBet: 1000000,
    defaultBet: 50000,
    betIncrement: 10000,
    maxLines: 9,
    defaultLines: 5,
    spinDuration: 3000,
    
    // Konfigurasi RTP System - Default setting untuk sering kalah
    baseRTP: 78.0, // Turun dari 88.5% ke 78% (house edge sangat tinggi)
    rtpControl: {
        enabled: true,
        minRTP: 70.0, // Minimum RTP 70%
        maxRTP: 80.0, // Maximum RTP DIBATASI 80% SAJA
        adjustmentSpeed: 'slow', // Adjustment lambat agar perubahan tidak kentara
        forceWinThreshold: 40, // Paksa menang setelah 40 spin kalah (lebih lama)
        rtpCalculationWindow: 250, // Window lebih besar untuk menyembunyikan pola
        emergencyMode: {
            enabled: true,
            triggerRTP: 55.0, // Emergency mode pada RTP 55%
            recoveryRTP: 70.0  // Recovery ke 70% saja
        }
    },
    
    // Konfigurasi reel dengan simbol baru dan RTP impact
    reels: {
        count: 5,
        rows: 3,
        symbols: [
            {
                id: 'seven',
                name: 'Seven',
                image: 'assets/images/symbols/seven.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='8'/%3E%3Cpath d='M20 45 L35 20 L45 20 L45 25 L38 25 L25 45 Z' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E`,
                payouts: [0, 0, 25, 100, 500], // Turun dari [0, 0, 50, 200, 1000]
                frequency: 8, // Turun dari 15 (lebih jarang muncul)
                isSpecial: true,
                rtpImpact: 'high',
                winProbability: 0.02 // Turun dari 0.05 (2% chance)
            },
            {
                id: 'bar_triple',
                name: 'Triple BAR',
                image: 'assets/images/symbols/bar_triple.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='12' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='21' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='40' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='49' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 75, 250, 1250], // Turun dari [0, 0, 150, 500, 2500]
                frequency: 5, // Turun dari 8 (lebih jarang)
                isWild: true,
                rtpImpact: 'high',
                winProbability: 0.04 // Turun dari 0.08
            },
            {
                id: 'bar_double',
                name: 'Double BAR',
                image: 'assets/images/symbols/bar_double.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='18' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='27' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='34' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='43' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 50, 150, 750], // Turun dari [0, 0, 100, 300, 1500]
                frequency: 8, // Turun dari 12
                isScatter: true,
                rtpImpact: 'medium',
                winProbability: 0.08 // Turun dari 0.12
            },
            {
                id: 'bar_single',
                name: 'Single BAR',
                image: 'assets/images/symbols/bar_single.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 25, 75, 375], // Turun dari [0, 0, 50, 150, 750]
                frequency: 15, // Turun dari 20
                rtpImpact: 'medium',
                winProbability: 0.15 // Turun dari 0.20
            },
            {
                id: 'cherry',
                name: 'Cherry',
                image: 'assets/images/symbols/cherry.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Ccircle cx='24' cy='35' r='12' fill='%23DC143C'/%3E%3Ccircle cx='40' cy='42' r='10' fill='%23DC143C'/%3E%3Cpath d='M24 23 Q26 15 30 12' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M40 32 Q38 24 34 21' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M30 12 L32 10 L28 8 L30 12' fill='%23228B22'/%3E%3Cpath d='M34 21 L36 19 L32 17 L34 21' fill='%23228B22'/%3E%3C/svg%3E`,
                payouts: [0, 0, 15, 50, 250], // Turun dari [0, 0, 30, 100, 500]
                frequency: 20, // Turun dari 25
                isBonus: true,
                rtpImpact: 'low',
                winProbability: 0.20 // Turun dari 0.25
            },
            {
                id: 'blank',
                name: 'Blank',
                image: 'assets/images/symbols/blank.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23222' rx='4'/%3E%3C/svg%3E`,
                payouts: [0, 0, 0, 0, 0],
                frequency: 44, // Naik dari 20 (lebih sering muncul blank)
                rtpImpact: 'none',
                winProbability: 0.0
            }
        ]
    },
    
    // Garis pembayaran yang disesuaikan untuk layout klasik
    payLines: [
        { id: 1, name: 'Garis Tengah', positions: [5, 6, 7, 8, 9] },
        { id: 2, name: 'Garis Atas', positions: [0, 1, 2, 3, 4] },
        { id: 3, name: 'Garis Bawah', positions: [10, 11, 12, 13, 14] },
        { id: 4, name: 'Diagonal Atas', positions: [0, 6, 12, 8, 4] },
        { id: 5, name: 'Diagonal Bawah', positions: [10, 6, 2, 8, 14] },
        { id: 6, name: 'V-Shape', positions: [0, 6, 7, 8, 4] },
        { id: 7, name: 'Inverted V', positions: [10, 6, 7, 8, 14] },
        { id: 8, name: 'Zig-Zag 1', positions: [0, 1, 7, 13, 14] },
        { id: 9, name: 'Zig-Zag 2', positions: [10, 11, 7, 3, 4] }
    ],
    
    // Pengaturan jackpot untuk kombinasi seven - diperkecil
    jackpot: {
        basePayout: 5000000, // Turun dari 10 juta ke 5 juta
        multiplier: 50,   // Turun dari 100 ke 50
        progressiveRate: 0.005, // Turun dari 0.01 ke 0.005 (0.5%)
        triggerCombination: ['seven', 'seven', 'seven', 'seven', 'seven'],
        minBetForJackpot: 200000 // Naik dari 100rb ke 200rb (lebih sulit dapat jackpot)
    },
    
    // Mode admin dengan pengaturan RTP yang diperluas - default sering kalah
    admin: {
        forceWinEnabled: false,
        winFrequency: 15, // Turun dari 30 ke 15%
        defaultWinAmount: 'small', // Ubah dari 'medium' ke 'small'
        forceWinAfterSpins: 35, // Naik dari 15 ke 35 spin
        
        // RTP Control Settings - untuk sering kalah
        rtpControlEnabled: true,
        globalRTPTarget: 78.0, // Turun dari 88.5% ke 78%
        rtpAdjustmentSpeed: 'slow', // Slow agar tidak kentara
        maxSpinsWithoutWin: 40, // Naik dari 35 ke 40
        minRTPThreshold: 70.0, // Turun dari 75% ke 70%
        maxRTPThreshold: 80.0, // Turun dari 92% ke 80% MAX!
        
        // Emergency settings
        emergencyStopEnabled: true, // Aktifkan emergency stop
        emergencyRTPThreshold: 60.0, // Turun dari 70% ke 60%
        
        // User-specific controls
        userRTPOverrides: {}, // akan diisi dari localStorage
        
        // Advanced settings
        rtpCalculationMethod: 'sliding_window', // sliding_window, cumulative, session_based
        rtpWindowSize: 100,
        enableRTPLogging: true,
        rtpLogRetention: 30, // days
        
        // Preset RTP modes - semua diturunkan untuk sering kalah
        rtpPresets: {
            'conservative': {
                target: 72.0, // Turun dari 82% ke 72%
                maxSpinsWithoutWin: 50, // Naik dari 40 ke 50
                adjustment: 'slow'
            },
            'balanced': {
                target: 78.0, // Turun dari 88.5% ke 78%
                maxSpinsWithoutWin: 40, // Naik dari 35 ke 40
                adjustment: 'slow' // Ubah dari normal ke slow
            },
            'generous': {
                target: 80.0, // Turun dari 92% ke 80% (MAKSIMAL)
                maxSpinsWithoutWin: 30, // Naik dari 25 ke 30
                adjustment: 'normal' // Ubah dari normal ke normal
            },
            'promotional': {
                target: 80.0, // Turun dari 95% ke 80% (MAKSIMAL)
                maxSpinsWithoutWin: 25, // Naik dari 20 ke 25
                adjustment: 'normal' // Ubah dari normal ke normal
            }
        }
    },
    
    // Konfigurasi suara
    sounds: {
        spin: 'assets/sounds/spin.mp3',
        win: 'assets/sounds/win.mp3',
        jackpot: 'assets/sounds/jackpot.mp3',
        backgroundMusic: 'assets/sounds/background-music.mp3',
        rtpAlert: 'assets/sounds/alert.mp3'
    },
    
    // Tema visual yang disesuaikan dengan asset
    theme: {
        primaryColor: '#FFD700', // Gold untuk BAR
        secondaryColor: '#DC143C', // Red untuk Cherry
        accentColor: '#FFFFFF',   // White untuk Seven
        backgroundColor: '#1a1a1a', // Dark background
        rtpIndicatorColors: {
            low: '#f87171',     // Red untuk RTP rendah
            normal: '#4ade80',  // Green untuk RTP normal
            high: '#fbbf24'     // Yellow untuk RTP tinggi
        }
    },
    
    // Pengaturan analytics dan monitoring
    analytics: {
        enableTracking: true,
        trackRTPChanges: true,
        trackUserBehavior: true,
        sessionTimeout: 30, // minutes
        maxLogEntries: 10000,
        rtpAlertThresholds: {
            critical: 60.0, // Turun dari 70% ke 60%
            warning: 65.0, // Turun dari 75% ke 65%
            high: 80.0 // Turun dari 92% ke 80% (MAKSIMAL)
        }
    }
};

// Fungsi-fungsi helper untuk RTP management
const RTPManager = {
    // Calculate current RTP for a user
    calculateUserRTP(userLogs) {
        if (!userLogs || userLogs.length === 0) return 100.0;
        
        const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        
        if (totalBets === 0) return 100.0;
        return (totalWins / totalBets) * 100;
    },
    
    // Get RTP adjustment factor based on current vs target RTP
    getRTPAdjustmentFactor(currentRTP, targetRTP, adjustmentSpeed = 'normal') {
        const difference = currentRTP - targetRTP;
        const speedMultipliers = {
            'slow': 0.1,
            'normal': 0.2,
            'fast': 0.4
        };
        
        const multiplier = speedMultipliers[adjustmentSpeed] || 0.2;
        return Math.max(-1, Math.min(1, -difference * multiplier / 10));
    },
    
    // Determine if user should win based on RTP
    shouldUserWin(currentRTP, targetRTP, consecutiveLosses, maxLosses) {
        // Force win jika consecutive losses terlalu tinggi
        if (consecutiveLosses >= maxLosses) {
            return true;
        }
        
        // Hitung probabilitas menang berdasarkan RTP difference
        const rtpDifference = currentRTP - targetRTP;
        let winProbability = 0.25; // Base 25% chance
        
        if (rtpDifference < -10) {
            winProbability = 0.6; // Turun dari 0.8 ke 0.6 (60%)
        } else if (rtpDifference < -5) {
            winProbability = 0.4; // Turun dari 0.6 ke 0.4 (40%)
        } else if (rtpDifference < -2) {
            winProbability = 0.25; // Turun dari 0.4 ke 0.25 (25%)
        } else if (rtpDifference > 10) {
            winProbability = 0.02; // Turun dari 0.05 ke 0.02 (2%)
        } else if (rtpDifference > 5) {
            winProbability = 0.05; // Turun dari 0.1 ke 0.05 (5%)
        } else if (rtpDifference > 2) {
            winProbability = 0.1; // Turun dari 0.15 ke 0.1 (10%)
        }
        
        return Math.random() < winProbability;
    },
    
    // Get appropriate win type based on RTP needs - lebih pelit
    getWinType(currentRTP, targetRTP, betAmount) {
        const rtpDifference = currentRTP - targetRTP;
        
        if (rtpDifference < -20) {
            return 'large'; // Hanya large, bukan jackpot
        } else if (rtpDifference < -15) {
            return 'medium';
        } else if (rtpDifference < -10) {
            return 'small'; // Lebih sering small win
        } else {
            return 'small'; // Default ke small
        }
    },
    
    // Load user RTP settings
    loadUserRTPSettings() {
        return JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    },
    
    // Save user RTP settings
    saveUserRTPSettings(settings) {
        localStorage.setItem('userRTPSettings', JSON.stringify(settings));
    },
    
    // Get effective RTP for user (dengan default SANGAT rendah)
    getEffectiveRTP(username) {
        const userSettings = this.loadUserRTPSettings();
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        // Priority: User override > Admin global > Default SANGAT RENDAH
        if (userSettings[username] && userSettings[username].customRTP) {
            return Math.min(userSettings[username].customRTP, 80.0); // MAKSIMAL 80%
        } else if (adminSettings.globalRTPTarget) {
            return Math.min(adminSettings.globalRTPTarget, 80.0); // MAKSIMAL 80%
        } else {
            return 78.0; // DEFAULT SANGAT RENDAH
        }
    },
    
    // Apply RTP preset
    applyRTPPreset(presetName) {
        const preset = CONFIG.admin.rtpPresets[presetName];
        if (!preset) return false;
        
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        adminSettings.globalRTPTarget = preset.target;
        adminSettings.maxSpinsWithoutWin = preset.maxSpinsWithoutWin;
        adminSettings.rtpAdjustmentSpeed = preset.adjustment;
        
        localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
        return true;
    },
    
    // Log RTP event for analytics
    logRTPEvent(username, eventType, data) {
        if (!CONFIG.analytics.enableTracking) return;
        
        const rtpLogs = JSON.parse(localStorage.getItem('rtpLogs') || '[]');
        const logEntry = {
            timestamp: new Date().toISOString(),
            username: username,
            eventType: eventType, // 'adjustment', 'forced_win', 'emergency_stop', etc.
            data: data
        };
        
        rtpLogs.push(logEntry);
        
        // Keep only recent logs
        if (rtpLogs.length > CONFIG.analytics.maxLogEntries) {
            rtpLogs.splice(0, rtpLogs.length - CONFIG.analytics.maxLogEntries);
        }
        
        localStorage.setItem('rtpLogs', JSON.stringify(rtpLogs));
    },
    
    // Get RTP statistics
    getRTPStatistics() {
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        const stats = {
            totalUsers: 0,
            activeUsers: 0,
            averageRTP: 0,
            rtpDistribution: {
                low: 0,    // < 90%
                normal: 0, // 90-97%
                high: 0    // > 97%
            },
            totalSpins: gameLogs.length,
            totalBets: 0,
            totalWins: 0,
            houseEdge: 0
        };
        
        const userRTPs = [];
        
        users.filter(u => u.role === 'user').forEach(user => {
            stats.totalUsers++;
            
            const userLogs = gameLogs.filter(log => log.username === user.username);
            if (userLogs.length > 0) {
                stats.activeUsers++;
                const userRTP = this.calculateUserRTP(userLogs);
                userRTPs.push(userRTP);
                
                // Categorize RTP
                if (userRTP < 90) {
                    stats.rtpDistribution.low++;
                } else if (userRTP > 97) {
                    stats.rtpDistribution.high++;
                } else {
                    stats.rtpDistribution.normal++;
                }
            }
        });
        
        // Calculate totals
        stats.totalBets = gameLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        stats.totalWins = gameLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        stats.houseEdge = stats.totalBets - stats.totalWins;
        stats.averageRTP = userRTPs.length > 0 ? 
            userRTPs.reduce((sum, rtp) => sum + rtp, 0) / userRTPs.length : 0;
        
        return stats;
    }
};

// Enhanced symbol management dengan RTP considerations
const EnhancedSymbolManager = {
    // Get symbol based on RTP requirements
    getSymbolForRTP(targetRTP, currentRTP, symbolConfigs) {
        const rtpDifference = currentRTP - targetRTP;
        
        // Filter symbols based on RTP impact
        let candidateSymbols;
        
        if (rtpDifference < -10) {
            // Need high RTP impact symbols (winning symbols)
            candidateSymbols = symbolConfigs.filter(s => 
                s.rtpImpact === 'high' && s.winProbability > 0);
        } else if (rtpDifference < -5) {
            // Need medium impact symbols
            candidateSymbols = symbolConfigs.filter(s => 
                s.rtpImpact === 'medium' && s.winProbability > 0);
        } else if (rtpDifference > 5) {
            // Need low impact or blank symbols
            candidateSymbols = symbolConfigs.filter(s => 
                s.rtpImpact === 'low' || s.id === 'blank');
        } else {
            // Normal selection
            candidateSymbols = symbolConfigs;
        }
        
        // Weighted random selection based on frequency
        const totalFrequency = candidateSymbols.reduce((sum, s) => sum + s.frequency, 0);
        let random = Math.random() * totalFrequency;
        
        for (const symbol of candidateSymbols) {
            random -= symbol.frequency;
            if (random <= 0) {
                return symbol;
            }
        }
        
        return candidateSymbols[0]; // fallback
    }
};

// Utility functions untuk RTP control
function initializeRTPSystem() {
    // Initialize RTP settings jika belum ada
    if (!localStorage.getItem('userRTPSettings')) {
        localStorage.setItem('userRTPSettings', JSON.stringify({}));
    }
    
    if (!localStorage.getItem('rtpLogs')) {
        localStorage.setItem('rtpLogs', JSON.stringify([]));
    }
    
    // Set default admin settings dengan RTP SANGAT RENDAH
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    if (!adminSettings.rtpControlEnabled) {
        adminSettings.rtpControlEnabled = true;
        adminSettings.globalRTPTarget = 78.0; // SANGAT RENDAH
        adminSettings.rtpAdjustmentSpeed = 'slow';
        adminSettings.maxSpinsWithoutWin = 40;
        adminSettings.forceWinEnabled = false;
        adminSettings.winFrequency = 10; // SANGAT RENDAH
        adminSettings.defaultWinAmount = 'small';
        adminSettings.forceWinAfterSpins = 40;
        localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    }
    
    // Inisialisasi semua user baru dengan RTP SANGAT rendah
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userRTPSettings = JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    
    users.filter(u => u.role === 'user').forEach(user => {
        if (!userRTPSettings[user.username]) {
            userRTPSettings[user.username] = {
                customRTP: 78.0, // DEFAULT SANGAT RENDAH
                forceLossSpins: 20, // Paksa kalah 20 spin
                maxSpinsWithoutWin: 40,
                lastUpdated: new Date().toISOString()
            };
        } else {
            // Paksa update user lama ke maksimal 80%
            if (userRTPSettings[user.username].customRTP > 80.0) {
                userRTPSettings[user.username].customRTP = 80.0;
                userRTPSettings[user.username].lastUpdated = new Date().toISOString();
            }
        }
    });
    
    localStorage.setItem('userRTPSettings', JSON.stringify(userRTPSettings));
}
}

// RTP Alert System
function checkRTPAlerts() {
    const stats = RTPManager.getRTPStatistics();
    const thresholds = CONFIG.analytics.rtpAlertThresholds;
    
    // Check for critical RTP levels
    if (stats.averageRTP < thresholds.critical) {
        triggerRTPAlert('critical', `Average RTP critically low: ${stats.averageRTP.toFixed(1)}%`);
    } else if (stats.averageRTP < thresholds.warning) {
        triggerRTPAlert('warning', `Average RTP below warning threshold: ${stats.averageRTP.toFixed(1)}%`);
    } else if (stats.averageRTP > thresholds.high) {
        triggerRTPAlert('high', `Average RTP unusually high: ${stats.averageRTP.toFixed(1)}%`);
    }
    
    // Check for users with extreme RTP
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
    
    users.filter(u => u.role === 'user').forEach(user => {
        const userLogs = gameLogs.filter(log => log.username === user.username);
        if (userLogs.length > 10) { // Only check users with sufficient data
            const userRTP = RTPManager.calculateUserRTP(userLogs);
            
            if (userRTP < thresholds.critical) {
                triggerRTPAlert('critical', `User ${user.username} RTP critically low: ${userRTP.toFixed(1)}%`);
            }
        }
    });
}

function triggerRTPAlert(level, message) {
    console.warn(`RTP Alert [${level.toUpperCase()}]: ${message}`);
    
    // Log alert
    RTPManager.logRTPEvent('system', 'alert', {
        level: level,
        message: message
    });
    
    // Play alert sound if enabled
    if (CONFIG.sounds.rtpAlert) {
        const audio = new Audio(CONFIG.sounds.rtpAlert);
        audio.play().catch(e => console.log('Alert sound failed:', e));
    }
    
    // Show notification if admin UI is available
    if (typeof window !== 'undefined' && window.adminUI) {
        window.adminUI.showNotification(`⚠️ RTP Alert: ${message}`, 
            level === 'critical' ? 'error' : 'warning');
    }
}

// Auto RTP adjustment functions
function enableAutoRTPAdjustment() {
    setInterval(() => {
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        if (!adminSettings.rtpControlEnabled) return;
        
        // Check and adjust RTP for all active users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        const userRTPSettings = RTPManager.loadUserRTPSettings();
        
        users.filter(u => u.role === 'user').forEach(user => {
            const userLogs = gameLogs.filter(log => log.username === user.username);
            if (userLogs.length > 20) { // Minimum data requirement
                const currentRTP = RTPManager.calculateUserRTP(userLogs);
                const targetRTP = RTPManager.getEffectiveRTP(user.username);
                
                // Auto-adjust if deviation is significant
                const deviation = Math.abs(currentRTP - targetRTP);
                if (deviation > 5) {
                    autoAdjustUserRTP(user.username, currentRTP, targetRTP);
                }
            }
        });
        
        // Run RTP alerts check
        checkRTPAlerts();
        
    }, 60000); // Check every minute
}

function autoAdjustUserRTP(username, currentRTP, targetRTP) {
    const userRTPSettings = RTPManager.loadUserRTPSettings();
    
    if (!userRTPSettings[username]) {
        userRTPSettings[username] = {};
    }
    
    // Adjust force loss spins based on RTP difference
    const rtpDifference = currentRTP - targetRTP;
    
    if (rtpDifference > 10) {
        // RTP too high, increase force loss
        userRTPSettings[username].forceLossSpins = Math.min(20, 
            (userRTPSettings[username].forceLossSpins || 0) + 5);
    } else if (rtpDifference < -10) {
        // RTP too low, reduce force loss
        userRTPSettings[username].forceLossSpins = Math.max(0, 
            (userRTPSettings[username].forceLossSpins || 0) - 5);
    }
    
    // Update target RTP
    userRTPSettings[username].customRTP = targetRTP;
    userRTPSettings[username].lastAutoAdjustment = new Date().toISOString();
    
    RTPManager.saveUserRTPSettings(userRTPSettings);
    
    // Log the adjustment
    RTPManager.logRTPEvent(username, 'auto_adjustment', {
        previousRTP: currentRTP,
        targetRTP: targetRTP,
        forceLossSpins: userRTPSettings[username].forceLossSpins
    });
    
    console.log(`Auto-adjusted RTP for ${username}: ${currentRTP.toFixed(1)}% -> ${targetRTP}%`);
}

// Initialize system when CONFIG is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeRTPSystem();
        
        // Start auto adjustment after 5 seconds
        setTimeout(() => {
            enableAutoRTPAdjustment();
        }, 5000);
        
        console.log('🎯 Enhanced RTP System Initialized');
        console.log(`Base RTP: ${CONFIG.baseRTP}%`);
        console.log(`RTP Control: ${CONFIG.admin.rtpControlEnabled ? 'Enabled' : 'Disabled'}`);
    });
}

// Export untuk penggunaan global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.RTPManager = RTPManager;
    window.EnhancedSymbolManager = EnhancedSymbolManager;
    
    // Debug functions
    window.rtpDebug = {
        getStats: () => RTPManager.getRTPStatistics(),
        setUserRTP: (username, rtp) => {
            const settings = RTPManager.loadUserRTPSettings();
            if (!settings[username]) settings[username] = {};
            settings[username].customRTP = rtp;
            RTPManager.saveUserRTPSettings(settings);
            console.log(`Set ${username} RTP to ${rtp}%`);
        },
        resetAll: () => {
            localStorage.removeItem('userRTPSettings');
            localStorage.removeItem('rtpLogs');
            localStorage.removeItem('gameLogs');
            console.log('All RTP data reset');
        },
        simulateUser: (username, spins = 100) => {
            // Simulate game activity for testing
            const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
            const baseId = gameLogs.length;
            
            for (let i = 0; i < spins; i++) {
                const isWin = Math.random() < 0.15; // Turun dari 0.3 ke 0.15 (15% chance menang)
                const bet = 50000;
                const win = isWin ? bet * (Math.random() * 3 + 0.5) : 0; // Kemenangan lebih kecil (0.5x - 3.5x)
                
                gameLogs.push({
                    id: baseId + i + 1,
                    timestamp: new Date(Date.now() - (spins - i) * 1000).toISOString(),
                    username: username,
                    type: 'Spin',
                    bet: bet,
                    win: win,
                    balanceBefore: 1000000,
                    balanceAfter: 1000000 + win - bet,
                    combination: isWin ? 'Bar-Bar-Bar' : 'Cherry-Seven-Blank',
                    rtp: 0,
                    targetRTP: 88.5 // Update target RTP
                });
            }
            
            localStorage.setItem('gameLogs', JSON.stringify(gameLogs));
            console.log(`Simulated ${spins} spins for ${username}`);
        }
    };
}