// Enhanced RTP Management System
// File: js/game/RTPManager.js

class RTPManager {
    constructor() {
        this.defaultRTP = 95.5;
        this.userRTPSettings = this.loadUserRTPSettings();
        this.userStats = this.loadUserStats();
        this.adminSettings = this.loadAdminSettings();
    }
    
    // Load user-specific RTP settings
    loadUserRTPSettings() {
        return JSON.parse(localStorage.getItem('userRTPSettings') || '{}');
    }
    
    // Load user statistics
    loadUserStats() {
        return JSON.parse(localStorage.getItem('userStats') || '{}');
    }
    
    // Load admin settings
    loadAdminSettings() {
        return JSON.parse(localStorage.getItem('adminSettings') || JSON.stringify({
            forceWinEnabled: false,
            winFrequency: 30,
            defaultWinAmount: 'medium',
            forceWinAfterSpins: 10,
            rtpControlEnabled: true,
            minimumSpinsBeforeWin: 5,
            maxConsecutiveLosses: 20
        }));
    }
    
    // Save user RTP settings
    saveUserRTPSettings() {
        localStorage.setItem('userRTPSettings', JSON.stringify(this.userRTPSettings));
    }
    
    // Save user statistics
    saveUserStats() {
        localStorage.setItem('userStats', JSON.stringify(this.userStats));
    }
    
    // Save admin settings
    saveAdminSettings() {
        localStorage.setItem('adminSettings', JSON.stringify(this.adminSettings));
    }
    
