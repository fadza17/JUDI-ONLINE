// SlotMachine.js - FIXED VERSION dengan RTP Control yang benar

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
        
        // RTP Control System - FIXED
        this.targetRTP = 95.5;
        this.currentRTP = 95.5;
        this.totalBetAmount = 0;
        this.totalWinAmount = 0;
        this.spinsSinceLastWin = 0;
        this.maxSpinsWithoutWin = 20;
        
        // User-specific settings
        this.userRTPSettings = {};
        this.currentUsername = null;
        this.forcedNextResult = null; // FIXED: Single forced result
        
        // Komponen game
        this.symbolManager = null;
        this.reels = [];
        
        // Callback handlers
        this.onSpinStart = null;
        this.onSpinComplete = null;
        this.onWin = null;
        this.onBalanceChange = null;
        this.onError = null;
        
        // Admin settings
        this.adminSettings = null;
        this.nextForcedResult = null;

        // username untuk tracking
        this.currentUsername = null;
        
        // Inisialisasi
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
        
        // Load settings
        this.loadAdminSettings();
        this.loadUserRTPSettings();
    }
    
    loadAdminSettings() {
        const adminSettings = localStorage.getItem('adminSettings');
        if (adminSettings) {
            this.adminSettings = JSON.parse(adminSettings);
        } else {
            this.adminSettings = {
                forceWinEnabled: false,
                winFrequency: 30,
                defaultWinAmount: 'medium',
                forceWinAfterSpins: 15,
                rtpControlEnabled: true,
                globalRTP: 95.5
            };
        }
    }
    
    loadUserRTPSettings() {
        const userSettings = localStorage.getItem('userRTPSettings');
        if (userSettings) {
            this.userRTPSettings = JSON.parse(userSettings);
        }
    }
    
    setUsername(username) {
        this.currentUsername = username;
        console.log(`Setting username: ${username}`);
        
        // Load user balance
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
    }
    
    loadUserSpecificRTP(username) {
        if (this.userRTPSettings[username]) {
            const userSettings = this.userRTPSettings[username];
            this.targetRTP = userSettings.customRTP || 95.5;
            this.maxSpinsWithoutWin = userSettings.maxSpinsWithoutWin || 20;
            
            // FIXED: Check for forced next result
            if (userSettings.nextForcedResult) {
                this.forcedNextResult = userSettings.nextForcedResult;
                console.log(`Loaded forced result for ${username}: ${this.forcedNextResult}`);
            }
            
            console.log(`Loaded RTP settings for ${username}: Target RTP ${this.targetRTP}%`);
        }
    }
    
    loadUserStatistics(username) {
        const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
        const userLogs = gameLogs.filter(log => log.username === username);
        
        if (userLogs.length > 0) {
            this.totalBetAmount = userLogs.reduce((sum, log) => sum + (log.bet || 0), 0);
            this.totalWinAmount = userLogs.reduce((sum, log) => sum + (log.win || 0), 0);
            this.totalSpins = userLogs.length;
            
            // Calculate current RTP
            if (this.totalBetAmount > 0) {
                this.currentRTP = (this.totalWinAmount / this.totalBetAmount) * 100;
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
        
        console.log(`User ${username} stats - Current RTP: ${this.currentRTP.toFixed(2)}%, Target: ${this.targetRTP}%`);
    }
    
    // FIXED: Proper RTP-based win determination
    shouldWinBasedOnRTP() {
        console.log('=== RTP CHECK ===');
        console.log(`Current RTP: ${this.currentRTP.toFixed(2)}%`);
        console.log(`Target RTP: ${this.targetRTP}%`);
        console.log(`Consecutive losses: ${this.consecutiveLosses}`);
        console.log(`Forced result: ${this.forcedNextResult}`);
        
        // FIXED: Check for forced result first
        if (this.forcedNextResult) {
            console.log(`Using forced result: ${this.forcedNextResult}`);
            const shouldWin = this.forcedNextResult !== 'lose';
            
            // Clear forced result after using it
            this.forcedNextResult = null;
            
            // Also clear from user settings
            if (this.userRTPSettings[this.currentUsername]) {
                delete this.userRTPSettings[this.currentUsername].nextForcedResult;
                localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
            }
            
            return shouldWin;
        }
        
        // Force win if too many consecutive losses
        if (this.consecutiveLosses >= this.maxSpinsWithoutWin) {
            console.log(`Force win due to consecutive losses: ${this.consecutiveLosses}`);
            return true;
        }
        
        // RTP-based calculation
        const rtpDifference = this.currentRTP - this.targetRTP;
        let winProbability = 0.15; // Base 15%
        
        if (rtpDifference < -10) {
            winProbability = 0.8; // High chance if RTP very low
        } else if (rtpDifference < -5) {
            winProbability = 0.6; // Good chance if RTP low
        } else if (rtpDifference < -2) {
            winProbability = 0.4; // Medium chance if RTP slightly low
        } else if (rtpDifference > 5) {
            winProbability = 0.05; // Low chance if RTP high
        } else if (rtpDifference > 2) {
            winProbability = 0.1; // Reduced chance if RTP slightly high
        }
        
        console.log(`RTP difference: ${rtpDifference.toFixed(2)}%, Win probability: ${(winProbability * 100).toFixed(1)}%`);
        
        const shouldWin = Math.random() < winProbability;
        console.log(`Random result: ${shouldWin ? 'WIN' : 'LOSE'}`);
        
        return shouldWin;
    }
    
    // FIXED: Main spin method with proper RTP logic
    async spin() {
        if (this.isSpinning) {
            console.log('Already spinning');
            return;
        }
        
        // Check balance
        if (this.balance < this.bet) {
            if (this.onError) {
                this.onError('Saldo tidak mencukupi');
            }
            return;
        }
        
        this.isSpinning = true;
        this.totalSpins++;
        this.spinsSinceLastWin++;
        
        console.log(`\n=== SPIN ${this.totalSpins} ===`);
        console.log(`User: ${this.currentUsername}`);
        console.log(`Bet: ${this.bet}`);
        
        // Update totals
        this.totalBetAmount += this.bet;
        
        // Deduct balance
        this.updateBalance(-this.bet);
        
        // Update progressive jackpot
        this.updateProgressiveJackpot();
        
        // Callback spin start
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // FIXED: Determine if should win
        const shouldWin = this.shouldWinBasedOnRTP();
        
        let result;
        if (shouldWin) {
            console.log('Generating WINNING result');
            result = this.generateWinningResult();
        } else {
            console.log('Generating LOSING result');
            result = this.generateLosingResult();
        }
        
        // Set forced result on reels
        if (result.forced) {
            this.setForcedResult(result.symbols);
        }
        
        // Start spinning all reels
        const spinPromises = this.reels.map((reel, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    reel.spin(() => resolve(index));
                }, index * 200);
            });
        });
        
        // Wait for all reels to complete
        await Promise.all(spinPromises);
        
        // Evaluate result
        const spinResult = this.evaluateResult();
        
        // Update statistics
        this.updateRTPStatistics(spinResult);
        
        // Handle win
        if (spinResult.totalWin > 0) {
            this.handleWin(spinResult);
            this.spinsSinceLastWin = 0;
            this.consecutiveLosses = 0;
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
        
        // Auto spin
        if (this.autoSpinEnabled && this.balance >= this.bet) {
            setTimeout(() => this.spin(), 1000);
        }
        
        console.log(`Final result: ${spinResult.totalWin > 0 ? 'WIN' : 'LOSE'} - Amount: ${spinResult.totalWin}`);
        
        return spinResult;
    }
    
    // FIXED: Generate winning result
    generateWinningResult() {
        const winType = this.forcedNextResult || this.determineWinType();
        console.log(`Generating win type: ${winType}`);
        
        const result = [];
        let winSymbol;
        
        switch (winType) {
            case 'small':
            case 'win-small':
                winSymbol = this.symbolManager.getSymbol('cherry');
                break;
            case 'medium':
            case 'win-medium':
                winSymbol = this.symbolManager.getSymbol('bar_single');
                break;
            case 'large':
            case 'win-large':
                winSymbol = this.symbolManager.getSymbol('bar_triple');
                break;
            case 'jackpot':
                winSymbol = this.symbolManager.getSymbol('seven');
                break;
            default:
                winSymbol = this.symbolManager.getSymbol('bar_single');
        }
        
        if (!winSymbol) {
            console.error('Win symbol not found, using random');
            winSymbol = this.symbolManager.getRandomSymbol();
        }
        
        // Generate winning combination
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 3 && row === 1) { // Middle row, first 3 reels
                    reelSymbols.push(winSymbol.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return { forced: true, symbols: result, winType: winType };
    }
    
    // FIXED: Generate losing result
    generateLosingResult() {
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel === 2 && row === 1) {
                    // Make sure third reel middle doesn't match first two
                    const firstSymbol = result[0] && result[0][1] ? result[0][1].id : null;
                    const secondSymbol = result[1] && result[1][1] ? result[1][1].id : null;
                    
                    let symbol;
                    do {
                        symbol = this.symbolManager.getRandomSymbol();
                    } while (symbol.id === firstSymbol || symbol.id === secondSymbol);
                    
                    reelSymbols.push(symbol);
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return { forced: true, symbols: result };
    }
    
    determineWinType() {
        const rtpDifference = this.currentRTP - this.targetRTP;
        
        if (rtpDifference < -10) {
            // Very low RTP, allow bigger wins
            const rand = Math.random();
            if (rand < 0.1) return 'large';
            if (rand < 0.3) return 'medium';
            return 'small';
        } else if (rtpDifference < -5) {
            // Low RTP, medium wins
            const rand = Math.random();
            if (rand < 0.2) return 'medium';
            return 'small';
        } else {
            // Normal/high RTP, small wins only
            return 'small';
        }
    }
    
    // Set forced result on reels
    setForcedResult(symbolsMatrix) {
        symbolsMatrix.forEach((reelSymbols, reelIndex) => {
            if (this.reels[reelIndex]) {
                this.reels[reelIndex].forceResult(reelSymbols);
            }
        });
    }
    
    // Evaluate result
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
                wins.push({
                    line: payline.id,
                    symbols: lineSymbols,
                    amount: lineWin.amount,
                    count: lineWin.count,
                    positions: payline.positions
                });
                totalWin += lineWin.amount;
                
                this.highlightWinningLine(payline.positions, lineWin.count);
                
                if (lineWin.isJackpot) {
                    isJackpot = true;
                    totalWin += this.progressiveJackpot;
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
    
    // Calculate line win
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
        
        // Need at least 3 for a win
        if (count < 3) {
            return { amount: 0, count: 0 };
        }
        
        // Calculate payout
        const basePayout = firstSymbol.getPayoutForCount(count);
        
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
    
    // Update RTP statistics
    updateRTPStatistics(result) {
        this.totalWinAmount += result.totalWin;
        
        // Calculate new RTP
        if (this.totalBetAmount > 0) {
            this.currentRTP = (this.totalWinAmount / this.totalBetAmount) * 100;
        }
        
        console.log(`RTP Updated - Current: ${this.currentRTP.toFixed(2)}%, Target: ${this.targetRTP}%`);
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
    
    // Handle win
    handleWin(result) {
        this.lastWin = result.totalWin;
        
        // Update balance
        this.updateBalance(result.totalWin);
        
        // Reset progressive jackpot if jackpot
        if (result.isJackpot) {
            this.progressiveJackpot = this.config.jackpot.basePayout;
        }
        
        // Callback win
        if (this.onWin) {
            this.onWin(result);
        }
        
        console.log(`WIN: ${result.totalWin} (${(result.totalWin / this.bet).toFixed(1)}x bet)`);
    }
    
    // Save game log
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
            spinsSinceLastWin: this.spinsSinceLastWin
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
    
    // FIXED: Admin methods for RTP control
    setUserRTP(username, targetRTP, nextResult = null) {
        console.log(`Setting user RTP: ${username} = ${targetRTP}%, Next result: ${nextResult}`);
        
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = targetRTP;
        
        if (nextResult) {
            this.userRTPSettings[username].nextForcedResult = nextResult;
        }
        
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply immediately if current user
        if (this.currentUsername === username) {
            this.targetRTP = targetRTP;
            
            if (nextResult) {
                this.forcedNextResult = nextResult;
                console.log(`Forced next result set for current user: ${nextResult}`);
            }
        }
    }
    
    // FIXED: Force user win
    forceUserWin(username, winType = 'medium') {
        console.log(`Forcing win for ${username}: ${winType}`);
        
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].nextForcedResult = winType;
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply immediately if current user
        if (this.currentUsername === username) {
            this.forcedNextResult = winType;
            console.log(`Forced result set for current user: ${winType}`);
        }
    }
    
    // Render slot machine
    renderTo(container) {
        this.container = container;
        container.innerHTML = '';
        
        this.reels.forEach((reel, index) => {
            const reelElement = document.createElement('div');
            reelElement.className = 'reel';
            reelElement.id = `reel${index + 1}`;
            container.appendChild(reelElement);
            
            reel.renderTo(reelElement);
        });
        
        return container;
    }
    
    // Utility methods
    setBet(amount) {
        if (amount >= this.config.minBet && amount <= this.config.maxBet) {
            this.bet = amount;
            return true;
        }
        return false;
    }
    
    setActiveLines(lines) {
        if (lines >= 1 && lines <= this.config.maxLines) {
            this.activeLines = lines;
            return true;
        }
        return false;
    }
    
    getProgressiveJackpot() {
        return this.progressiveJackpot;
    }
    
    setAutoSpin(enabled) {
        this.autoSpinEnabled = enabled;
    }
    
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        const soundFile = this.config.sounds[soundType];
        if (soundFile) {
            const audio = new Audio(soundFile);
            audio.play().catch(e => console.log('Sound play failed:', e));
        }
    }
    
    getStatistics() {
        return {
            totalSpins: this.totalSpins,
            balance: this.balance,
            lastWin: this.lastWin,
            consecutiveLosses: this.consecutiveLosses,
            currentRTP: this.currentRTP,
            targetRTP: this.targetRTP,
            totalBetAmount: this.totalBetAmount,
            totalWinAmount: this.totalWinAmount,
            spinsSinceLastWin: this.spinsSinceLastWin,
            forcedNextResult: this.forcedNextResult
        };
    }
}