// Chart indicators management
let activeIndicators = [];
let indicatorSeries = {};

// Add indicator to chart
function addIndicator(chart, indicatorType, color = '#3b82f6') {
    if (!chart || !indicatorType) return;

    let series;
    switch(indicatorType.toLowerCase()) {
        case 'ma':
            series = chart.addLineSeries({
                color: color,
                lineWidth: 2
            });
            // Generate sample MA data
            const maData = generateMovingAverage(20);
            series.setData(maData);
            break;
            
        case 'rsi':
            series = chart.addLineSeries({
                color: color,
                lineWidth: 2,
                priceScaleId: 'right',
            });
            // Generate sample RSI data
            const rsiData = generateRSI(14);
            series.setData(rsiData);
            break;
            
        case 'macd':
            // MACD requires multiple series
            const macdSeries = {
                macd: chart.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 2
                }),
                signal: chart.addLineSeries({
                    color: '#ef4444',
                    lineWidth: 2
                }),
                histogram: chart.addHistogramSeries({
                    color: '#10b981',
                    lineWidth: 1
                })
            };
            // Generate sample MACD data
            const macdData = generateMACD();
            macdSeries.macd.setData(macdData.macd);
            macdSeries.signal.setData(macdData.signal);
            macdSeries.histogram.setData(macdData.histogram);
            break;
            
        case 'bollinger':
            series = {
                upper: chart.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 1,
                    lineStyle: 2 // Dashed
                }),
                middle: chart.addLineSeries({
                    color: '#6b7280',
                    lineWidth: 1
                }),
                lower: chart.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 1,
                    lineStyle: 2 // Dashed
                })
            };
            // Generate sample Bollinger Bands data
            const bbData = generateBollingerBands(20, 2);
            series.upper.setData(bbData.upper);
            series.middle.setData(bbData.middle);
            series.lower.setData(bbData.lower);
            break;
    }

    if (series) {
        activeIndicators.push(indicatorType);
        indicatorSeries[indicatorType] = series;
    }
}

// Remove indicator from chart
function removeIndicator(indicatorType) {
    if (!indicatorSeries[indicatorType]) return;

    // For complex indicators like MACD or Bollinger Bands
    if (typeof indicatorSeries[indicatorType] === 'object') {
        Object.values(indicatorSeries[indicatorType]).forEach(series => {
            series.chart().removeSeries(series);
        });
    } else {
        indicatorSeries[indicatorType].chart().removeSeries(indicatorSeries[indicatorType]);
    }

    activeIndicators = activeIndicators.filter(ind => ind !== indicatorType);
    delete indicatorSeries[indicatorType];
}

// Generate sample moving average data (for demo)
function generateMovingAverage(period) {
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60;
        const value = 100 + Math.sin(i/10) * 5 + Math.random();
        data.push({ time, value });
    }
    
    return data;
}

// Generate sample RSI data (for demo)
function generateRSI(period) {
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60;
        const value = 50 + Math.sin(i/5) * 30 + Math.random() * 10;
        data.push({ time, value });
    }
    
    return data;
}

// Generate sample MACD data (for demo)
function generateMACD() {
    const macd = [];
    const signal = [];
    const histogram = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60;
        const macdValue = Math.sin(i/10) * 2;
        const signalValue = Math.sin(i/10 + 0.5) * 1.5;
        
        macd.push({ time, value: macdValue });
        signal.push({ time, value: signalValue });
        histogram.push({ time, value: macdValue - signalValue, color: (macdValue - signalValue) >= 0 ? '#10b981' : '#ef4444' });
    }
    
    return { macd, signal, histogram };
}

// Generate sample Bollinger Bands data (for demo)
function generateBollingerBands(period, multiplier) {
    const upper = [];
    const middle = [];
    const lower = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
        const time = now - (100 - i) * 60;
        const base = 100 + Math.sin(i/10) * 5;
        const value = base + Math.random() * 2;
        const stdDev = 1.5 + Math.random() * 0.5;
        
        middle.push({ time, value: base });
        upper.push({ time, value: base + stdDev * multiplier });
        lower.push({ time, value: base - stdDev * multiplier });
    }
    
    return { upper, middle, lower };
}

// Handle indicator selection from UI
function setupIndicatorControls(chart) {
    const indicatorSelect = document.querySelector('.indicator-select');
    if (!indicatorSelect) return;

    indicatorSelect.addEventListener('change', (e) => {
        const selectedIndicator = e.target.value;
        if (selectedIndicator && selectedIndicator !== 'Indicators') {
            addIndicator(chart, selectedIndicator);
            e.target.value = 'Indicators'; // Reset selector
        }
    });

    // Add click handler for removing indicators
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-indicator')) {
            const indicator = e.target.dataset.indicator;
            removeIndicator(indicator);
            e.target.remove();
        }
    });
}

// Initialize indicators when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chart = LightweightCharts.createChart(document.getElementById('tv-chart'));
    setupIndicatorControls(chart);
});

// Export functions for other modules
export {
    addIndicator,
    removeIndicator,
    setupIndicatorControls
};
