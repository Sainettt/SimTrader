import cron from 'node-cron';
import binanceApi from './binanceApi';

interface BinanceTicker {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
}

interface TickerData {
    price: number;
    changePercent: number;
}

export interface CoinData {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change: number;
}

export let priceCache: Record<string, TickerData> = {};
export let sortedMarketCache: CoinData[] = [];

const IGNORED_COINS = [
    'USDC', 'FDUSD', 'TUSD', 'USDP', 'DAI', 'BUSD', 
    'EUR', 'GBP', 'AUD', 'TRY', 'RUB', 'BRL',       
    'WBTC', 'USD1', 'SENT'                                         
];

export const startPriceUpdater = () => {
    console.log('🚀 Price & Market updater service started');

    cron.schedule('*/5 * * * * *', async () => {
        try {
            const { data } = await binanceApi.get('/ticker/24hr');
            
            // 1. Here we are dont use filter. For all data to wallet (with USDC for exmpl)
            data.forEach((ticker: BinanceTicker) => {
                priceCache[ticker.symbol] = {
                    price: parseFloat(ticker.lastPrice),
                    changePercent: parseFloat(ticker.priceChangePercent)
                };
            });

            // 2. Filter data for main and all assets screens
            const marketPairs = data.filter((t: BinanceTicker) => {

                if (!t.symbol.endsWith('USDT')) return false;
                const symbolClean = t.symbol.replace('USDT', '');
                if (IGNORED_COINS.includes(symbolClean)) return false;

                return true;
            });

            marketPairs.sort((a: BinanceTicker, b: BinanceTicker) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

            const top100 = marketPairs.slice(0, 100);

            sortedMarketCache = top100.map((t: BinanceTicker) => {
                const symbolClean = t.symbol.replace('USDT', '');
                return {
                    id: symbolClean,
                    name: symbolClean,
                    symbol: symbolClean,
                    price: parseFloat(t.lastPrice),
                    change: parseFloat(t.priceChangePercent).toFixed(2)
                };
            });

        } catch (error) {
            console.error('[Cron] Error updating market data:', error);
        }
    });
};

export const getTickerFromCache = (symbol: string): TickerData => {
    return priceCache[symbol] || { price: 0, changePercent: 0 };
};

export const getTopCoinsFromCache = (limit: number = 100): CoinData[] => {
    return sortedMarketCache.slice(0, limit);
};