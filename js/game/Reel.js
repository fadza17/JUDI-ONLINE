// Reel.js - Kelas untuk mengelola gulungan (reel) pada mesin slot

class Reel {
    constructor(id, symbolManager, config = {}) {
        this.id = id;
        this.symbolManager = symbolManager;
        this.symbols = [];
        this.visibleRows = config.rows || 3;
        this.totalSymbols = config.totalSymbols || 20; // Total simbol yang disimpan di memori
        this.spinDuration = config.spinDuration || 3000;
        this.element = null;
        this.symbolElements = [];
        this.spinning = false;
        this.spinCompleteCallback = null;
        
        // Membuat deretan awal simbol-simbol acak
        this.initSymbols();
    }
    
    // Mengisi gulungan dengan simbol acak
    initSymbols() {
        this.symbols = [];
        for (let i = 0; i < this.totalSymbols; i++) {
            this.symbols.push(this.symbolManager.getRandomSymbol());
        }
    }
    
    // Merender gulungan ke DOM
    renderTo(element) {
        this.element = element;
        element.innerHTML = ''; // Bersihkan konten sebelumnya
        this.symbolElements = [];
        
        // Tambahkan simbol yang terlihat di viewport
        for (let i = 0; i < this.visibleRows; i++) {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'symbol';
            element.appendChild(symbolElement);
            this.symbolElements.push(symbolElement);
            
            // Render simbol ke elemen
            this.symbols[i].renderTo(symbolElement);
        }
        
        return element;
    }
    
    // Mulai spin
    spin(callback) {
        if (this.spinning) return;
        
        this.spinning = true;
        this.spinCompleteCallback = callback;
        
        // Generate simbol-simbol baru untuk hasil akhir
        this.generateNewSymbols();
        
        // Mulai animasi spin
        this.animateSpin();
    }
    
    // Generate simbol-simbol baru untuk hasil spin
    generateNewSymbols() {
        // Tambahkan simbol baru ke bagian bawah
        for (let i = 0; i < this.visibleRows; i++) {
            this.symbols.push(this.symbolManager.getRandomSymbol());
        }
    }
    
    // Ganti simbol tertentu dengan simbol yang diberikan (untuk cheat/admin mode)
    setSymbolAt(index, symbol) {
        // Pastikan index valid
        if (index >= 0 && index < this.symbols.length) {
            this.symbols[this.totalSymbols - this.visibleRows + index] = symbol;
        }
    }
    
    // Animasi spin
    animateSpin() {
        const reelElement = this.element;
        const spinDuration = this.spinDuration + (this.id * 200); // Stagger offset
        const totalDistance = this.totalSymbols * 100; // 100% adalah height dari satu simbol
        
        // Setup untuk CSS animation
        reelElement.style.transition = `transform ${spinDuration}ms cubic-bezier(0.5, 0, 0.5, 1)`;
        reelElement.style.transform = `translateY(-${totalDistance}%)`;
        
        // Handle animasi selesai
        const onAnimationComplete = () => {
            reelElement.style.transition = 'none';
            reelElement.style.transform = 'translateY(0)';
            
            // Hilangkan simbol-simbol lama dan rerender
            this.symbols = this.symbols.slice(-this.totalSymbols);
            this.renderTo(reelElement);
            
            // Reset state
            this.spinning = false;
            
            // Panggil callback kalau ada
            if (typeof this.spinCompleteCallback === 'function') {
                this.spinCompleteCallback(this.id, this.getVisibleSymbols());
            }
            
            // Remove event listener
            reelElement.removeEventListener('transitionend', onAnimationComplete);
        };
        
        reelElement.addEventListener('transitionend', onAnimationComplete);
    }
    
    // Dapatkan simbol-simbol yang terlihat (hasil)
    getVisibleSymbols() {
        const startIndex = this.totalSymbols - this.visibleRows;
        return this.symbols.slice(startIndex, startIndex + this.visibleRows);
    }
    
    // Highlight simbol pada posisi tertentu
    highlightSymbolAt(rowIndex, highlight = true) {
        if (rowIndex >= 0 && rowIndex < this.visibleRows && this.symbolElements[rowIndex]) {
            const symbolIndex = this.totalSymbols - this.visibleRows + rowIndex;
            if (this.symbols[symbolIndex]) {
                this.symbols[symbolIndex].highlight(highlight);
            }
        }
    }
    
    // Paksa hasil tertentu (untuk admin mode)
    forceResult(symbols) {
        if (!Array.isArray(symbols) || symbols.length !== this.visibleRows) {
            console.error('Invalid symbols array for force result');
            return;
        }
        
        // Set simbol pada posisi yang akan jadi hasil
        const startIndex = this.totalSymbols - this.visibleRows;
        for (let i = 0; i < symbols.length; i++) {
            this.symbols[startIndex + i] = symbols[i];
        }
    }
}