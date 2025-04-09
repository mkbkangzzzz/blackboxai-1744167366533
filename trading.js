import { derivConfig } from './deriv-api.js';

// Trading variables
let currentChart = null;
let selectedPair = null;
let isBoomMode = false;
let currentBoomMarket = null;

// Initialize TradingView Lightweight Chart
function initTradingChart() {
    const chartContainer = document.getElementById('tv-chart');
    if (!chartContainer) return;

    currentChart = LightweightCharts.createChart(chartContainer, {
        layout: {
            backgroundColor: '#1e293b',
            textColor: '#d1d5db',
        },
        grid: {
            vertLines: {
                color: '#334155',
            },
            horzLines: {
                color: '#334155',
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#334155',
        },
        timeScale: {
            borderColor: '#334155',
        },
    });

    // Add initial empty series
    const candleSeries = currentChart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
    });

    // Listen for pair selection
    document.querySelectorAll('.trading-pairs-list div').forEach(pair => {
        pair.addEventListener('click', () => {
            selectedPair = pair.getAttribute('data-symbol');
            updateChartData(selectedPair);
        });
    });

    // Boom mode toggle
    const boomToggle = document.querySelector('.boom-toggle');
    if (boomToggle) {
        boomToggle.addEventListener('click', toggleBoomMode);
    }
}

// Update chart with new data
function updateChartData(symbol) {
    if (!currentChart || !symbol) return;

    // In a real implementation, we would fetch historical data from Deriv API
    console.log(`Loading chart data for ${symbol}`);
    
    // For demo purposes, we'll generate random data
    const now = Math.floor(Date.now() / 1000);
    const data = [];
    
    for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60;
        const open = 100 + Math.random() * 10;
        const high = open + Math.random() * 2;
        const low = open - Math.random() * 2;
        const close = open + (Math.random() - 0.5) * 2;
        
        data.push({ time, open, high, low, close });
    }

    const candleSeries = currentChart.addCandlestickSeries();
    candleSeries.setData(data);
}

// Toggle Boom markets mode
function toggleBoomMode() {
    isBoomMode = !isBoomMode;
    const boomToggle = document.querySelector('.boom-toggle');
    
    if (isBoomMode) {
        boomToggle.textContent = 'Standard Mode';
        boomToggle.classList.remove('text-gray-400');
        boomToggle.classList.add('text-yellow-400');
        currentBoomMarket = 'boom300'; // Default Boom market
        updateBoomMarketUI();
    } else {
        boomToggle.textContent = 'Boom Mode';
        boomToggle.classList.remove('text-yellow-400');
        boomToggle.classList.add('text-gray-400');
        currentBoomMarket = null;
    }
}

// Update UI for Boom market selection
function updateBoomMarketUI() {
    const boomSelect = document.querySelector('.boom-market-select');
    if (!boomSelect) return;

    boomSelect.innerHTML = derivConfig.boomMarkets
        .map(market => `<option value="${market}">${market.toUpperCase()}</option>`)
        .join('');

    boomSelect.addEventListener('change', (e) => {
        currentBoomMarket = e.target.value;
    });
}

// Handle buy/sell actions
function executeTrade(direction, amount) {
    if (!selectedPair) {
        alert('Please select a trading pair first');
        return;
    }

    const contract = {
        proposal: 1,
        amount: amount.toString(),
        basis: 'payout',
        contract_type: direction === 'buy' ? 'CALL' : 'PUT',
        currency: 'USD',
        duration: isBoomMode ? '5' : '1',
        duration_unit: isBoomMode ? 't' : 'm',
        symbol: isBoomMode ? currentBoomMarket : selectedPair
    };

    return placeContract(contract);
}

// Initialize trading UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTradingChart();
});

// Export functions for other modules
export {
    initTradingChart,
    executeTrade,
    toggleBoomMode
};
