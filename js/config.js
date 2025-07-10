// config.js - Fixed RTP Control System dengan default house edge tinggi

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
    
    // Konfigurasi RTP System - DEFAULT SANGAT RENDAH UNTUK HOUSE EDGE TINGGI
    baseRTP: 75.0, // Default RTP sangat rendah (75%)
    rtpControl: {
        enabled: true,
        minRTP: 65.0, // Minimum RTP sangat rendah
        maxRTP: 80.0, // Maximum RTP DIBATASI 80% SAJA
        defaultUserRTP: 75.0, // Default untuk user baru
        adjustmentSpeed: 'ultra_slow', // Sangat lambat agar tidak naik cepat
        forceWinThreshold: 50, // Paksa menang setelah 50 spin kalah (lebih lama)
        rtpCalculationWindow: 500, // Window besar untuk menyembunyikan pola
        houseEdgeMode: true, // Mode khusus untuk memastikan house selalu untung
        emergencyMode: {
            enabled: true,
            triggerRTP: 85.0, // Emergency jika RTP mencapai 85%
            emergencyRTP: 70.0  // Paksa turun ke 70%
        }
    },
    
    // Konfigurasi reel dengan probabilitas menang SANGAT RENDAH
    reels: {
        count: 5,
        rows: 3,
        symbols: [
            {
                id: 'seven',
                name: 'Seven',
                image: 'assets/images/symbols/seven.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='8'/%3E%3Cpath d='M20 45 L35 20 L45 20 L45 25 L38 25 L25 45 Z' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E`,
                payouts: [0, 0, 15, 50, 300], // Drastis turun dari sebelumnya
                frequency: 3, // Sangat jarang muncul
                isSpecial: true,
                rtpImpact: 'high',
                winProbability: 0.008 // Hanya 0.8% chance
            },
            {
                id: 'bar_triple',
                name: 'Triple BAR',
                image: 'assets/images/symbols/bar_triple.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='12' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='21' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='40' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='49' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 40, 120, 600], // Turun drastis
                frequency: 2, // Sangat jarang
                isWild: true,
                rtpImpact: 'high',
                winProbability: 0.015 // 1.5% chance
            },
            {
                id: 'bar_double',
                name: 'Double BAR',
                image: 'assets/images/symbols/bar_double.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='18' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='27' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='34' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='43' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 25, 75, 350], // Turun drastis
                frequency: 4, // Jarang
                isScatter: true,
                rtpImpact: 'medium',
                winProbability: 0.03 // 3% chance
            },
            {
                id: 'bar_single',
                name: 'Single BAR',
                image: 'assets/images/symbols/bar_single.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 15, 40, 200], // Turun drastis
                frequency: 8, // Jarang
                rtpImpact: 'medium',
                winProbability: 0.06 // 6% chance
            },
            {
                id: 'cherry',
                name: 'Cherry',
                image: 'assets/images/symbols/cherry.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Ccircle cx='24' cy='35' r='12' fill='%23DC143C'/%3E%3Ccircle cx='40' cy='42' r='10' fill='%23DC143C'/%3E%3Cpath d='M24 23 Q26 15 30 12' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M40 32 Q38 24 34 21' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M30 12 L32 10 L28 8 L30 12' fill='%23228B22'/%3E%3Cpath d='M34 21 L36 19 L32 17 L34 21' fill='%23228B22'/%3E%3C/svg%3E`,
                payouts: [0, 0, 10, 25, 120], // Turun drastis
                frequency: 13, // Agak jarang
                isBonus: true,
                rtpImpact: 'low',
                winProbability: 0.10 // 10% chance
            },
            {
                id: 'blank',
                name: 'Blank',
                image: 'assets/images/symbols/blank.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23222' rx='4'/%3E%3C/svg%3E`,
                payouts: [0, 0, 0, 0, 0],
                frequency: 70, // SANGAT SERING MUNCUL (70 dari 100)
                rtpImpact: 'none',
                winProbability: 0.0
            }
        ]
    },
    
    // Garis pembayaran
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
    
    // Pengaturan jackpot - sangat sulit didapat
    jackpot: {
        basePayout: 2000000, // Turun dari 5 juta ke 2 juta
        multiplier: 25,   // Turun dari 50 ke 25
        progressiveRate: 0.002, // Turun dari 0.005 ke 0.002 (0.2%)
        triggerCombination: ['seven', 'seven', 'seven', 'seven', 'seven'],
        minBetForJackpot: 500000 // Naik dari 200rb ke 500rb
    },
    
    // Mode admin dengan pengaturan house edge tinggi
    admin: {
        forceWinEnabled: false,
        winFrequency: 8, // Turun dari 15 ke 8% (sangat jarang)
        defaultWinAmount: 'small', // Default ke small win saja
        forceWinAfterSpins: 60, // Naik dari 35 ke 60 spin
        
        // RTP Control Settings - untuk house edge maksimal
        rtpControlEnabled: true,
        globalRTPTarget: 75.0, // Turun dari 78% ke 75%
        rtpAdjustmentSpeed: 'ultra_slow', // Ultra slow
        maxSpinsWithoutWin: 60, // Naik dari 40 ke 60
        minRTPThreshold: 65.0, // Turun dari 70% ke 65%
        maxRTPThreshold: 80.0, // Tetap 80% MAX!
        
        // Emergency settings untuk mencegah RTP naik
        emergencyStopEnabled: true,
        emergencyRTPThreshold: 82.0, // Jika RTP mencapai 82%, emergency mode
        emergencyForceLossSpins: 100, // Paksa kalah 100 spin
        
        // User-specific controls
        userRTPOverrides: {},
        
        // Advanced settings untuk house edge
        rtpCalculationMethod: 'weighted_house_edge', // Metode khusus house edge
        rtpWindowSize: 200, // Window besar untuk smooth house edge
        enableRTPLogging: true,
        rtpLogRetention: 30,
        
        // Preset RTP modes - semua sangat rendah
        rtpPresets: {
            'ultra_conservative': {
                target: 65.0, // Ultra rendah
                maxSpinsWithoutWin: 80,
                adjustment: 'ultra_slow',
                forceLossMultiplier: 2.0
            },
            'conservative': {
                target: 70.0, // Sangat rendah
                maxSpinsWithoutWin: 70,
                adjustment: 'ultra_slow',
                forceLossMultiplier: 1.8
            },
            'default': {
                target: 75.0, // Rendah (default)
                maxSpinsWithoutWin: 60,
                adjustment: 'ultra_slow',
                forceLossMultiplier: 1.5
            },
            'maximum': {
                target: 80.0, // Maksimal yang diizinkan
                maxSpinsWithoutWin: 50,
                adjustment: 'slow',
                forceLossMultiplier: 1.2
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
    
    // Tema visual
    theme: {
        primaryColor: '#FFD700',
        secondaryColor: '#DC143C',
        accentColor: '#FFFFFF',
        backgroundColor: '#1a1a1a',
        rtpIndicatorColors: {
            ultra_low: '#8b0000',    // Dark red untuk ultra rendah
            low: '#ff4444',          // Red untuk rendah
            normal: '#ffaa44',       // Orange untuk normal
            high: '#44ff44',         // Green untuk tinggi (jarang terjadi)
            emergency: '#ff0000'     // Bright red untuk emergency
        }
    },
    
    // Pengaturan analytics dan monitoring
    analytics: {
        enableTracking: true,
        trackRTPChanges: true,
        trackUserBehavior: true,
        sessionTimeout: 30,
        maxLogEntries: 10000,
        rtpAlertThresholds: {
            emergency: 82.0, // Emergency jika RTP 82%+
            critical: 78.0,  // Critical jika RTP 78%+
            warning: 75.0,   // Warning jika RTP 75%+
            normal: 70.0     // Normal di bawah 70%
        },
        houseEdgeTargets: {
            minimum: 20.0,  // House edge minimum 20%
            target: 25.0,   // House edge target 25%
            maximum: 35.0   // House edge maksimal 35%
        }
    }
};

// Enhanced RTP Manager dengan house edge control
const RTPManager = {
    // Calculate current RTP dengan house edge bias
    calculateUserRTP(userLogs) {
        if (!userLogs || userLogs.length === 0) return CONFIG.baseRTP;
        
        const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
        const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
        
        if (totalBets === 0) return CONFIG.baseRTP;
        
        let calculatedRTP = (totalWins / totalBets) * 100;
        
        // Apply house edge bias - RTP tidak boleh naik mudah
        if (calculatedRTP > CONFIG.baseRTP) {
            const excess = calculatedRTP - CONFIG.baseRTP;
            // Kurangi excess RTP dengan faktor 0.7 (house edge protection)
            calculatedRTP = CONFIG.baseRTP + (excess * 0.7);
        }
        
        // Hard cap di 80%
        return Math.min(calculatedRTP, 80.0);
    },
    
    // Get RTP adjustment factor dengan house edge bias
    getRTPAdjustmentFactor(currentRTP, targetRTP, adjustmentSpeed = 'ultra_slow') {
        const difference = currentRTP - targetRTP;
        
        const speedMultipliers = {
            'ultra_slow': 0.02,  // Sangat lambat
            'slow': 0.05,
            'normal': 0.1,
            'fast': 0.2
        };
        
        const multiplier = speedMultipliers[adjustmentSpeed] || 0.02;
        
        // Jika RTP di atas target, turunkan dengan agresif
        if (difference > 0) {
            return Math.max(-1, -difference * multiplier * 3); // 3x lebih agresif turun
        }
        
        // Jika RTP di bawah target, naikkan dengan sangat lambat
        return Math.max(-1, Math.min(0.2, -difference * multiplier * 0.3)); // 0.3x lebih lambat naik
    },
    
    // Determine if user should win dengan house edge bias
    shouldUserWin(currentRTP, targetRTP, consecutiveLosses, maxLosses, userLogs = []) {
        // Emergency mode - jika RTP terlalu tinggi
        if (currentRTP >= CONFIG.analytics.rtpAlertThresholds.emergency) {
            console.log(`EMERGENCY MODE: RTP ${currentRTP}% - Force loss for next 100 spins`);
            return false;
        }
        
        // Force win hanya jika consecutive losses sangat tinggi
        if (consecutiveLosses >= maxLosses && consecutiveLosses > 50) {
            return true;
        }
        
        // Calculate house edge
        const houseEdge = 100 - currentRTP;
        const targetHouseEdge = 100 - targetRTP;
        
        // Jika house edge di bawah target, kurangi win chance drastis
        if (houseEdge < targetHouseEdge) {
            const houseEdgeDeficit = targetHouseEdge - houseEdge;
            
            if (houseEdgeDeficit > 10) {
                return Math.random() < 0.02; // 2% chance jika house edge kurang banyak
            } else if (houseEdgeDeficit > 5) {
                return Math.random() < 0.05; // 5% chance
            } else {
                return Math.random() < 0.08; // 8% chance
            }
        }
        
        // House edge calculation untuk win probability
        let baseWinChance = 0.12; // Base 12% chance (rendah)
        
        // Adjust berdasarkan current RTP vs target
        const rtpDifference = currentRTP - targetRTP;
        
        if (rtpDifference < -10) { // RTP jauh di bawah target
            baseWinChance = 0.18; // Naik sedikit ke 18%
        } else if (rtpDifference < -5) {
            baseWinChance = 0.15; // 15%
        } else if (rtpDifference > 5) { // RTP di atas target
            baseWinChance = 0.03; // Turun drastis ke 3%
        } else if (rtpDifference > 2) {
            baseWinChance = 0.06; // 6%
        }
        
        // Factor in consecutive losses untuk pity timer
        if (consecutiveLosses > 40) {
            baseWinChance *= 1.5; // Slight boost setelah 40 losses
        } else if (consecutiveLosses > 25) {
            baseWinChance *= 1.2; // Small boost setelah 25 losses
        }
        
        // Anti-streak protection - jika baru menang, kurangi chance
        if (userLogs.length > 0) {
            const recentWins = userLogs.slice(-5).filter(log => log.win > 0).length;
            if (recentWins > 1) {
                baseWinChance *= 0.3; // Drastis kurangi jika baru menang
            }
        }
        
        return Math.random() < baseWinChance;
    },
    
    // Get appropriate win type - bias ke small wins
    getWinType(currentRTP, targetRTP, betAmount) {
        const rtpDifference = currentRTP - targetRTP;
        
        // Default ke small win
        let winType = 'small';
        
        // Hanya berikan win besar jika RTP sangat rendah dan consecutive losses tinggi
        if (rtpDifference < -15) {
            if (Math.random() < 0.15) { // 15% chance medium win
                winType = 'medium';
            }
            if (Math.random() < 0.03) { // 3% chance large win
                winType = 'large';
            }
        } else if (rtpDifference < -10) {
            if (Math.random() < 0.08) { // 8% chance medium win
                winType = 'medium';
            }
        }
        
        return winType;
    },
    
    // Enhanced win amount calculation dengan house edge protection
    calculateWinAmount(winType, betAmount, currentRTP, targetRTP) {
        let multiplier;
        
        switch (winType) {
            case 'small':
                multiplier = 1.1 + (Math.random() * 0.8); // 1.1x - 1.9x (rendah)
                break;
            case 'medium':
                multiplier = 2.0 + (Math.random() * 1.5); // 2x - 3.5x
                break;
            case 'large':
                multiplier = 4.0 + (Math.random() * 2.0); // 4x - 6x
                break;
            case 'jackpot':
                multiplier = 10 + (Math.random() * 15); // 10x - 25x (bukan progressive)
                break;
            default:
                multiplier = 1.2;
        }
        
        // House edge protection - kurangi multiplier jika RTP tinggi
        const rtpDifference = currentRTP - targetRTP;
        if (rtpDifference > 0) {
            multiplier *= (1 - (rtpDifference / 100)); // Kurangi multiplier
        }
        
        // Minimum multiplier
        multiplier = Math.max(multiplier, 1.05);
        
        return Math.floor(betAmount * multiplier);
    },
    
    // Load dan apply default settings
    initializeUserRTP(username) {
        const userSettings = this.loadUserRTPSettings();
        
        if (!userSettings[username]) {
            userSettings[username] = {
                customRTP: CONFIG.rtpControl.defaultUserRTP, // 75% default
                forceLossSpins: 20, // Default 20 forced losses
                maxSpinsWithoutWin: 60,
                lastUpdated: new Date().toISOString(),
                houseEdgeMode: true,
                emergencyModeActive: false
            };
            
            this.saveUserRTPSettings(userSettings);
        }
        
        return userSettings[username];
    },
    
    // Load user RTP settings
    loadUserRTPSettings() {
        return JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    },
    
    // Save user RTP settings
    saveUserRTPSettings(settings) {
        localStorage.setItem('userRTPSettings', JSON.stringify(settings));
    },
    
    // Get effective RTP dengan cap 80%
    getEffectiveRTP(username) {
        const userSettings = this.loadUserRTPSettings();
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        // Priority: User override > Admin global > Default
        let effectiveRTP;
        
        if (userSettings[username] && userSettings[username].customRTP) {
            effectiveRTP = userSettings[username].customRTP;
        } else if (adminSettings.globalRTPTarget) {
            effectiveRTP = adminSettings.globalRTPTarget;
        } else {
            effectiveRTP = CONFIG.rtpControl.defaultUserRTP;
        }
        
        // HARD CAP di 80%
        return Math.min(effectiveRTP, 80.0);
    },
    
    // Apply emergency mode jika RTP terlalu tinggi
    checkEmergencyMode(username, currentRTP) {
        const userSettings = this.loadUserRTPSettings();
        
        if (currentRTP >= CONFIG.analytics.rtpAlertThresholds.emergency) {
            if (!userSettings[username]) {
                userSettings[username] = {};
            }
            
            userSettings[username].emergencyModeActive = true;
            userSettings[username].forceLossSpins = CONFIG.admin.emergencyForceLossSpins;
            userSettings[username].emergencyStartTime = new Date().toISOString();
            
            this.saveUserRTPSettings(userSettings);
            
            console.log(`EMERGENCY MODE activated for ${username} - RTP: ${currentRTP}%`);
            return true;
        }
        
        return false;
    },
    
    // Log RTP event dengan house edge info
    logRTPEvent(username, eventType, data) {
        if (!CONFIG.analytics.enableTracking) return;
        
        const rtpLogs = JSON.parse(localStorage.getItem('rtpLogs') || '[]');
        const logEntry = {
            timestamp: new Date().toISOString(),
            username: username,
            eventType: eventType,
            data: {
                ...data,
                houseEdge: data.currentRTP ? (100 - data.currentRTP) : null,
                targetHouseEdge: data.targetRTP ? (100 - data.targetRTP) : null
            }
        };
        
        rtpLogs.push(logEntry);
        
        // Keep only recent logs
        if (rtpLogs.length > CONFIG.analytics.maxLogEntries) {
            rtpLogs.splice(0, rtpLogs.length - CONFIG.analytics.maxLogEntries);
        }
        
        localStorage.setItem('rtpLogs', JSON.stringify(rtpLogs));
    }
};

// Initialize system dengan default house edge tinggi
function initializeRTPSystem() {
    // Set default admin settings untuk house edge tinggi
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    // Merge dengan defaults jika belum ada
    const defaultAdminSettings = {
        rtpControlEnabled: true,
        globalRTPTarget: 75.0, // Default 75%
        rtpAdjustmentSpeed: 'ultra_slow',
        maxSpinsWithoutWin: 60,
        forceWinEnabled: false,
        winFrequency: 8, // 8% win frequency
        defaultWinAmount: 'small',
        forceWinAfterSpins: 60,
        emergencyStopEnabled: true,
        emergencyRTPThreshold: 82.0,
        houseEdgeMode: true
    };
    
    // Apply defaults untuk setting yang belum ada
    Object.keys(defaultAdminSettings).forEach(key => {
        if (adminSettings[key] === undefined) {
            adminSettings[key] = defaultAdminSettings[key];
        }
    });
    
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
    
    // Initialize semua user dengan default RTP rendah
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userRTPSettings = JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    
    users.filter(u => u.role === 'user').forEach(user => {
        if (!userRTPSettings[user.username]) {
            userRTPSettings[user.username] = {
                customRTP: 75.0, // Default 75%
                forceLossSpins: 20,
                maxSpinsWithoutWin: 60,
                lastUpdated: new Date().toISOString(),
                houseEdgeMode: true,
                emergencyModeActive: false
            };
        } else {
            // Ensure existing users don't exceed 80%
            if (userRTPSettings[user.username].customRTP > 80.0) {
                userRTPSettings[user.username].customRTP = 80.0;
                userRTPSettings[user.username].lastUpdated = new Date().toISOString();
            }
        }
    });
    
    localStorage.setItem('userRTPSettings', JSON.stringify(userRTPSettings));
    
    console.log('🎯 RTP System initialized with high house edge defaults');
    console.log(`Default RTP: ${CONFIG.rtpControl.defaultUserRTP}%`);
    console.log(`Maximum RTP: ${CONFIG.rtpControl.maxRTP}%`);
}

// Auto RTP monitoring untuk prevent RTP naik
function enableRTPMonitoring() {
    setInterval(() => {
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        if (!adminSettings.rtpControlEnabled) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        const userRTPSettings = RTPManager.loadUserRTPSettings();
        
        users.filter(u => u.role === 'user').forEach(user => {
            const userLogs = gameLogs.filter(log => log.username === user.username);
            
            if (userLogs.length > 10) {
                const currentRTP = RTPManager.calculateUserRTP(userLogs);
                const targetRTP = RTPManager.getEffectiveRTP(user.username);
                
                // Emergency mode check
                if (currentRTP >= CONFIG.analytics.rtpAlertThresholds.emergency) {
                    RTPManager.checkEmergencyMode(user.username, currentRTP);
                }
                
                // Auto-adjust jika RTP terlalu tinggi
                if (currentRTP > targetRTP + 3) {
                    autoReduceUserRTP(user.username, currentRTP, targetRTP);
                }
            }
        });
        
    }, 30000); // Check setiap 30 detik
}

function autoReduceUserRTP(username, currentRTP, targetRTP) {
    const userRTPSettings = RTPManager.loadUserRTPSettings();
    
    if (!userRTPSettings[username]) {
        userRTPSettings[username] = {};
    }
    
    // Increase force loss spins untuk turunkan RTP
    const rtpExcess = currentRTP - targetRTP;
    const additionalForceLoss = Math.floor(rtpExcess * 5); // 5 force loss per 1% excess
    
    userRTPSettings[username].forceLossSpins = 
        (userRTPSettings[username].forceLossSpins || 0) + additionalForceLoss;
    
    // Cap maximum force loss
    userRTPSettings[username].forceLossSpins = Math.min(
        userRTPSettings[username].forceLossSpins, 
        150
    );
    
    userRTPSettings[username].lastAutoAdjustment = new Date().toISOString();
    
    RTPManager.saveUserRTPSettings(userRTPSettings);
    
    // Log the reduction
    RTPManager.logRTPEvent(username, 'auto_rtp_reduction', {
        previousRTP: currentRTP,
        targetRTP: targetRTP,
        addedForceLoss: additionalForceLoss,
        totalForceLoss: userRTPSettings[username].forceLossSpins
    });
    
    console.log(`Auto-reduced RTP for ${username}: ${currentRTP.toFixed(1)}% -> target ${targetRTP}%, added ${additionalForceLoss} force loss spins`);
}

// Enhanced symbol management dengan house edge bias
const EnhancedSymbolManager = {
    // Get symbol berdasarkan house edge requirements
    getSymbolForHouseEdge(currentRTP, targetRTP, symbolConfigs) {
        const rtpDifference = currentRTP - targetRTP;
        
        // Jika RTP terlalu tinggi, prioritaskan blank/low-value symbols
        if (rtpDifference > 5) {
            const lowValueSymbols = symbolConfigs.filter(s => 
                s.id === 'blank' || s.rtpImpact === 'low' || s.winProbability < 0.05);
            return this.selectWeightedSymbol(lowValueSymbols);
        }
        
        // Jika RTP sedikit tinggi, kurangi high-value symbols
        if (rtpDifference > 2) {
            const nonHighValueSymbols = symbolConfigs.filter(s => 
                s.rtpImpact !== 'high');
            return this.selectWeightedSymbol(nonHighValueSymbols);
        }
        
        // Normal selection dengan bias ke low-value
        const weightedSymbols = symbolConfigs.map(symbol => {
            let weight = symbol.frequency;
            
            // Increase weight untuk low-value symbols
            if (symbol.id === 'blank') {
                weight *= 2; // Double weight untuk blank
            } else if (symbol.rtpImpact === 'low') {
                weight *= 1.5; // 1.5x weight untuk low impact
            } else if (symbol.rtpImpact === 'high') {
                weight *= 0.5; // Half weight untuk high impact
            }
            
            return { ...symbol, adjustedFrequency: weight };
        });
        
        return this.selectWeightedSymbol(weightedSymbols);
    },
    
    selectWeightedSymbol(symbols) {
        const totalWeight = symbols.reduce((sum, s) => 
            sum + (s.adjustedFrequency || s.frequency), 0);
        
        let random = Math.random() * totalWeight;
        
        for (const symbol of symbols) {
            random -= (symbol.adjustedFrequency || symbol.frequency);
            if (random <= 0) {
                return symbol;
            }
        }
        
        return symbols[0]; // Fallback
    }
};

// Utility functions untuk house edge control
function calculateHouseEdge(userLogs) {
    if (!userLogs || userLogs.length === 0) return 25.0; // Default 25% house edge
    
    const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
    const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
    
    if (totalBets === 0) return 25.0;
    
    const rtp = (totalWins / totalBets) * 100;
    return 100 - rtp;
}

function triggerHouseEdgeAlert(username, houseEdge, threshold) {
    console.warn(`House Edge Alert for ${username}: ${houseEdge.toFixed(1)}% (threshold: ${threshold}%)`);
    
    // Log alert
    RTPManager.logRTPEvent(username, 'house_edge_alert', {
        houseEdge: houseEdge,
        threshold: threshold,
        severity: houseEdge < 15 ? 'critical' : houseEdge < 20 ? 'warning' : 'normal'
    });
    
    // Show notification jika admin UI tersedia
    if (typeof window !== 'undefined' && window.adminUI) {
        const severity = houseEdge < 15 ? 'error' : 'warning';
        window.adminUI.showNotification(
            `⚠️ House Edge Alert: ${username} - ${houseEdge.toFixed(1)}%`, 
            severity
        );
    }
    
    // Auto-trigger emergency mode jika house edge terlalu rendah
    if (houseEdge < 15) {
        const userSettings = RTPManager.loadUserRTPSettings();
        if (!userSettings[username]) userSettings[username] = {};
        
        userSettings[username].emergencyModeActive = true;
        userSettings[username].forceLossSpins = 200; // Force 200 losses
        userSettings[username].customRTP = Math.min(userSettings[username].customRTP || 75, 70); // Drop to 70%
        
        RTPManager.saveUserRTPSettings(userSettings);
        
        console.log(`EMERGENCY: House edge for ${username} dropped to ${houseEdge.toFixed(1)}% - Activating emergency protocols`);
    }
}

// Initialize system saat CONFIG dimuat
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeRTPSystem();
        
        // Start monitoring setelah 5 detik
        setTimeout(() => {
            enableRTPMonitoring();
        }, 5000);
        
        console.log('🎰 High House Edge Slot System Initialized');
        console.log(`Base RTP: ${CONFIG.baseRTP}% (House Edge: ${100 - CONFIG.baseRTP}%)`);
        console.log(`RTP Control: ${CONFIG.admin.rtpControlEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`Max RTP Allowed: ${CONFIG.rtpControl.maxRTP}%`);
    });
}

