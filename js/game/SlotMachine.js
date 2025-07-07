// SlotMachine.js - Implementasi lengkap SlotMachine

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
        
        // Admin mode settings
        this.adminSettings = null;
        this.nextForcedResult = null;
        
        // Username untuk admin tracking
        this.currentUsername = null;
        
        // Container element
        this.container = null;
        
        // Inisialisasi komponen
        this.init();
        
        // Set global reference untuk akses dari Symbol class
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
        
        // Load pengaturan admin
        this.loadAdminSettings();
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
                forceWinAfterSpins: 10
            };
        }
    }
    
    // Set username untuk pelacakan admin
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
    
    // Mulai spin
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
        
        // Kurangi saldo
        this.updateBalance(-this.bet);
        
        // Update progressive jackpot
        this.updateProgressiveJackpot();
        
        // Callback spin start
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // Tentukan hasil spin
        const result = this.determineSpinResult();
        
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
        
        // Handle kemenangan
        if (spinResult.totalWin > 0) {
            this.handleWin(spinResult);
        } else {
            this.consecutiveLosses++;
        }
        
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
    
    // Tentukan hasil spin (normal atau forced)
    determineSpinResult() {
        // Cek admin forced result
        if (this.nextForcedResult) {
            const result = this.nextForcedResult;
            this.nextForcedResult = null;
            return { forced: true, symbols: result };
        }
        
        // Cek admin settings untuk forced win
        if (this.adminSettings.forceWinEnabled && 
            this.consecutiveLosses >= this.adminSettings.forceWinAfterSpins) {
            return this.generateForcedWin();
        }
        
        // Random chance berdasarkan frequency setting
        const winChance = this.adminSettings.winFrequency / 100;
        if (Math.random() < winChance) {
            return this.generateForcedWin();
        }
        
        return { forced: false };
    }
    
    // Generate forced win
    generateForcedWin() {
        const winAmount = this.adminSettings.defaultWinAmount;
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
        
        return { forced: true, symbols };
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
                if (reel < 3 && row === 1) { // Middle row, first 3 reels
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
                    amount: calculateMixedBarPayout(3, this.bet),
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
    
    // Get game statistics
    getStatistics() {
        return {
            totalSpins: this.totalSpins,
            balance: this.balance,
            lastWin: this.lastWin,
            consecutiveLosses: this.consecutiveLosses,
            progressiveJackpot: this.progressiveJackpot
        };
    }
}