    // Set RTP for specific user
    setUserRTP(username, rtp, nextSpinResult = null) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].customRTP = Math.max(0, Math.min(99, rtp));
        this.userRTPSettings[username].nextSpinResult = nextSpinResult;
        this.userRTPSettings[username].lastUpdated = new Date().toISOString();
        
        this.saveUserRTPSettings();
        
        console.log(`RTP set for ${username}: ${rtp}%`);
    }
    
    // Get effective RTP for user
    getUserRTP(username) {
        const userSettings = this.userRTPSettings[username];
        if (userSettings && userSettings.customRTP !== undefined) {
            return userSettings.customRTP;
        }
        return this.defaultRTP;
    }
    
    // Initialize user stats if not exists
    initializeUserStats(username) {
        if (!this.userStats[username]) {
            this.userStats[username] = {
                totalSpins: 0,
                totalBets: 0,
                totalWins: 0,
                consecutiveLosses: 0,
                actualRTP: 0,
                lastSpinTime: null,
                winHistory: [],
                forceNoWinUntilSpin: 0,
                isBlacklisted: false
            };
        }
    }
    
    // Update user statistics after spin
    updateUserStats(username, bet, win, isWin) {
        this.initializeUserStats(username);
        
        const stats = this.userStats[username];
        stats.totalSpins++;
        stats.totalBets += bet;
        stats.totalWins += win;
        stats.lastSpinTime = new Date().toISOString();
        
        if (isWin) {
            stats.consecutiveLosses = 0;
        } else {
            stats.consecutiveLosses++;
        }
        
        // Calculate actual RTP
        stats.actualRTP = stats.totalBets > 0 ? (stats.totalWins / stats.totalBets) * 100 : 0;
        
        // Keep win history (last 100 spins)
        stats.winHistory.push({
            spin: stats.totalSpins,
            bet: bet,
            win: win,
            time: stats.lastSpinTime
        });
        
        if (stats.winHistory.length > 100) {
            stats.winHistory = stats.winHistory.slice(-100);
        }
        
        this.saveUserStats();
    }
    
    // Set user to never win until certain spin
    setNoWinUntilSpin(username, spinCount) {
        this.initializeUserStats(username);
        this.userStats[username].forceNoWinUntilSpin = this.userStats[username].totalSpins + spinCount;
        this.saveUserStats();
        
        console.log(`${username} will not win for next ${spinCount} spins`);
    }
    
    // Blacklist user (never wins)
    setUserBlacklist(username, isBlacklisted) {
        this.initializeUserStats(username);
        this.userStats[username].isBlacklisted = isBlacklisted;
        this.saveUserStats();
        
        console.log(`${username} blacklist status: ${isBlacklisted}`);
    }
    
    // Check if user should win based on RTP and admin settings
    shouldUserWin(username, bet) {
        this.initializeUserStats(username);
        
        const stats = this.userStats[username];
        const userRTP = this.getUserRTP(username);
        const userSettings = this.userRTPSettings[username] || {};
        
        // Check blacklist
        if (stats.isBlacklisted) {
            console.log(`${username} is blacklisted - no win`);
            return { shouldWin: false, reason: 'blacklisted' };
        }
        
        // Check force no win until spin
        if (stats.totalSpins < stats.forceNoWinUntilSpin) {
            console.log(`${username} in no-win period until spin ${stats.forceNoWinUntilSpin}`);
            return { shouldWin: false, reason: 'no_win_period' };
        }
        
        // Check if there's a forced next spin result
        if (userSettings.nextSpinResult) {
            const result = userSettings.nextSpinResult;
            // Clear the forced result after using it
            this.userRTPSettings[username].nextSpinResult = null;
            this.saveUserRTPSettings();
            
            console.log(`${username} has forced result: ${result}`);
            return { shouldWin: result !== 'lose', reason: 'forced', type: result };
        }
        
        // Admin force win settings
        if (this.adminSettings.forceWinEnabled) {
            if (stats.consecutiveLosses >= this.adminSettings.forceWinAfterSpins) {
                console.log(`${username} forced win after ${stats.consecutiveLosses} losses`);
                return { 
                    shouldWin: true, 
                    reason: 'forced_after_losses',
                    type: this.adminSettings.defaultWinAmount 
                };
            }
        }
        
        // RTP-based calculation
        const targetRTP = userRTP / 100;
        const currentRTP = stats.actualRTP / 100;
        const rtpDifference = targetRTP - currentRTP;
        
        // Calculate win probability based on RTP difference
        let winProbability = 0.15; // Base 15% win chance
        
        if (rtpDifference > 0.1) {
            // Far below target RTP, increase win chance significantly
            winProbability = 0.6;
        } else if (rtpDifference > 0.05) {
            // Below target RTP, increase win chance
            winProbability = 0.4;
        } else if (rtpDifference > 0.02) {
            // Slightly below target RTP
            winProbability = 0.25;
        } else if (rtpDifference < -0.05) {
            // Above target RTP, decrease win chance
            winProbability = 0.05;
        } else if (rtpDifference < -0.02) {
            // Slightly above target RTP
            winProbability = 0.1;
        }
        
        // Apply admin win frequency
        if (this.adminSettings.rtpControlEnabled) {
            const adminFrequency = this.adminSettings.winFrequency / 100;
            winProbability = (winProbability + adminFrequency) / 2;
        }
        
        // Minimum spins before win (prevent immediate wins)
        if (stats.totalSpins < this.adminSettings.minimumSpinsBeforeWin) {
            winProbability = 0;
        }
        
        // Maximum consecutive losses safety
        if (stats.consecutiveLosses >= this.adminSettings.maxConsecutiveLosses) {
            winProbability = 0.8; // Force high win chance
        }
        
        // RTP adjustment for very low RTP settings
        if (userRTP < 50) {
            winProbability *= 0.3; // Very low win chance for very low RTP
        } else if (userRTP < 70) {
            winProbability *= 0.5; // Low win chance for low RTP
        } else if (userRTP < 85) {
            winProbability *= 0.7; // Reduced win chance for below average RTP
        }
        
        const shouldWin = Math.random() < winProbability;
        
        console.log(`${username} - RTP: ${userRTP}%, Current: ${currentRTP.toFixed(3)}, Diff: ${rtpDifference.toFixed(3)}, Win Prob: ${(winProbability*100).toFixed(1)}%, Result: ${shouldWin}`);
        
        return { 
            shouldWin, 
            reason: 'rtp_calculation',
            winProbability,
            rtpDifference,
            currentRTP: stats.actualRTP
        };
    }
    
    // Determine win amount based on RTP and settings
    determineWinAmount(username, bet, winType = null) {
        const userRTP = this.getUserRTP(username);
        const stats = this.userStats[username];
        
        let multiplier = 1;
        
        // Base multiplier based on win type or random
        if (winType) {
            switch (winType) {
                case 'small':
                case 'win-small':
                    multiplier = 1.5 + Math.random() * 1; // 1.5x - 2.5x
                    break;
                case 'medium':
                case 'win-medium':
                    multiplier = 3 + Math.random() * 2; // 3x - 5x
                    break;
                case 'large':
                case 'win-large':
                    multiplier = 6 + Math.random() * 4; // 6x - 10x
                    break;
                case 'jackpot':
                    multiplier = 20 + Math.random() * 30; // 20x - 50x
                    break;
                default:
                    multiplier = 1.5 + Math.random() * 3; // 1.5x - 4.5x
            }
        } else {
            // Random multiplier based on RTP
            if (userRTP < 50) {
                multiplier = 1.2 + Math.random() * 0.8; // Very small wins for very low RTP
            } else if (userRTP < 70) {
                multiplier = 1.5 + Math.random() * 1.5; // Small wins for low RTP
            } else if (userRTP < 85) {
                multiplier = 2 + Math.random() * 2; // Medium wins for below average RTP
            } else {
                multiplier = 2 + Math.random() * 4; // Normal wins for normal RTP
            }
        }
        
        // Adjust multiplier based on consecutive losses (pity timer)
        if (stats.consecutiveLosses > 15) {
            multiplier *= 1.5; // Bigger wins after many losses
        } else if (stats.consecutiveLosses > 10) {
            multiplier *= 1.2;
        }
        
        // Adjust multiplier to prevent RTP from going too high
        const targetRTP = userRTP / 100;
        const currentRTP = stats.actualRTP / 100;
        
        if (currentRTP > targetRTP + 0.1) {
            multiplier *= 0.7; // Smaller wins if way above target RTP
        } else if (currentRTP > targetRTP + 0.05) {
            multiplier *= 0.85; // Slightly smaller wins if above target RTP
        }
        
        return Math.floor(bet * multiplier);
    }
    
    // Get user statistics for admin panel
    getUserStatistics(username) {
        this.initializeUserStats(username);
        return {
            ...this.userStats[username],
            customRTP: this.getUserRTP(username),
            settings: this.userRTPSettings[username] || {}
        };
    }
    
    // Get all users statistics
    getAllUsersStatistics() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const stats = {};
        
        users.forEach(user => {
            if (user.role === 'user') {
                stats[user.username] = this.getUserStatistics(user.username);
            }
        });
        
        return stats;
    }
    
    // Admin function: Force user result for next spin
    forceUserNextSpin(username, result) {
        if (!this.userRTPSettings[username]) {
            this.userRTPSettings[username] = {};
        }
        
        this.userRTPSettings[username].nextSpinResult = result;
        this.saveUserRTPSettings();
        
        console.log(`Forced next spin for ${username}: ${result}`);
    }
    
    // Admin function: Reset user statistics
    resetUserStats(username) {
        delete this.userStats[username];
        delete this.userRTPSettings[username];
        this.saveUserStats();
        this.saveUserRTPSettings();
        
        console.log(`Reset stats for ${username}`);
    }
    
    // Calculate global RTP statistics
    getGlobalStatistics() {
        const allStats = this.getAllUsersStatistics();
        let totalBets = 0;
        let totalWins = 0;
        let totalSpins = 0;
        let activeUsers = 0;
        
        Object.values(allStats).forEach(stat => {
            totalBets += stat.totalBets || 0;
            totalWins += stat.totalWins || 0;
            totalSpins += stat.totalSpins || 0;
            if (stat.totalSpins > 0) activeUsers++;
        });
        
        return {
            globalRTP: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
            totalBets,
            totalWins,
            totalSpins,
            activeUsers,
            houseEdge: totalBets - totalWins
        };
    }
}

