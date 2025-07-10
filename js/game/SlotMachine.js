// SlotMachine.js - Fixed dengan house edge control yang ketat

class SlotMachine {
    constructor(config) {
        // Konfigurasi dasar
        this.config = config;
        this.reelsCount = config.reels.count || 5;
        this.rowsCount = config.reels.rows || 3;
        this.payLines = config.payLines || [];
        
        // State permainan
        this.bet = config.defaultBet || 50000;
        this.activeLines = config.defaultLines || 5;
        this.balance = 0;
        this.lastWin = 0;
        this.totalSpins = 0;
        this.consecutiveLosses = 0;
        this.isSpinning = false;
        this.autoSpinEnabled = false;
        this.soundEnabled = true;
        
        // Progressive jackpot
        this.progressiveJackpot = config.jackpot ? config.jackpot.basePayout : 1000000;
        
        // FIXED RTP Control System - HOUSE EDGE FIRST
        this.targetRTP = 75.0; // DEFAULT SANGAT RENDAH
        this.currentRTP = 75.0; // Start low, tidak naik mudah
        this.totalBetAmount = 0;
        this.totalWinAmount = 0;
        this.spinsSinceLastWin = 0;
        this.maxSpinsWithoutWin = 60; // Default 60 spins tanpa menang
        this.rtpDecayFactor = 0.995; // RTP decay setiap spin untuk house edge
        
        // House edge protection
        this.houseEdgeTarget = 25.0; // Target 25% house edge
        this.emergencyMode = false;
        this.forceLossSpins = 20; // Default force loss
        this.antiWinStreak = 0; // Counter untuk mencegah winning streak
        
        // User-specific RTP settings
        this.userRTPSettings = {};
        this.currentUsername = null;
        
        // Admin forced results queue
        this.forcedResultsQueue = [];
        this.nextForcedResult = null;
        
        // Komponen game
        this.symbolManager = null;
        this.reels = [];
        
        // Callback handlers
        this.onSpinStart = null;
        this.onSpinComplete = null;
        this.onWin = null;
        this.onBalanceChange = null;
        this.onError = null;
        this.onJackpot = null;
        this.onRTPChange = null;
        
        // Admin mode settings
        this.adminSettings = null;
        this.nextForcedResult = null;

        // username untuk tracking
        this.currentUsername = null;
        // Container element
        this.container = null;
        
        // Win control settings dengan bias ke loss
        this.winControlEnabled = false;
        this.forceWinAfterSpins = 60; // Increased dari 15 ke 60
        
        // Session tracking untuk prevent RTP manipulation
        this.sessionStartTime = Date.now();
        this.sessionSpins = 0;
        this.sessionBets = 0;
        this.sessionWins = 0;
        
        // Inisialisasi komponen
        this.init();
        
        // Set global reference
        window.slotMachine = this;
    }
    
    init() {
        // Buat symbol manager
        this.symbolManager = new SymbolManager(this.config.reels.symbols);
        
        // Buat reels
        for (let i = 0; i < this.reelsCount; i++) {
            const reel = new Reel(i, this.symbolManager, {
                rows: this.rowsCount,
                spinDuration: this.config.spinDuration
            });
            this.reels.push(reel);
        }
        
        // Load pengaturan admin dan user RTP
        this.loadAdminSettings();
        this.loadUserRTPSettings();
        
        // Initialize house edge protection
        this.initializeHouseEdgeProtection();
    }
    
    initializeHouseEdgeProtection() {
        // Setup automatic house edge protection
        this.houseEdgeProtectionInterval = setInterval(() => {
            this.enforceHouseEdge();
        }, 30000); // Check setiap 30 detik
        
        // Setup RTP decay untuk natural house edge
        this.rtpDecayInterval = setInterval(() => {
            this.applyRTPDecay();
        }, 60000); // Apply decay setiap menit
    }
    
