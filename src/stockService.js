import axios from 'axios';

const API_KEY = process.env.FINNHUB_API_KEY || 'd24rmn9r01qu2jgjn8mgd24rmn9r01qu2jgjn8n0';

export async function getBatchPrices(symbols) {
  const results = [];

  await Promise.all(symbols.map(async (symbol) => {
    try {
      const [quoteRes] = await Promise.all([
        axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol, token: API_KEY }
        })
        // profile接口暂不需要
      ]);

      const quote = quoteRes.data;

      results.push({
        symbol,
        price: parseFloat(quote.c),
        change: parseFloat(quote.d),
        changePercent: parseFloat(quote.dp),
        volume: quote.v ? parseInt(quote.v) : null,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err.message);
    }
  }));

  return results;
} 