// Enhanced SlotMachine integration with RTP system
class EnhancedSlotMachine extends SlotMachine {
    constructor(config) {
        super(config);
        this.rtpManager = new RTPManager();
    }
    
    // Override spin method to include RTP logic
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
        
        // Kurangi saldo
        this.updateBalance(-this.bet);
        
        // Update progressive jackpot
        this.updateProgressiveJackpot();
        
        // Callback spin start
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // RTP-based result determination
        const winDecision = this.rtpManager.shouldUserWin(this.currentUsername, this.bet);
        console.log('Win decision:', winDecision);
        
        let result;
        if (winDecision.shouldWin) {
            // Generate winning result
            result = this.generateWinningResult(winDecision.type);
        } else {
            // Generate losing result
            result = this.generateLosingResult();
        }
        
        // Set hasil pada reels
        this.setForcedResult(result.symbols);
        
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
        
        // Apply RTP-determined win amount if needed
        if (winDecision.shouldWin && spinResult.totalWin === 0) {
            // Force win amount based on RTP
            spinResult.totalWin = this.rtpManager.determineWinAmount(
                this.currentUsername, 
                this.bet, 
                winDecision.type
            );
            spinResult.wins = [{
                line: 1,
                symbols: result.symbols[0] || [],
                amount: spinResult.totalWin,
                count: 3,
                positions: [5, 6, 7]
            }];
        }
        