    loadAdminSettings() {
        const adminSettings = localStorage.getItem('adminSettings');
        if (adminSettings) {
            this.adminSettings = JSON.parse(adminSettings);
        } else {
            // DEFAULT SETTINGS DENGAN HOUSE EDGE TINGGI
            this.adminSettings = {
                forceWinEnabled: false,
                winFrequency: 8, // Sangat rendah (8%)
                defaultWinAmount: 'small',
                forceWinAfterSpins: 60, // Tinggi
                rtpControlEnabled: true,
                minRTP: 65.0, // Sangat rendah
                maxRTP: 80.0, // Hard cap
                rtpAdjustmentSpeed: 'ultra_slow',
                houseEdgeMode: true,
                emergencyRTPThreshold: 82.0
            };
        }
        
        this.applyAdminSettings();
    }
    
    loadUserRTPSettings() {
        const userSettings = localStorage.getItem('userRTPSettings');
        if (userSettings) {
            this.userRTPSettings = JSON.parse(userSettings);
        }
    }
    
    applyAdminSettings() {
        this.winControlEnabled = this.adminSettings.forceWinEnabled;
        this.forceWinAfterSpins = this.adminSettings.forceWinAfterSpins || 60;
        this.maxSpinsWithoutWin = this.adminSettings.forceWinAfterSpins || 60;
        
        // FIXED: Set target RTP dari admin settings, tapi cap di 80%
        if (this.adminSettings.globalRTPTarget) {
            this.targetRTP = Math.min(this.adminSettings.globalRTPTarget, 80.0);
        }
    }
    
    setUsername(username) {
        this.currentUsername = username;
        
        // Load saldo dari localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        if (user) {
            this.balance = user.balance || 0;
            if (this.onBalanceChange) {
                this.onBalanceChange(this.balance);
            }
        }
        
        // Load user-specific RTP settings
        this.loadUserSpecificRTP(username);
        this.loadUserStatistics(username);
        
