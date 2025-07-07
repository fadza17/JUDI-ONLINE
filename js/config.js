// config.js - Konfigurasi yang diperbarui dengan asset baru

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
    
    // Konfigurasi reel dengan simbol baru
    reels: {
        count: 5,
        rows: 3,
        symbols: [
            {
                id: 'seven',
                name: 'Seven',
                // Menggunakan gambar seven yang Anda berikan
                image: 'assets/images/symbols/seven.png',
                // Fallback SVG untuk seven
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='8'/%3E%3Cpath d='M20 45 L35 20 L45 20 L45 25 L38 25 L25 45 Z' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E`,
                payouts: [0, 0, 50, 200, 1000],
                frequency: 15,
                isSpecial: true
            },
            {
                id: 'bar_triple',
                name: 'Triple BAR',
                // Menggunakan gambar triple BAR
                image: 'assets/images/symbols/bar_triple.png',
                // Fallback SVG untuk triple BAR
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='12' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='21' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='40' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='49' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 150, 500, 2500],
                frequency: 8,
                isWild: true
            },
            {
                id: 'bar_double',
                name: 'Double BAR',
                // Menggunakan gambar double BAR
                image: 'assets/images/symbols/bar_double.png',
                // Fallback SVG untuk double BAR
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='18' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='27' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3Crect x='8' y='34' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='43' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 100, 300, 1500],
                frequency: 12,
                isScatter: true
            },
            {
                id: 'bar_single',
                name: 'Single BAR',
                // Menggunakan gambar single BAR
                image: 'assets/images/symbols/bar_single.png',
                // Fallback SVG untuk single BAR
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Crect x='8' y='26' width='48' height='12' fill='%23FFD700' stroke='%23000' stroke-width='1' rx='2'/%3E%3Ctext x='32' y='35' font-family='Arial Black' font-size='8' fill='%23000' text-anchor='middle'%3EBAR%3C/text%3E%3C/svg%3E`,
                payouts: [0, 0, 50, 150, 750],
                frequency: 20
            },
            {
                id: 'cherry',
                name: 'Cherry',
                // Menggunakan gambar cherry yang Anda berikan
                image: 'assets/images/symbols/cherry.png',
                // Fallback SVG untuk cherry
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000' rx='4'/%3E%3Ccircle cx='24' cy='35' r='12' fill='%23DC143C'/%3E%3Ccircle cx='40' cy='42' r='10' fill='%23DC143C'/%3E%3Cpath d='M24 23 Q26 15 30 12' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M40 32 Q38 24 34 21' fill='none' stroke='%23228B22' stroke-width='2'/%3E%3Cpath d='M30 12 L32 10 L28 8 L30 12' fill='%23228B22'/%3E%3Cpath d='M34 21 L36 19 L32 17 L34 21' fill='%23228B22'/%3E%3C/svg%3E`,
                payouts: [0, 0, 30, 100, 500],
                frequency: 25,
                isBonus: true
            },
            {
                id: 'blank',
                name: 'Blank',
                // Simbol kosong
                image: 'assets/images/symbols/blank.png',
                fallbackSvg: `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23222' rx='4'/%3E%3C/svg%3E`,
                payouts: [0, 0, 0, 0, 0],
                frequency: 20
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
    
    // Pengaturan RTP yang disesuaikan
    baseRTP: 95.5,
    
    // Pengaturan jackpot untuk kombinasi seven
    jackpot: {
        basePayout: 10000, // Jackpot dasar
        multiplier: 100,   // Multiplier untuk 5 seven
        progressiveRate: 0.01 // 1% dari setiap taruhan masuk ke progressive pot
    },
    
    // Mode admin
    admin: {
        forceWinEnabled: false,
        winFrequency: 30,
        defaultWinAmount: 'medium',
        forceWinAfterSpins: 10
    },
    
    // Konfigurasi suara
    sounds: {
        spin: 'assets/sounds/spin.mp3',
        win: 'assets/sounds/win.mp3',
        jackpot: 'assets/sounds/jackpot.mp3',
        backgroundMusic: 'assets/sounds/background-music.mp3'
    },
    
    // Tema visual yang disesuaikan dengan asset
    theme: {
        primaryColor: '#FFD700', // Gold untuk BAR
        secondaryColor: '#DC143C', // Red untuk Cherry
        accentColor: '#FFFFFF',   // White untuk Seven
        backgroundColor: '#1a1a1a' // Dark background
    }
};

// Fungsi khusus untuk menangani asset baru
function initializeSymbolAssets() {
    // Preload semua gambar simbol
    CONFIG.reels.symbols.forEach(symbol => {
        const img = new Image();
        img.onerror = function() {
            // Jika gambar gagal dimuat, gunakan fallback SVG
            console.log(`Using fallback for symbol: ${symbol.id}`);
            symbol.image = symbol.fallbackSvg;
        };
        img.src = symbol.image;
    });
}

// Fungsi untuk mendapatkan kombinasi BAR campuran
function isMixedBarWin(symbols) {
    const barTypes = ['bar_single', 'bar_double', 'bar_triple'];
    return symbols.every(symbol => barTypes.includes(symbol.id));
}

// Fungsi untuk menghitung kemenangan khusus (Any BAR combination)
function calculateMixedBarPayout(count, bet) {
    const mixedBarPayouts = {
        3: 25,  // 3 BAR campuran
        4: 75,  // 4 BAR campuran
        5: 200  // 5 BAR campuran
    };
    return (mixedBarPayouts[count] || 0) * bet;
}

// Fungsi untuk efek visual khusus
function getSymbolEffects(symbolId) {
    const effects = {
        'seven': {
            glow: '#FFFFFF',
            sparkle: true,
            sound: 'jackpot'
        },
        'bar_triple': {
            glow: '#FFD700',
            flash: true,
            sound: 'win'
        },
        'cherry': {
            glow: '#DC143C',
            bounce: true,
            sound: 'win'
        }
    };
    return effects[symbolId] || {};
}

// Inisialisasi asset saat DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeSymbolAssets);
}

// Ekspor fungsi tambahan
window.isMixedBarWin = isMixedBarWin;
window.calculateMixedBarPayout = calculateMixedBarPayout;
window.getSymbolEffects = getSymbolEffects;