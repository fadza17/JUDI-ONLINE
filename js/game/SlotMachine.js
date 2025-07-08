// SlotMachine.js - Enhanced dengan sistem RTP yang dapat diatur

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
        
        // RTP Control System dengan default SANGAT rendah
        this.targetRTP = config.baseRTP || 78.0; // Default ke 78%
        this.currentRTP = 100.0; // Start high, akan turun seiring waktu
        this.totalBetAmount = 0;
        this.totalWinAmount = 0;
        this.spinsSinceLastWin = 0;
        this.maxSpinsWithoutWin = 40; // Default 40 spins tanpa menang
        this.rtpAdjustmentFactor = 0.03; // Sangat lambat (0.03)
        
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
        
        // Container element
        this.container = null;
        
        // Win control settings
        this.winControlEnabled = false;
        this.forceWinAfterSpins = 15;
        this.forceLossSpins = 0; // Berapa spin yang dipaksa kalah
        
        // Inisialisasi komponen
        this.init();
        
        // Set global reference
        window.slotMachine = this;
    }
    
    // Inisialisasi mesin slot
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
    }
    
    // Load pengaturan admin dari localStorage
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
                minRTP: 85.0,
                maxRTP: 98.0,
                rtpAdjustmentSpeed: 'normal'
            };
        }
        
        // Apply admin settings
        this.applyAdminSettings();
    }
    
    // Load pengaturan RTP per user
    loadUserRTPSettings() {
        const userSettings = localStorage.getItem('userRTPSettings');
        if (userSettings) {
            this.userRTPSettings = JSON.parse(userSettings);
        }
    }
    
    // Apply admin settings ke mesin slot
    applyAdminSettings() {
        this.winControlEnabled = this.adminSettings.forceWinEnabled;
        this.forceWinAfterSpins = this.adminSettings.forceWinAfterSpins || 15;
        this.maxSpinsWithoutWin = this.adminSettings.forceWinAfterSpins || 20;
        
        // RTP adjustment speed
        switch(this.adminSettings.rtpAdjustmentSpeed) {
            case 'slow':
                this.rtpAdjustmentFactor = 0.05;
                break;
            case 'normal':
                this.rtpAdjustmentFactor = 0.1;
                break;
            case 'fast':
                this.rtpAdjustmentFactor = 0.2;
                break;
            default:
                this.rtpAdjustmentFactor = 0.1;
        }
    }
    
    // Set username dan load RTP settings khusus user
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
        
        // Load user statistics
        this.loadUserStatistics(username);
    }
    
    // Load RTP settings khusus untuk user
    loadUserSpecificRTP(username) {
        if (this.userRTPSettings[username]) {
            const userSettings = this.userRTPSettings[username];
            this.targetRTP = userSettings.customRTP || this.config.baseRTP;
            this.forceLossSpins = userSettings.forceLossSpins || 0;
            this.maxSpinsWithoutWin = userSettings.maxSpinsWithoutWin || 20;
            
            console.log(`Loaded RTP settings for ${username}:`, userSettings);
        }
    }
    
    // Load statistik user dari game logs
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
        
        console.log(`User ${username} stats - RTP: ${this.currentRTP.toFixed(2)}%, Spins: ${this.totalSpins}, Consecutive losses: ${this.consecutiveLosses}`);
    }
    
    // Set RTP target untuk user tertentu
    setUserRTP(username, targetRTP, forceLossSpins = 0, maxSpinsWithoutWin = 20) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = targetRTP;
        this.userRTPSettings[username].forceLossSpins = forceLossSpins;
        this.userRTPSettings[username].maxSpinsWithoutWin = maxSpinsWithoutWin;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply jika user saat ini
        if (this.currentUsername === username) {
            this.loadUserSpecificRTP(username);
        }
        
        console.log(`Set ULTRA LOW RTP for ${username}: ${targetRTP}% (MAX: 80%), Force loss: ${this.userRTPSettings[username].forceLossSpins} spins`);
    },TPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply jika user saat ini
        if (this.currentUsername === username) {
            this.loadUserSpecificRTP(username);
        }
        
        console.log(`Set RTP for ${username}: ${targetRTP}%, Force loss: ${forceLossSpins} spins`);
    }
    
    // Hitung apakah harus menang berdasarkan RTP
    shouldWinBasedOnRTP() {
        // Jika masih dalam periode force loss
        if (this.forceLossSpins > 0) {
            this.forceLossSpins--;
            console.log(`Force loss active, ${this.forceLossSpins} spins remaining`);
            return false;
        }
        
        // Jika sudah mencapai max spins tanpa menang, paksa menang
        if (this.spinsSinceLastWin >= this.maxSpinsWithoutWin) {
            console.log(`Max spins without win reached (${this.spinsSinceLastWin}), forcing win`);
            return true;
        }
        
        // Hitung projected RTP jika menang vs kalah
        const projectedBetTotal = this.totalBetAmount + this.bet;
        const currentWinChance = this.calculateWinChance();
        const projectedWinAmount = this.bet * currentWinChance;
        
        // RTP jika menang
        const rtpIfWin = ((this.totalWinAmount + projectedWinAmount) / projectedBetTotal) * 100;
        
        // RTP jika kalah
        const rtpIfLoss = (this.totalWinAmount / projectedBetTotal) * 100;
        
        // Tentukan berdasarkan target RTP
        const rtpDifference = this.currentRTP - this.targetRTP;
        
        console.log(`RTP Analysis - Current: ${this.currentRTP.toFixed(2)}%, Target: ${this.targetRTP}%, Diff: ${rtpDifference.toFixed(2)}%`);
        console.log(`If win: ${rtpIfWin.toFixed(2)}%, If loss: ${rtpIfLoss.toFixed(2)}%`);
        
        // Jika RTP saat ini lebih rendah dari target, tingkatkan chance menang
        if (rtpDifference < -5) { // RTP jauh di bawah target
            return Math.random() < 0.8; // 80% chance menang
        } else if (rtpDifference < -2) { // RTP sedikit di bawah target
            return Math.random() < 0.5; // 50% chance menang
        } else if (rtpDifference > 5) { // RTP jauh di atas target
            return Math.random() < 0.1; // 10% chance menang
        } else if (rtpDifference > 2) { // RTP sedikit di atas target
            return Math.random() < 0.2; // 20% chance menang
        } else {
            // RTP mendekati target, gunakan chance normal
            return Math.random() < 0.3; // 30% chance menang normal
        }
    }
    
    // Hitung win chance berdasarkan tipe kemenangan
    calculateWinChance() {
        const winTypes = {
            'small': 2,    // 2x bet
            'medium': 5,   // 5x bet
            'large': 15,   // 15x bet
            'jackpot': 100 // 100x bet
        };
        
        const winType = this.adminSettings.defaultWinAmount || 'medium';
        return winTypes[winType] || 5;
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
    
    // Mulai spin dengan RTP control
    async spin() {
        if (this.isSpinning) {
            console.log('Already spinning');
            return;
        }
        
        // Cek saldo
        if (this.balance < this.bet) {
            if (this.onError) {
                this.onError('Saldo tidak mencukupi');
            }
            return;
        }
        
        this.isSpinning = true;
        this.totalSpins++;
        this.spinsSinceLastWin++;
        
        // Update total bet amount
        this.totalBetAmount += this.bet;
        
        // Kurangi saldo
        this.updateBalance(-this.bet);
        
        // Update progressive jackpot
        this.updateProgressiveJackpot();
        
        // Log spin start
        console.log(`Spin #${this.totalSpins} - Bet: ${this.bet}, Balance: ${this.balance}`);
        
        // Callback spin start
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // Tentukan hasil spin berdasarkan RTP
        const shouldWin = this.shouldWinBasedOnRTP();
        const result = this.determineSpinResult(shouldWin);
        
        // Set hasil pada reels jika diperlukan
        if (result.forced) {
            this.setForcedResult(result.symbols);
        }
        
        // Mulai spin semua reels
        const spinPromises = this.reels.map((reel, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    reel.spin(() => resolve(index));
                }, index * 200); // Stagger spin start
            });
        });
        
        // Tunggu semua reels selesai
        await Promise.all(spinPromises);
        
        // Evaluasi hasil
        const spinResult = this.evaluateResult();
        
        // Update RTP statistics
        this.updateRTPStatistics(spinResult);
        
        // Handle kemenangan
        if (spinResult.totalWin > 0) {
            this.handleWin(spinResult);
            this.spinsSinceLastWin = 0;
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
    
    // Update statistik RTP
    updateRTPStatistics(result) {
        this.totalWinAmount += result.totalWin;
        
        // Calculate new RTP
        if (this.totalBetAmount > 0) {
            this.currentRTP = (this.totalWinAmount / this.totalBetAmount) * 100;
        }
        
        // Callback RTP change
        if (this.onRTPChange) {
            this.onRTPChange({
                currentRTP: this.currentRTP,
                targetRTP: this.targetRTP,
                totalSpins: this.totalSpins,
                consecutiveLosses: this.consecutiveLosses
            });
        }
        
        console.log(`RTP Updated - Current: ${this.currentRTP.toFixed(2)}%, Target: ${this.targetRTP}%`);
    }
    
    // Tentukan hasil spin berdasarkan RTP dan admin settings
    determineSpinResult(shouldWin = null) {
        // Cek admin forced result queue
        if (this.forcedResultsQueue.length > 0) {
            const result = this.forcedResultsQueue.shift();
            return { forced: true, symbols: result };
        }
        
        // Cek next forced result
        if (this.nextForcedResult) {
            const result = this.nextForcedResult;
            this.nextForcedResult = null;
            return { forced: true, symbols: result };
        }
        
        // Gunakan RTP-based decision jika shouldWin tidak diberikan
        if (shouldWin === null) {
            shouldWin = this.shouldWinBasedOnRTP();
        }
        
        // Generate hasil berdasarkan keputusan
        if (shouldWin) {
            return this.generateWinningResult();
        } else {
            return this.generateLosingResult();
        }
    }
    
    // Generate hasil menang berdasarkan target amount
    generateWinningResult() {
        const winAmount = this.adminSettings.defaultWinAmount || 'medium';
        let symbols = [];
        
        switch (winAmount) {
            case 'small':
                symbols = this.generateSmallWin();
                break;
            case 'medium':
                symbols = this.generateMediumWin();
                break;
            case 'large':
                symbols = this.generateLargeWin();
                break;
            case 'jackpot':
                symbols = this.generateJackpotWin();
                break;
            default:
                symbols = this.generateMediumWin();
        }
        
        console.log(`Generated winning result: ${winAmount}`);
        return { forced: true, symbols };
    }
    
    // Generate hasil kalah
    generateLosingResult() {
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                // Pastikan tidak ada kombinasi menang
                let symbol;
                do {
                    symbol = this.symbolManager.getRandomSymbol();
                } while (this.wouldCreateWinningLine(result, reel, row, symbol));
                
                reelSymbols.push(symbol);
            }
            result.push(reelSymbols);
        }
        
        console.log('Generated losing result');
        return { forced: true, symbols: result };
    }
    
    // Cek apakah simbol akan membuat garis menang
    wouldCreateWinningLine(currentMatrix, reelIndex, rowIndex, newSymbol) {
        // Simple check untuk reel pertama sampai ketiga di middle line
        if (rowIndex === 1 && reelIndex < 3) {
            // Cek apakah ada 2 simbol sama di posisi sebelumnya
            let sameCount = 1;
            for (let i = 0; i < reelIndex; i++) {
                if (currentMatrix[i] && currentMatrix[i][1] && currentMatrix[i][1].id === newSymbol.id) {
                    sameCount++;
                }
            }
            
            // Jika sudah ada 2 simbol sama dan ini yang ketiga, jangan buat
            if (sameCount >= 3) {
                return true;
            }
        }
        
        return false;
    }
    
    // Generate small win (cherry combination)
    generateSmallWin() {
        const cherry = this.symbolManager.getSymbol('cherry');
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 3 && row === 1) { // Middle row, first 3 reels
                    reelSymbols.push(cherry.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return result;
    }
    
    // Generate medium win (BAR combination)
    generateMediumWin() {
        const bar = this.symbolManager.getSymbol('bar_single');
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 4 && row === 1) { // Middle row, first 4 reels
                    reelSymbols.push(bar.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return result;
    }
    
    // Generate large win (Triple BAR combination)
    generateLargeWin() {
        const tripleBar = this.symbolManager.getSymbol('bar_triple');
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 4 && row === 1) { // Middle row, first 4 reels
                    reelSymbols.push(tripleBar.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return result;
    }
    
    // Generate jackpot win (5 sevens)
    generateJackpotWin() {
        const seven = this.symbolManager.getSymbol('seven');
        const result = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (row === 1) { // Middle row
                    reelSymbols.push(seven.clone());
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            result.push(reelSymbols);
        }
        
        return result;
    }
    
    // Set forced result pada reels
    setForcedResult(symbolsMatrix) {
        symbolsMatrix.forEach((reelSymbols, reelIndex) => {
            if (this.reels[reelIndex]) {
                this.reels[reelIndex].forceResult(reelSymbols);
            }
        });
    }
    
    // Evaluasi hasil spin
    evaluateResult() {
        const matrix = this.getSymbolMatrix();
        const wins = [];
        let totalWin = 0;
        let isJackpot = false;
        
        // Cek setiap payline yang aktif
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
                
                // Highlight winning symbols
                this.highlightWinningLine(payline.positions, lineWin.count);
                
                // Check for jackpot
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
    
    // Dapatkan matrix simbol saat ini
    getSymbolMatrix() {
        return this.reels.map(reel => reel.getVisibleSymbols());
    }
    
    // Hitung kemenangan untuk satu line
    calculateLineWin(symbols) {
        if (!symbols || symbols.length === 0) {
            return { amount: 0, count: 0 };
        }
        
        const firstSymbol = symbols[0];
        let count = 1;
        
        // Hitung berapa banyak simbol yang sama berturut-turut dari kiri
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i].id === firstSymbol.id || 
                (firstSymbol.isWild && symbols[i].id !== 'blank') ||
                (symbols[i].isWild && firstSymbol.id !== 'blank')) {
                count++;
            } else {
                break;
            }
        }
        
        // Minimum 3 simbol untuk menang
        if (count < 3) {
            // Cek mixed BAR combination
            if (this.symbolManager.isMixedBarCombination(symbols.slice(0, 3))) {
                return {
                    amount: this.calculateMixedBarPayout(3, this.bet),
                    count: 3,
                    isMixedBar: true
                };
            }
            return { amount: 0, count: 0 };
        }
        
        // Cek jackpot (5 sevens)
        if (firstSymbol.id === 'seven' && count === 5) {
            return {
                amount: firstSymbol.getPayoutForCount(count) * this.bet,
                count,
                isJackpot: true
            };
        }
        
        // Hitung payout normal
        const basePayout = firstSymbol.getPayoutForCount(count);
        return {
            amount: basePayout * this.bet,
            count
        };
    }
    
    // Calculate mixed BAR payout
    calculateMixedBarPayout(count, bet) {
        const mixedBarPayouts = {
            3: 25,  // 3 BAR campuran
            4: 75,  // 4 BAR campuran
            5: 200  // 5 BAR campuran
        };
        return (mixedBarPayouts[count] || 0) * bet;
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
    
    // Handle kemenangan
    handleWin(result) {
        this.lastWin = result.totalWin;
        this.consecutiveLosses = 0;
        
        // Update saldo
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
    
    // Generate combination string untuk log
    generateCombinationString(matrix) {
        if (!matrix || matrix.length === 0) return 'N/A';
        
        // Ambil middle row
        const middleRow = matrix.map(reel => reel[1] ? reel[1].id : 'blank');
        return middleRow.join('-');
    }
    
    // Update saldo
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
    
    // Set bet amount
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
    
    // Force next result (admin function)
    forceNextResult(symbolsMatrix) {
        this.nextForcedResult = symbolsMatrix;
    }
    
    // Add forced result to queue
    addForcedResult(symbolsMatrix) {
        this.forcedResultsQueue.push(symbolsMatrix);
    }
    
    // Clear forced results queue
    clearForcedResults() {
        this.forcedResultsQueue = [];
        this.nextForcedResult = null;
    }
    
    // Admin function: Force user to lose for X spins
    forceUserLoss(username, spins) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].forceLossSpins = spins;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        
        // Apply jika user saat ini
        if (this.currentUsername === username) {
            this.forceLossSpins = spins;
        }
        
        console.log(`Forced ${username} to lose for ${spins} spins`);
    }
    
    // Admin function: Force user to win next spin
    forceUserWin(username, winType = 'medium') {
        let symbols;
        switch (winType) {
            case 'small':
                symbols = this.generateSmallWin();
                break;
            case 'large':
                symbols = this.generateLargeWin();
                break;
            case 'jackpot':
                symbols = this.generateJackpotWin();
                break;
            default:
                symbols = this.generateMediumWin();
        }
        
        if (this.currentUsername === username) {
            this.nextForcedResult = symbols;
        } else {
            // Store for when user logs in
            if (!this.userRTPSettings[username]) {
                this.userRTPSettings[username] = {};
            }
            this.userRTPSettings[username].nextForcedWin = symbols;
            localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
        }
        
        console.log(`Forced win for ${username}: ${winType}`);
    }
    
    // Get current RTP statistics
    getRTPStatistics() {
        return {
            currentRTP: this.currentRTP,
            targetRTP: this.targetRTP,
            totalBetAmount: this.totalBetAmount,
            totalWinAmount: this.totalWinAmount,
            totalSpins: this.totalSpins,
            consecutiveLosses: this.consecutiveLosses,
            spinsSinceLastWin: this.spinsSinceLastWin,
            forceLossSpins: this.forceLossSpins
        };
    }
    
    // Reset user statistics
    resetUserStatistics(username = null) {
        const targetUsername = username || this.currentUsername;
        
        if (targetUsername) {
            // Reset in-memory stats
            if (targetUsername === this.currentUsername) {
                this.totalBetAmount = 0;
                this.totalWinAmount = 0;
                this.totalSpins = 0;
                this.consecutiveLosses = 0;
                this.spinsSinceLastWin = 0;
                this.currentRTP = 100.0;
            }
            
            // Clear user logs
            const gameLogs = JSON.parse(localStorage.getItem('gameLogs') || '[]');
            const filteredLogs = gameLogs.filter(log => log.username !== targetUsername);
            localStorage.setItem('gameLogs', JSON.stringify(filteredLogs));
            
            console.log(`Reset statistics for ${targetUsername}`);
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
            totalBetAmount: this.totalBetAmount,
            totalWinAmount: this.totalWinAmount,
            spinsSinceLastWin: this.spinsSinceLastWin,
            forceLossSpins: this.forceLossSpins
        };
    }
}