        // Update RTP statistics
        this.rtpManager.updateUserStats(
            this.currentUsername,
            this.bet,
            spinResult.totalWin,
            spinResult.totalWin > 0
        );
        
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
    
    // Generate winning result based on type
    generateWinningResult(winType) {
        const symbols = [];
        
        // Generate symbols for each reel based on win type
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                if (reel < 3 && row === 1) { // Middle row, first 3 reels
                    // Place winning symbols
                    switch (winType) {
                        case 'small':
                        case 'win-small':
                            reelSymbols.push(this.symbolManager.getSymbol('cherry').clone());
                            break;
                        case 'medium':
                        case 'win-medium':
                            reelSymbols.push(this.symbolManager.getSymbol('bar_single').clone());
                            break;
                        case 'large':
                        case 'win-large':
                            reelSymbols.push(this.symbolManager.getSymbol('bar_triple').clone());
                            break;
                        case 'jackpot':
                            reelSymbols.push(this.symbolManager.getSymbol('seven').clone());
                            break;
                        default:
                            reelSymbols.push(this.symbolManager.getRandomBarSymbol());
                    }
                } else {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                }
            }
            symbols.push(reelSymbols);
        }
        
        return { symbols, forced: true };
    }
    
    // Generate losing result
    generateLosingResult() {
        const symbols = [];
        
        for (let reel = 0; reel < this.reelsCount; reel++) {
            const reelSymbols = [];
            for (let row = 0; row < this.rowsCount; row++) {
                // Ensure no winning combinations
                if (reel === 0 || reel === 1) {
                    reelSymbols.push(this.symbolManager.getRandomSymbol());
                } else {
                    // Make sure middle row doesn't match first two reels
                    const excludeIds = reel === 2 && row === 1 ? 
                        [symbols[0][1].id, symbols[1][1].id] : [];
                    reelSymbols.push(this.symbolManager.getRandomSymbolExcept(excludeIds));
                }
            }
            symbols.push(reelSymbols);
        }
        
        return { symbols, forced: true };
    }
    
    // Get RTP statistics for current user
    getUserRTPStats() {
        return this.rtpManager.getUserStatistics(this.currentUsername);
    }
    
    // Admin method to set user RTP
    setUserRTP(username, rtp, nextSpinResult = null) {
        this.rtpManager.setUserRTP(username, rtp, nextSpinResult);
    }
    
    // Admin method to force no wins
    setUserNoWinPeriod(username, spins) {
        this.rtpManager.setNoWinUntilSpin(username, spins);
    }
    
    // Admin method to blacklist user
    blacklistUser(username, isBlacklisted = true) {
        this.rtpManager.setUserBlacklist(username, isBlacklisted);
    }
}

// Export for global use
window.RTPManager = RTPManager;
window.EnhancedSlotMachine = EnhancedSlotMachine;