// Export untuk penggunaan global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.RTPManager = RTPManager;
    window.EnhancedSymbolManager = EnhancedSymbolManager;
    
    // Debug functions dengan house edge focus
    window.rtpDebug = {
        getStats: () => {
            const stats = RTPManager.getRTPStatistics ? RTPManager.getRTPStatistics() : {};
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
            
            const userStats = {};
            users.filter(u => u.role === 'user').forEach(user => {
                const userLogs = gameLogs.filter(log => log.username === user.username);
                const rtp = RTPManager.calculateUserRTP(userLogs);
                const houseEdge = 100 - rtp;
                
                userStats[user.username] = {
                    rtp: rtp.toFixed(1) + '%',
                    houseEdge: houseEdge.toFixed(1) + '%',
                    spins: userLogs.length,
                    status: houseEdge > 25 ? 'EXCELLENT' : houseEdge > 20 ? 'GOOD' : 'NEEDS ATTENTION'
                };
            });
            
            return { ...stats, userStats };
        },
        
        setUserRTP: (username, rtp) => {
            // Hard cap di 80%
            rtp = Math.min(rtp, 80);
            const settings = RTPManager.loadUserRTPSettings();
            if (!settings[username]) settings[username] = {};
            settings[username].customRTP = rtp;
            RTPManager.saveUserRTPSettings(settings);
            console.log(`Set ${username} RTP to ${rtp}% (capped at 80%)`);
        },
        
        forceHouseEdge: (username, houseEdgePercent) => {
            const targetRTP = 100 - houseEdgePercent;
            // Ensure tidak melebihi 80%
            const cappedRTP = Math.min(targetRTP, 80);
            const actualHouseEdge = 100 - cappedRTP;
            
            const settings = RTPManager.loadUserRTPSettings();
            if (!settings[username]) settings[username] = {};
            settings[username].customRTP = cappedRTP;
            
            // Add force loss untuk ensure house edge
            settings[username].forceLossSpins = Math.floor(houseEdgePercent * 2);
            
            RTPManager.saveUserRTPSettings(settings);
            console.log(`Set ${username} house edge to ${actualHouseEdge.toFixed(1)}% (RTP: ${cappedRTP}%)`);
        },
        
        emergencyMode: (username) => {
            const settings = RTPManager.loadUserRTPSettings();
            if (!settings[username]) settings[username] = {};
            
            settings[username].emergencyModeActive = true;
            settings[username].customRTP = 65; // Ultra low
            settings[username].forceLossSpins = 300; // Force 300 losses
            
            RTPManager.saveUserRTPSettings(settings);
            console.log(`EMERGENCY MODE activated for ${username} - RTP: 65%, Force Loss: 300 spins`);
        },
        
        resetAll: () => {
            localStorage.removeItem('userRTPSettings');
            localStorage.removeItem('rtpLogs');
            localStorage.removeItem('gameLogs');
            initializeRTPSystem(); // Re-initialize dengan defaults
            console.log('All RTP data reset to high house edge defaults');
        },
        
        simulatePlayer: (username, spins = 100, targetHouseEdge = 25) => {
            const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
            const baseId = gameLogs.length;
            
            // Calculate win rate untuk achieve target house edge
            const targetRTP = 100 - targetHouseEdge;
            const winRate = Math.max(0.05, targetRTP / 500); // Very low win rate
            
            for (let i = 0; i < spins; i++) {
                const isWin = Math.random() < winRate;
                const bet = 50000;
                let win = 0;
                
                if (isWin) {
                    // Small wins untuk maintain house edge
                    const winMultiplier = 1.1 + (Math.random() * 0.4); // 1.1x - 1.5x
                    win = Math.floor(bet * winMultiplier);
                }
                
                gameLogs.push({
                    id: baseId + i + 1,
                    timestamp: new Date(Date.now() - (spins - i) * 1000).toISOString(),
                    username: username,
                    type: 'Spin',
                    bet: bet,
                    win: win,
                    balanceBefore: 1000000,
                    balanceAfter: 1000000 + win - bet,
                    combination: isWin ? 'Cherry-Cherry-Cherry' : 'Blank-Seven-Cherry',
                    rtp: 0,
                    targetRTP: targetRTP
                });
            }
            
            localStorage.setItem('gameLogs', JSON.stringify(gameLogs));
            
            // Calculate actual results
            const userLogs = gameLogs.filter(log => log.username === username);
            const actualRTP = RTPManager.calculateUserRTP(userLogs);
            const actualHouseEdge = 100 - actualRTP;
            
            console.log(`Simulated ${spins} spins for ${username}`);
            console.log(`Target House Edge: ${targetHouseEdge}%, Actual: ${actualHouseEdge.toFixed(1)}%`);
            console.log(`Target RTP: ${targetRTP}%, Actual: ${actualRTP.toFixed(1)}%`);
        },
        
        getHouseEdgeReport: () => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
            
            const report = {
                totalUsers: 0,
                totalProfit: 0,
                averageHouseEdge: 0,
                userBreakdown: []
            };
            
            users.filter(u => u.role === 'user').forEach(user => {
                const userLogs = gameLogs.filter(log => log.username === user.username);
                if (userLogs.length > 0) {
                    const totalBets = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
                    const totalWins = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
                    const profit = totalBets - totalWins;
                    const houseEdge = totalBets > 0 ? ((profit / totalBets) * 100) : 0;
                    
                    report.userBreakdown.push({
                        username: user.username,
                        spins: userLogs.length,
                        totalBets: totalBets,
                        totalWins: totalWins,
                        profit: profit,
                        houseEdge: houseEdge.toFixed(1) + '%',
                        status: houseEdge > 25 ? '✅ EXCELLENT' : houseEdge > 20 ? '✅ GOOD' : '⚠️ LOW'
                    });
                    
                    report.totalUsers++;
                    report.totalProfit += profit;
                }
            });
            
            const totalBets = gameLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
            report.averageHouseEdge = totalBets > 0 ? 
                ((report.totalProfit / totalBets) * 100).toFixed(1) + '%' : '0%';
            
            console.table(report.userBreakdown);
            console.log('\n📊 HOUSE EDGE SUMMARY:');
            console.log(`Total Users: ${report.totalUsers}`);
            console.log(`Total Profit: Rp ${report.totalProfit.toLocaleString()}`);
            console.log(`Average House Edge: ${report.averageHouseEdge}`);
            
            return report;
        }
    };
}