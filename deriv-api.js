// Deriv API Configuration
const derivConfig = {
    appId: 1089, // Deriv application ID
    endpoint: 'wss://ws.binaryws.com/websockets/v3',
    supportedPairs: ['frxUSDJPY', 'frxEURUSD', 'frxGBPUSD', 'frxUSDCHF', 'frxAUDUSD'],
    boomMarkets: ['boom300', 'boom500', 'boom1000']
};

// WebSocket connection to Deriv API
let derivSocket = null;

// Initialize Deriv API connection
function connectDerivAPI() {
    derivSocket = new WebSocket(derivConfig.endpoint);

    derivSocket.onopen = () => {
        console.log('Connected to Deriv API');
        authorizeDeriv();
    };

    derivSocket.onerror = (error) => {
        console.error('Deriv API connection error:', error);
    };

    derivSocket.onclose = () => {
        console.log('Disconnected from Deriv API');
    };
}

// Authorize with Deriv API
function authorizeDeriv(token = '') {
    const authRequest = {
        authorize: token || ''
    };
    derivSocket.send(JSON.stringify(authRequest));
}

// Fetch MT5 trading pairs
function loadMT5Pairs() {
    if (!derivSocket || derivSocket.readyState !== WebSocket.OPEN) {
        console.error('Deriv API not connected');
        return;
    }

    const request = {
        active_symbols: 'brief',
        product_type: 'basic'
    };

    derivSocket.send(JSON.stringify(request));
    derivSocket.onmessage = (response) => {
        const data = JSON.parse(response.data);
        if (data.msg_type === 'active_symbols') {
            updatePairsList(data.active_symbols);
        }
    };
}

// Update UI with available pairs
function updatePairsList(symbols) {
    const pairsContainer = document.querySelector('.trading-pairs-list');
    if (!pairsContainer) return;

    // Filter and display MT5 pairs
    const mt5Pairs = symbols.filter(s => 
        s.market === 'forex' && derivConfig.supportedPairs.includes(s.symbol)
    );

    mt5Pairs.forEach(pair => {
        const pairElement = document.createElement('div');
        pairElement.className = 'flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer';
        pairElement.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-gray-500 rounded-full"></div>
                <span>${pair.display_name}</span>
            </div>
            <span class="text-gray-400">${pair.spot}</span>
        `;
        pairElement.addEventListener('click', () => selectPair(pair.symbol));
        pairsContainer.appendChild(pairElement);
    });
}

// Place contract through Deriv API
function placeContract(contractParams) {
    if (!derivSocket || derivSocket.readyState !== WebSocket.OPEN) {
        console.error('Deriv API not connected');
        return false;
    }

    const request = {
        proposal: 1,
        ...contractParams,
        subscribe: 1
    };

    derivSocket.send(JSON.stringify(request));
    return true;
}

// Initialize Deriv API when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    connectDerivAPI();
});

// Export functions for trading.js
export {
    derivConfig,
    connectDerivAPI,
    loadMT5Pairs,
    placeContract
};
