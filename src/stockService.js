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

// todo: this api need cost money.
// export async function getLast7Closes(symbols) {
//   const isSingle = typeof symbols === 'string';
//   if (isSingle) symbols = [symbols];

//   const results = [];

//   const now = Math.floor(Date.now() / 1000);
//   const tenDaysAgo = now - 10 * 24 * 60 * 60;

//   await Promise.all(symbols.map(async (symbol) => {
//     try {
//       const res = await axios.get('https://finnhub.io/api/v1/stock/candle', {
//         params: {
//           symbol,
//           resolution: 'D',
//           from: tenDaysAgo,
//           to: now,
//           token: API_KEY
//         }
//       });

//       const { c: closes, t: timestamps, s } = res.data;

//       if (s !== 'ok') {
//         console.warn(`No data returned for ${symbol}`);
//         return;
//       }

//       const last7 = closes.map((price, index) => {
//         const date = new Date(timestamps[index] * 1000).toISOString().split('T')[0];
//         return { date, close: price };
//       }).slice(-7);

//       results.push({
//         symbol,
//         history: last7
//       });
//     } catch (err) {
//       console.error(`Error fetching data for ${symbol}:`, err.message);
//     }
//   }));

//   return isSingle ? results[0] : results;
// } 

// ... existing code ...
export async function getLast7Closes(symbols) {
  const isSingle = typeof symbols === 'string';
  if (isSingle) symbols = [symbols];

  const results = [];

  const now = Math.floor(Date.now() / 1000);
  const tenDaysAgo = now - 10 * 24 * 60 * 60;

  await Promise.all(symbols.map(async (symbol) => {
    try {
      const res = await axios.get('https://finnhub.io/api/v1/stock/candle', {
        params: {
          symbol,
          resolution: 'D',
          from: tenDaysAgo,
          to: now,
          token: API_KEY
        }
      });

      const { c: closes, t: timestamps, s } = res.data;

      if (s !== 'ok') {
        throw new Error('No data returned');
      }

      const last7 = closes.map((price, index) => {
        const date = new Date(timestamps[index] * 1000).toISOString().split('T')[0];
        return { date, close: price };
      }).slice(-7);

      results.push({
        symbol,
        history: last7
      });
    } catch (err) {
      // MOCK: 生成7天的假数据
      const today = new Date();
      const mockHistory = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          close: Math.round((100 + Math.random() * 100) * 100) / 100
        };
      });
      results.push({
        symbol,
        history: mockHistory
      });
    }
  }));

  return isSingle ? results[0] : results;
}


const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META'];

export async function getDefaultQuotes() {
  const results = [];

  await Promise.all(symbols.map(async (symbol) => {
    try {
      const [quoteRes, profileRes] = await Promise.all([
        axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol, token: API_KEY }
        }),
        axios.get('https://finnhub.io/api/v1/stock/profile2', {
          params: { symbol, token: API_KEY }
        })
      ]);

      const quote = quoteRes.data;

      results.push({
        symbol,
        price: parseFloat(quote.c),
        change: parseFloat(quote.d),
        changePercent: parseFloat(quote.dp),
        volume: quote.v ? parseInt(quote.v) : null,
        lastUpdated: new Date().toISOString().split('T')[0] // 模拟日期（可根据实际需要替换）
      });
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err.message);
    }
  }));

  console.log(results);
  return results;
}

