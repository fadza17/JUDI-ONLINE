// Symbol.js - Kelas Symbol yang diperbarui untuk asset baru

class Symbol {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.image = config.image;
        this.fallbackSvg = config.fallbackSvg;
        this.payouts = config.payouts || [0, 0, 0, 0, 0];
        this.frequency = config.frequency || 1;
        this.isWild = config.isWild || false;
        this.isScatter = config.isScatter || false;
        this.isSpecial = config.isSpecial || false;
        this.isBonus = config.isBonus || false;
        
        // Preload image dengan fallback
        this.imageObj = new Image();
        this.imageLoaded = false;
        this.setupImageLoading();
        
        // Flag untuk track apakah simbol sedang aktif/disorot
        this.highlighted = false;
        
        // Element DOM (akan diset saat simbol ditampilkan)
        this.element = null;
        
        // Efek visual khusus
        this.effects = this.getEffects();
    }
    
    // Setup loading gambar dengan fallback
    setupImageLoading() {
        this.imageObj.onload = () => {
            this.imageLoaded = true;
            if (this.element) {
                this.updateElementImage();
            }
        };
        
        this.imageObj.onerror = () => {
            console.log(`Failed to load image for ${this.id}, using fallback`);
            this.image = this.fallbackSvg;
            this.imageLoaded = true;
            if (this.element) {
                this.updateElementImage();
            }
        };
        
        this.imageObj.src = this.image;
    }
    
    // Update gambar pada element
    updateElementImage() {
        if (this.element) {
            this.element.style.backgroundImage = `url(${this.image})`;
            this.element.style.backgroundSize = 'contain';
            this.element.style.backgroundRepeat = 'no-repeat';
            this.element.style.backgroundPosition = 'center';
        }
    }
    
    // Mendapatkan efek visual berdasarkan jenis simbol
    getEffects() {
        switch(this.id) {
            case 'seven':
                return {
                    glow: '#FFFFFF',
                    glowIntensity: '0 0 20px #FFFFFF',
                    sparkle: true,
                    animationClass: 'seven-sparkle'
                };
            case 'bar_triple':
                return {
                    glow: '#FFD700',
                    glowIntensity: '0 0 15px #FFD700',
                    flash: true,
                    animationClass: 'bar-flash'
                };
            case 'bar_double':
                return {
                    glow: '#FFD700',
                    glowIntensity: '0 0 12px #FFD700',
                    pulse: true,
                    animationClass: 'bar-pulse'
                };
            case 'bar_single':
                return {
                    glow: '#FFD700',
                    glowIntensity: '0 0 8px #FFD700',
                    animationClass: 'bar-glow'
                };
            case 'cherry':
                return {
                    glow: '#DC143C',
                    glowIntensity: '0 0 10px #DC143C',
                    bounce: true,
                    animationClass: 'cherry-bounce'
                };
            default:
                return {
                    glow: '#666666',
                    glowIntensity: '0 0 5px #666666'
                };
        }
    }
    
    // Mendapatkan nilai kemenangan berdasarkan jumlah simbol yang match
    getPayoutForCount(count) {
        if (count <= 0 || count > this.payouts.length) {
            return 0;
        }
        return this.payouts[count - 1];
    }
    
    // Cek apakah simbol adalah jenis BAR
    isBarType() {
        return this.id.startsWith('bar_');
    }
    
    // Menampilkan simbol pada element DOM
    renderTo(element) {
        this.element = element;
        element.setAttribute('data-symbol', this.id);
        element.classList.add('symbol');
        element.classList.add(`symbol-${this.id}`);
        
        // Set background image
        this.updateElementImage();
        
        // Tambahkan efek CSS khusus
        if (this.effects.glow) {
            element.style.setProperty('--symbol-glow-color', this.effects.glow);
        }
        
        // Reset state
        this.highlight(false);
        
        return element;
    }
    
    // Highlight simbol dengan efek khusus
    highlight(active = true) {
        this.highlighted = active;
        
        if (this.element) {
            if (active) {
                this.element.classList.add('highlight');
                
                // Tambahkan efek khusus berdasarkan jenis simbol
                if (this.effects.animationClass) {
                    this.element.classList.add(this.effects.animationClass);
                }
                
                // Set box shadow untuk efek glow
                if (this.effects.glowIntensity) {
                    this.element.style.boxShadow = this.effects.glowIntensity;
                }
                
                // Efek suara
                this.playWinSound();
                
            } else {
                this.element.classList.remove('highlight');
                
                // Hapus semua efek animasi
                if (this.effects.animationClass) {
                    this.element.classList.remove(this.effects.animationClass);
                }
                
                // Reset box shadow
                this.element.style.boxShadow = '';
            }
        }
    }
    
    // Play sound effect untuk simbol
    playWinSound() {
        if (typeof window !== 'undefined' && window.slotMachine && window.slotMachine.soundEnabled) {
            let soundType = 'win';
            
            if (this.id === 'seven') {
                soundType = 'jackpot';
            } else if (this.isBarType()) {
                soundType = 'win';
            }
            
            // Play sound jika ada instance SlotMachine
            if (window.slotMachine.playSound) {
                window.slotMachine.playSound(soundType);
            }
        }
    }
    
    // Animasi khusus untuk kemenangan besar
    celebrateWin(winAmount) {
        if (!this.element) return;
        
        // Buat elemen untuk menampilkan jumlah kemenangan
        const winDisplay = document.createElement('div');
        winDisplay.className = 'win-amount-display';
        winDisplay.textContent = `+${winAmount.toLocaleString()}`;
        winDisplay.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            color: ${this.effects.glow};
            font-weight: bold;
            font-size: 14px;
            z-index: 100;
            pointer-events: none;
            animation: winAmountFloat 2s ease-out forwards;
        `;
        
        this.element.style.position = 'relative';
        this.element.appendChild(winDisplay);
        
        // Hapus elemen setelah animasi selesai
        setTimeout(() => {
            if (winDisplay.parentNode) {
                winDisplay.parentNode.removeChild(winDisplay);
            }
        }, 2000);
    }
    
    // Clone simbol (untuk membuat instance baru)
    clone() {
        return new Symbol({
            id: this.id,
            name: this.name,
            image: this.image,
            fallbackSvg: this.fallbackSvg,
            payouts: [...this.payouts],
            frequency: this.frequency,
            isWild: this.isWild,
            isScatter: this.isScatter,
            isSpecial: this.isSpecial,
            isBonus: this.isBonus
        });
    }
}

// Manajer simbol yang diperbarui
class SymbolManager {
    constructor(symbolConfigs) {
        this.symbols = {};
        this.symbolsArray = [];
        this.barSymbols = [];
        
        // Initialize simbol-simbol dari konfigurasi
        symbolConfigs.forEach(config => {
            const symbol = new Symbol(config);
            this.symbols[config.id] = symbol;
            
            // Kelompokkan simbol BAR
            if (symbol.isBarType()) {
                this.barSymbols.push(symbol);
            }
            
            // Tambahkan simbol ke array berdasarkan frekuensinya
            for (let i = 0; i < symbol.frequency; i++) {
                this.symbolsArray.push(symbol);
            }
        });
        
        // Setup CSS animations
        this.setupAnimations();
    }
    
    // Setup CSS animations untuk efek simbol
    setupAnimations() {
        if (typeof document === 'undefined') return;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes seven-sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(5deg); }
                50% { transform: scale(1.2) rotate(-5deg); }
                75% { transform: scale(1.1) rotate(5deg); }
            }
            
            @keyframes bar-flash {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes bar-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes bar-glow {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.2); }
            }
            
            @keyframes cherry-bounce {
                0%, 100% { transform: translateY(0); }
                25% { transform: translateY(-5px); }
                75% { transform: translateY(-2px); }
            }
            
            @keyframes winAmountFloat {
                0% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-30px);
                }
            }
            
            .symbol.highlight {
                transition: all 0.3s ease;
                z-index: 10;
            }
            
            .symbol-seven.highlight {
                animation: seven-sparkle 1s infinite;
            }
            
            .symbol-bar_triple.highlight {
                animation: bar-flash 0.5s infinite;
            }
            
            .symbol-bar_double.highlight {
                animation: bar-pulse 1s infinite;
            }
            
            .symbol-bar_single.highlight {
                animation: bar-glow 1.5s infinite;
            }
            
            .symbol-cherry.highlight {
                animation: cherry-bounce 0.8s infinite;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Mendapatkan simbol berdasarkan ID
    getSymbol(id) {
        return this.symbols[id];
    }
    
    // Mendapatkan simbol secara acak berdasarkan bobot/frekuensi
    getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * this.symbolsArray.length);
        return this.symbolsArray[randomIndex].clone();
    }
    
    // Mendapatkan simbol BAR acak
    getRandomBarSymbol() {
        if (this.barSymbols.length === 0) return this.getRandomSymbol();
        
        const randomIndex = Math.floor(Math.random() * this.barSymbols.length);
        return this.barSymbols[randomIndex].clone();
    }
    
    // Mendapatkan simbol acak kecuali yang dikecualikan
    getRandomSymbolExcept(excludedIds) {
        const filteredSymbols = this.symbolsArray.filter(symbol => !excludedIds.includes(symbol.id));
        if (filteredSymbols.length === 0) {
            return this.getRandomSymbol();
        }
        
        const randomIndex = Math.floor(Math.random() * filteredSymbols.length);
        return filteredSymbols[randomIndex].clone();
    }
    
    // Cek apakah kombinasi adalah campuran BAR
    isMixedBarCombination(symbols) {
        return symbols.every(symbol => symbol.isBarType()) && 
               new Set(symbols.map(s => s.id)).size > 1;
    }
    
    // Dapatkan semua simbol BAR
    getAllBarSymbols() {
        return Object.values(this.symbols).filter(symbol => symbol.isBarType());
    }
}