        // Initialize user dengan default rendah jika belum ada
        this.initializeUserDefaults(username);
    }
    
    initializeUserDefaults(username) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {
                customRTP: 75.0, // Default rendah
                forceLossSpins: 20,
                maxSpinsWithoutWin: 60,
                lastUpdated: new Date().toISOString(),
                houseEdgeMode: true,
                emergencyModeActive: false
            };
            
            // Save ke localStorage
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        }
    }
    
    loadUserSpecificRTP(username) {
        if (this.userRTPSettings[username]) {
            const userSettings = this.userRTPSettings[username];
            
            // FIXED: Hard cap RTP di 80%
            this.targetRTP = Math.min(userSettings.customRTP || 75.0, 80.0);
            this.forceLossSpins = userSettings.forceLossSpins || 20;
            this.maxSpinsWithoutWin = userSettings.maxSpinsWithoutWin || 60;
            this.emergencyMode = userSettings.emergencyModeActive || false;
            
            console.log(`Loaded RTP settings for ${username}: ${this.targetRTP}% (capped at 80%)`);
        }
    }
    
    loadUserStatistics(username) {
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        const userLogs = gameLogs.filter(log => log.username === username);
        
        if (userLogs.length > 0) {
            this.totalBetAmount = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
            this.totalWinAmount = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
            this.totalSpins = userLogs.length;
            
            // FIXED: Calculate RTP dengan house edge protection
            if (this.totalBetAmount > 0) {
                let calculatedRTP = (this.totalWinAmount / this.totalBetAmount) * 100;
                
                // House edge protection - jika RTP terlalu tinggi, apply correction
                if (calculatedRTP > this.targetRTP) {
                    const excess = calculatedRTP - this.targetRTP;
                    calculatedRTP = this.targetRTP + (excess * 0.5); // Reduce excess by half
                    
                    // Log correction
                    console.log(`RTP corrected for house edge: ${calculatedRTP.toFixed(1)}%`);
                }
                
                // Hard cap
                this.currentRTP = Math.min(calculatedRTP, 80.0);
            }
            
            // Calculate consecutive losses
            let consecutiveLosses = 0;
            for (let i = userLogs.length - 1; i >= 0; i--) {
                if (userLogs[i].win > 0) {
                    break;
                }
                consecutiveLosses++;
            }
            this.consecutiveLosses = consecutiveLosses;
            this.spinsSinceLastWin = consecutiveLosses;
        }
        
        console.log(`User ${username} stats - RTP: ${this.currentRTP.toFixed(2)}% (Target: ${this.targetRTP}%), House Edge: ${(100 - this.currentRTP).toFixed(2)}%`);
    }
    
    // FIXED: Enhanced RTP calculation dengan house edge bias
    shouldWinBasedOnRTP() {
        // Emergency mode - always lose
        if (this.emergencyMode || this.forceLossSpins > 0) {
            if (this.forceLossSpins > 0) {
                this.forceLossSpins--;
            }
            console.log(`Force loss active: ${this.forceLossSpins} spins remaining`);
            return false;
        }
        
        // Anti-win streak protection
        if (this.antiWinStreak > 0) {
            this.antiWinStreak--;
            console.log(`Anti-win streak: ${this.antiWinStreak} spins remaining`);
            return false;
        }
        
        // Check house edge
        const currentHouseEdge = 100 - this.currentRTP;
        const targetHouseEdge = 100 - this.targetRTP;
        
        // Jika house edge di bawah target, kurangi win chance drastis
        if (currentHouseEdge < targetHouseEdge) {
            const houseEdgeDeficit = targetHouseEdge - currentHouseEdge;
            
            console.log(`House edge deficit: ${houseEdgeDeficit.toFixed(1)}%`);
            
            if (houseEdgeDeficit > 5) {
                return Math.random() < 0.02; // 2% chance
            } else if (houseEdgeDeficit > 2) {
                return Math.random() < 0.05; // 5% chance
            } else {
                return Math.random() < 0.08; // 8% chance
            }
        }
        
        // Force win hanya jika consecutive losses sangat tinggi
        if (this.spinsSinceLastWin >= this.maxSpinsWithoutWin && this.spinsSinceLastWin > 50) {
            console.log(`Force win after ${this.spinsSinceLastWin} consecutive losses`);
            return true;
        }
        
        // Normal calculation dengan house edge bias
        const rtpDifference = this.currentRTP - this.targetRTP;
        let winProbability = 0.10; // Base 10% chance (rendah)
        
        if (rtpDifference < -10) {
            winProbability = 0.20; // 20% jika RTP sangat rendah
        } else if (rtpDifference < -5) {
            winProbability = 0.15; // 15%
        } else if (rtpDifference > 5) {
            winProbability = 0.02; // 2% jika RTP tinggi
        } else if (rtpDifference > 2) {
            winProbability = 0.05; // 5%
        }
        
        // Session protection - kurangi win chance seiring waktu
        const sessionMinutes = (Date.now() - this.sessionStartTime) / 60000;
        if (sessionMinutes > 30) {
            winProbability *= 0.8; // Reduce 20% after 30 minutes
        }
        
        return Math.random() < winProbability;
    }
    
    // FIXED: Enhanced house edge enforcement
    enforceHouseEdge() {
        const currentHouseEdge = 100 - this.currentRTP;
        const targetHouseEdge = 100 - this.targetRTP;
        
        // Jika house edge terlalu rendah, activate emergency mode
        if (currentHouseEdge < targetHouseEdge - 3) {
            this.activateEmergencyMode();
        }
        
        // Jika RTP terlalu tinggi, force correction
        if (this.currentRTP > this.targetRTP + 2) {
            this.applyRTPCorrection();
        }
        
        // Monitor session untuk prevent manipulation
        this.monitorSession();
    }
    
    activateEmergencyMode() {
        this.emergencyMode = true;
        this.forceLossSpins = Math.max(this.forceLossSpins, 50); // Minimum 50 force losses
        
        console.log(`EMERGENCY MODE ACTIVATED - House edge too low: ${(100 - this.currentRTP).toFixed(1)}%`);
        
        // Update user settings
        if (this.currentUsername) {
            if (!this.userRTPSettings[this.currentUsername]) {
                this.userRTPSettings[this.currentUsername] = {};
            }
            this.userRTPSettings[this.currentUsername].emergencyModeActive = true;
            this.userRTPSettings[this.currentUsername].forceLossSpins = this.forceLossSpins;
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        }
        
        // Callback untuk notify admin
        if (this.onRTPChange) {
            this.onRTPChange({
                currentRTP: this.currentRTP,
                targetRTP: this.targetRTP,
                emergencyMode: true,
                houseEdge: 100 - this.currentRTP
            });
        }
    }
    
    applyRTPCorrection() {
        // Reduce current RTP gradually towards target
        const rtpExcess = this.currentRTP - this.targetRTP;
        const correctionFactor = Math.min(rtpExcess * 0.1, 2.0); // Max 2% correction per call
        
        this.currentRTP = Math.max(this.currentRTP - correctionFactor, this.targetRTP);
        
        // Add force loss spins based on correction
        this.forceLossSpins += Math.floor(correctionFactor * 5);
        
        console.log(`RTP corrected by ${correctionFactor.toFixed(1)}%, new RTP: ${this.currentRTP.toFixed(1)}%`);
    }
    
    applyRTPDecay() {
        // Natural RTP decay untuk maintain house edge
        if (this.currentRTP > this.targetRTP) {
            this.currentRTP *= this.rtpDecayFactor;
            this.currentRTP = Math.max(this.currentRTP, this.targetRTP);
        }
    }
    
    monitorSession() {
        const sessionRTP = this.sessionBets > 0 ? (this.sessionWins / this.sessionBets) * 100 : 0;
        
        // Jika session RTP terlalu tinggi, apply immediate correction
        if (sessionRTP > this.targetRTP + 5 && this.sessionSpins > 20) {
            this.forceLossSpins += 20;
            this.antiWinStreak = 10; // Prevent wins for next 10 spins
            
            console.log(`Session RTP too high (${sessionRTP.toFixed(1)}%) - Applied correction`);
        }
    }
    
    // Render slot machine ke container
    renderTo(container) {
        this.container = container;
        container.innerHTML = '';
        
        // Render setiap reel
        this.reels.forEach((reel, index) => {
            const reelElement = document.createElement('div');
            reelElement.className = 'reel';
            reelElement.id = `reel${index + 1}`;
            container.appendChild(reelElement);
            
            reel.renderTo(reelElement);
        });
        
        return container;
    }
    
    // FIXED: Main spin method dengan house edge control
    async spin() {
        if (this.isSpinning) {
            console.log('Already spinning');
            return;
        }
        
        // Check saldo
        if (this.balance < this.bet) {
            if (this.onError) {
                this.onError('Saldo tidak mencukupi');
            }
            return;
        }
        
        this.isSpinning = true;
        this.totalSpins++;
        this.sessionSpins++;
        this.spinsSinceLastWin++;
        
        // Update totals
        this.totalBetAmount += this.bet;
        this.sessionBets += this.bet;
        
        // Kurangi saldo
        this.updateBalance(-this.bet);
        
        // Update progressive jackpot
        this.updateProgressiveJackpot();
        
        console.log(`Spin #${this.totalSpins} - Bet: ${this.bet}, Current RTP: ${this.currentRTP.toFixed(1)}%, House Edge: ${(100 - this.currentRTP).toFixed(1)}%`);
        
        // Callback spin start
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // FIXED: Determine result dengan house edge protection
        const shouldWin = this.shouldWinBasedOnRTP();
        console.log(`Win decision: ${shouldWin}, Force loss remaining: ${this.forceLossSpins}`);
        
        let result;
        if (shouldWin && this.forceLossSpins === 0 && !this.emergencyMode) {
            result = this.generateWinningResult();
        } else {
            result = this.generateLosingResult();
        }
        
        // Set hasil pada reels
        if (result.forced) {
            this.setForcedResult(result.symbols);
        }
        
        // Mulai spin semua reels
        const spinPromises = this.reels.map((reel, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    reel.spin(() => resolve(index));
                }, index * 200);
            });
        });
        
        // Tunggu semua reels selesai
        await Promise.all(spinPromises);
        
        // Evaluasi hasil
        const spinResult = this.evaluateResult();
        
        // FIXED: Update statistics dengan house edge protection
        this.updateRTPStatistics(spinResult);
        
        // Handle kemenangan
        if (spinResult.totalWin > 0) {
            this.handleWin(spinResult);
            this.spinsSinceLastWin = 0;
            
            // Apply anti-win streak
            this.antiWinStreak = this.calculateAntiWinStreak(spinResult.totalWin);
        } else {
            this.consecutiveLosses++;
        }
        
        // Save game log
        this.saveGameLog(spinResult);
        
        this.isSpinning = false;
        
        // Callback spin complete
        if (this.onSpinComplete) {
            this.onSpinComplete(spinResult);
        }
        
        // Auto spin berikutnya
        if (this.autoSpinEnabled && this.balance >= this.bet) {
            setTimeout(() => this.spin(), 1000);
        }
        
        return spinResult;
    }
    
    // FIXED: Update RTP statistics dengan house edge bias
    updateRTPStatistics(result) {
        this.totalWinAmount += result.totalWin;
        this.sessionWins += result.totalWin;
        
        // Calculate new RTP dengan house edge protection
        if (this.totalBetAmount > 0) {
            let calculatedRTP = (this.totalWinAmount / this.totalBetAmount) * 100;
            
            // FIXED: Apply house edge protection
            if (calculatedRTP > this.targetRTP) {
                const excess = calculatedRTP - this.targetRTP;
                // Reduce excess more aggressively
                calculatedRTP = this.targetRTP + (excess * 0.3); // Only 30% of excess allowed
            }
            
            // Hard cap dengan margin
            this.currentRTP = Math.min(calculatedRTP, Math.min(this.targetRTP + 2, 80.0));
        }
        
        // Check emergency threshold
        if (this.currentRTP > 82.0) {
            this.activateEmergencyMode();
        }
        
        // Callback RTP change
        if (this.onRTPChange) {
            this.onRTPChange({
                currentRTP: this.currentRTP,
                targetRTP: this.targetRTP,
                totalSpins: this.totalSpins,
                consecutiveLosses: this.consecutiveLosses,
                houseEdge: 100 - this.currentRTP,
                emergencyMode: this.emergencyMode
            });
        }
        
        console.log(`RTP Updated - Current: ${this.currentRTP.toFixed(2)}%, Target: ${this.targetRTP}%, House Edge: ${(100 - this.currentRTP).toFixed(2)}%`);
    }
    
    calculateAntiWinStreak(winAmount) {
        // Calculate anti-win streak based on win amount
        const winMultiplier = winAmount / this.bet;
        
        if (winMultiplier > 10) {
            return 15; // Large win = 15 spins anti-streak
        } else if (winMultiplier > 5) {
            return 10; // Medium win = 10 spins
        } else if (winMultiplier > 2) {
            return 5; // Small win = 5 spins
        }
        
        return 2; // Minimal anti-streak
    }
    
    // Generate winning result dengan win amount control
    generateWinningResult() {
        // Determine win type based on RTP needs
        const rtpDifference = this.currentRTP - this.targetRTP;
        let winType = 'small'; // Default ke small
        
        // Only allow bigger wins jika RTP sangat rendah
        if (rtpDifference < -10 && this.consecutiveLosses > 40) {
            if (Math.random() < 0.1) winType = 'medium';
            if (Math.random() < 0.02) winType = 'large';
        } else if (rtpDifference < -5 && this.consecutiveLosses > 25) {
            if (Math.random() < 0.05) winType = 'medium';
        }
        
        console.log(`Generated winning result: ${winType} (RTP diff: ${rtpDifference.toFixed(1)}%)`);
        return this.generateSpecificWin(winType);
    }
    
    generateSpecificWin(winType) {
        const result = [];
        let symbol;
        
        switch (winType) {
            case 'small':
                symbol = this.symbolManager.getSymbol('cherry');
                break;
            case 'medium':
                symbol = this.symbolManager.getSymbol('bar_single');
                break;
            case 'large':
                symbol = this.symbolManager.getSymbol('bar_triple');
                break;
            case 'jackpot':
                symbol = this.symbolManager.getSymbol('seven');
                break;
            default:
                symbol = this.symbolManager.getSymbol('cherry');
        }
        
        // Generate minimal winning combination (3 symbols only)
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 3 && row === 1) { // Middle row, first 3 reels only
                    reelSymbols.push(symbol.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return { forced: true, symbols: result };
    }
    
    // Generate losing result dengan bias ke blank
    generateLosingResult() {
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                let symbol;
                
                // High probability untuk blank symbols
                if (Math.random() < 0.6) { // 60% chance blank
                    symbol = this.symbolManager.getSymbol('blank');
                } else {
                    // Ensure no winning combinations
                    do {
                        symbol = this.symbolManager.getRandomSymbol();
                    } while (this.wouldCreateWinningLine(result, reel, row, symbol));
                }
                
                reelSymbols.push(symbol);
            }
            result.push(reelSymbols);
        }
        
        console.log('Generated losing result with high blank probability');
        return { forced: true, symbols: result };
    }
    
    wouldCreateWinningLine(currentMatrix, reelIndex, rowIndex, newSymbol) {
        // Enhanced check untuk prevent winning combinations
        if (rowIndex === 1 && reelIndex < 3) { // Middle row check
            let sameCount = 1;
            for (let i = 0; i < reelIndex; i++) {
                if (currentMatrix[i] && currentMatrix[i][1] && 
                    currentMatrix[i][1].id === newSymbol.id && 
                    newSymbol.id !== 'blank') {
                    sameCount++;
                }
            }
            
            // Prevent 3+ matches
            if (sameCount >= 3) {
                return true;
            }
        }
        
        return false;
    }
    
    // Set forced result pada reels
    setForcedResult(symbolsMatrix) {
        symbolsMatrix.forEach((reelSymbols, reelIndex) => {
            if (this.reels[reelIndex]) {
                this.reels[reelIndex].forceResult(reelSymbols);
            }
        });
    }
    
    // Evaluasi hasil dengan win amount control
    evaluateResult() {
        const matrix = this.getSymbolMatrix();
        const wins = [];
        let totalWin = 0;
        let isJackpot = false;
        
        // Check paylines
        for (let i = 0; i < this.activeLines && i < this.payLines.length; i++) {
            const payline = this.payLines[i];
            const lineSymbols = payline.positions.map(pos => {
                const row = Math.floor(pos / this.reelsCount);
                const col = pos % this.reelsCount;
                return matrix[col] ? matrix[col][row] : null;
            }).filter(symbol => symbol !== null);
            
            const lineWin = this.calculateLineWin(lineSymbols);
            if (lineWin.amount > 0) {
                // Apply house edge factor to win amount
                let adjustedAmount = lineWin.amount;
                
                // Reduce win amount if RTP too high
                if (this.currentRTP > this.targetRTP) {
                    const reductionFactor = 1 - ((this.currentRTP - this.targetRTP) / 100);
                    adjustedAmount = Math.floor(adjustedAmount * Math.max(reductionFactor, 0.3));
                }
                
                wins.push({
                    line: payline.id,
                    symbols: lineSymbols,
                    amount: adjustedAmount,
                    count: lineWin.count,
                    positions: payline.positions
                });
                totalWin += adjustedAmount;
                
                this.highlightWinningLine(payline.positions, lineWin.count);
                
                if (lineWin.isJackpot) {
                    isJackpot = true;
                    // Reduced jackpot amount untuk house edge
                    totalWin += Math.floor(this.progressiveJackpot * 0.8);
                }
            }
        }
        
        return {
            matrix,
            wins,
            totalWin,
            isJackpot,
            bet: this.bet,
            activeLines: this.activeLines
        };
    }
    
    // Calculate line win dengan reduced payouts
    calculateLineWin(symbols) {
        if (!symbols || symbols.length === 0) {
            return { amount: 0, count: 0 };
        }
        
        const firstSymbol = symbols[0];
        let count = 1;
        
        // Count consecutive matching symbols
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i].id === firstSymbol.id || 
                (firstSymbol.isWild && symbols[i].id !== 'blank') ||
                (symbols[i].isWild && firstSymbol.id !== 'blank')) {
                count++;
            } else {
                break;
            }
        }
        
        // Minimum 3 untuk win
        if (count < 3) {
            return { amount: 0, count: 0 };
        }
        
        // Calculate payout dengan house edge reduction
        let basePayout = firstSymbol.getPayoutForCount(count);
        
        // Apply house edge factor
        const houseEdgeFactor = 0.7; // Reduce all payouts by 30%
        basePayout = Math.floor(basePayout * houseEdgeFactor);
        
        return {
            amount: basePayout * this.bet,
            count,
            isJackpot: firstSymbol.id === 'seven' && count === 5
        };
    }
    
    // Get symbol matrix
    getSymbolMatrix() {
        return this.reels.map(reel => reel.getVisibleSymbols());
    }
    
    // Highlight winning line
    highlightWinningLine(positions, count) {
        positions.slice(0, count).forEach(pos => {
            const row = Math.floor(pos / this.reelsCount);
            const col = pos % this.reelsCount;
            
            if (this.reels[col]) {
                this.reels[col].highlightSymbolAt(row, true);
            }
        });
    }
    
    // Clear highlights
    clearHighlights() {
        this.reels.forEach(reel => {
            for (let i = 0; i < this.rowsCount; i++) {
                reel.highlightSymbolAt(i, false);
            }
        });
    }
    
    // Handle win dengan reduced celebration
    handleWin(result) {
        this.lastWin = result.totalWin;
        this.consecutiveLosses = 0;
        
        // Update balance
        this.updateBalance(result.totalWin);
        
        // Reset progressive jackpot jika jackpot
        if (result.isJackpot) {
            this.progressiveJackpot = this.config.jackpot.basePayout;
            if (this.onJackpot) {
                this.onJackpot(result);
            }
        }
        
        // Callback win
        if (this.onWin) {
            this.onWin(result);
        }
        
        console.log(`WIN: ${result.totalWin} (${(result.totalWin / this.bet).toFixed(1)}x bet)`);
    }
    
    // Save game log dengan house edge info
    saveGameLog(result) {
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        
        const logEntry = {
            id: gameLogs.length + 1,
            timestamp: new Date().toISOString(),
            username: this.currentUsername,
            type: 'Spin',
            bet: this.bet,
            win: result.totalWin,
            balanceBefore: this.balance + this.bet - result.totalWin,
            balanceAfter: this.balance,
            combination: this.generateCombinationString(result.matrix),
            rtp: this.currentRTP,
            targetRTP: this.targetRTP,
            houseEdge: 100 - this.currentRTP,
            spinsSinceLastWin: this.spinsSinceLastWin,
            emergencyMode: this.emergencyMode,
            forceLossSpins: this.forceLossSpins
        };
        
        gameLogs.push(logEntry);
        
        // Keep only last 1000 logs
        if (gameLogs.length > 1000) {
            gameLogs.splice(0, gameLogs.length - 1000);
        }
        
        localStorage.setItem('gameLogs', JSON.stringify(gameLogs));
    }
    
    generateCombinationString(matrix) {
        if (!matrix || matrix.length === 0) return 'N/A';
        
        // Middle row combination
        const middleRow = matrix.map(reel => reel[1] ? reel[1].id : 'blank');
        return middleRow.join('-');
    }
    
    // Update balance
    updateBalance(amount) {
        this.balance += amount;
        
        // Update user balance in localStorage
        if (this.currentUsername) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.username === this.currentUsername);
            if (userIndex !== -1) {
                users[userIndex].balance = this.balance;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
        
        // Callback balance change
        if (this.onBalanceChange) {
            this.onBalanceChange(this.balance);
        }
    }
    
    // Update progressive jackpot
    updateProgressiveJackpot() {
        if (this.config.jackpot && this.config.jackpot.progressiveRate) {
            const contribution = this.bet * this.config.jackpot.progressiveRate;
            this.progressiveJackpot += contribution;
        }
    }
    
    // Admin functions dengan house edge control
    setUserRTP(username, targetRTP, forceLossSpins = 0, maxSpinsWithoutWin = 60) {
        // Hard cap di 80%
        targetRTP = Math.min(targetRTP, 80.0);
        
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = targetRTP;
        this.userRTPSettings[username].forceLossSpins = forceLossSpins;
        this.userRTPSettings[username].maxSpinsWithoutWin = maxSpinsWithoutWin;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply jika user saat ini
        if (this.currentUsername === username) {
            this.loadUserSpecificRTP(username);
        }
        
        console.log(`Set RTP for ${username}: ${targetRTP}% (capped at 80%), Force loss: ${forceLossSpins} spins`);
    }
    
    // Force user to lose
    forceUserLoss(username, spins) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].forceLossSpins = spins;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        if (this.currentUsername === username) {
            this.forceLossSpins = spins;
        }
        
        console.log(`Forced ${username} to lose for ${spins} spins`);
    }
    
    // Get statistics
    getRTPStatistics() {
        return {
            currentRTP: this.currentRTP,
            targetRTP: this.targetRTP,
            houseEdge: 100 - this.currentRTP,
            targetHouseEdge: 100 - this.targetRTP,
            totalBetAmount: this.totalBetAmount,
            totalWinAmount: this.totalWinAmount,
            totalSpins: this.totalSpins,
            consecutiveLosses: this.consecutiveLosses,
            spinsSinceLastWin: this.spinsSinceLastWin,
            forceLossSpins: this.forceLossSpins,
            emergencyMode: this.emergencyMode,
            sessionSpins: this.sessionSpins,
            sessionRTP: this.sessionBets > 0 ? (this.sessionWins / this.sessionBets) * 100 : 0
        };
    }
    
    // Set bet dengan validation
    setBet(amount) {
        if (amount >= this.config.minBet && amount <= this.config.maxBet) {
            this.bet = amount;
            return true;
        }
        return false;
    }
    
    // Set active lines
    setActiveLines(lines) {
        if (lines >= 1 && lines <= this.config.maxLines) {
            this.activeLines = lines;
            return true;
        }
        return false;
    }
    
    // Get progressive jackpot
    getProgressiveJackpot() {
        return this.progressiveJackpot;
    }
    
    // Set auto spin
    setAutoSpin(enabled) {
        this.autoSpinEnabled = enabled;
    }
    
    // Play sound
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        const soundFile = this.config.sounds[soundType];
        if (soundFile) {
            const audio = new Audio(soundFile);
            audio.play().catch(e => console.log('Sound play failed:', e));
        }
    }
    
    // Cleanup
    destroy() {
        if (this.houseEdgeProtectionInterval) {
            clearInterval(this.houseEdgeProtectionInterval);
        }
        if (this.rtpDecayInterval) {
            clearInterval(this.rtpDecayInterval);
        }
    }
    
    // Get game statistics
    getStatistics() {
        return {
            totalSpins: this.totalSpins,
            balance: this.balance,
            lastWin: this.lastWin,
            consecutiveLosses: this.consecutiveLosses,
            progressiveJackpot: this.progressiveJackpot,
            currentRTP: this.currentRTP,
            targetRTP: this.targetRTP,
            houseEdge: 100 - this.currentRTP,
            totalBetAmount: this.totalBetAmount,
            totalWinAmount: this.totalWinAmount,
            spinsSinceLastWin: this.spinsSinceLastWin,
            forceLossSpins: this.forceLossSpins,
            emergencyMode: this.emergencyMode,
            sessionStats: {
                spins: this.sessionSpins,
                bets: this.sessionBets,
                wins: this.sessionWins,
                rtp: this.sessionBets > 0 ? (this.sessionWins / this.sessionBets) * 100 : 0
            }
        };
    }
}