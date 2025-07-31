import pool from '../config/db.js';

export async function getBatchPrices(symbols) {
  // 并发处理所有 symbol
  const results = await Promise.all(symbols.map(async (symbol) => {
    try {
      // 从数据库获取行情数据
      let dbQuote = await getStockQuoteFromDB(symbol);
      if (dbQuote) {
        return {
          symbol: dbQuote.symbol,
          open: parseFloat(dbQuote.open_price),
          high: parseFloat(dbQuote.high_price),
          low: parseFloat(dbQuote.low_price),
          price: parseFloat(dbQuote.current_price),
          volume: parseInt(dbQuote.volume),
          latestTradingDay: dbQuote.latest_trading_day,
          previousClose: parseFloat(dbQuote.previous_close),
          change: parseFloat(dbQuote.change_amount),
          changePercent: dbQuote.change_percent,
          source: 'database'
        };
      } else {
        return { symbol, error: 'Symbol not found in database' };
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      return { symbol, error: error.message || 'Failed to fetch stock data' };
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

export async function getLast7Closes(symbols) {
  const isSingle = typeof symbols === 'string';
  if (isSingle) symbols = [symbols];

  const results = [];

  await Promise.all(symbols.map(async (symbol) => {
    try {
      const [rows] = await pool.execute(`
        SELECT DATE(date) AS date, close_price AS close
        FROM stock_price_history
        WHERE symbol = ?
        GROUP BY DATE(date)
        ORDER BY DATE(date) DESC
        LIMIT 7
      `, [symbol]);

      // 保证顺序从旧到新（数据库是从新到旧查出的）
      const history = rows.reverse().map(row => ({
        date: row.date.toISOString().split('T')[0],
        close: parseFloat(row.close)
      }));

      results.push({
        symbol,
        history
      });
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err.message);

      // MOCK 数据
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

export async function getDefaultQuotes(symbols = [
  'AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA', 'FB', 'NFLX'
]) {
  console.log('Fetching default quotes for:', symbols);
  // 并发处理所有 symbol
  const results = [];
  await Promise.all(symbols.map(async (symbol) => {
    try {
      // 从数据库获取行情数据
      let dbQuote = await getStockQuoteFromDB(symbol);
      console.log(`Fetched quote for ${symbol}:`, dbQuote);
        results.push({
            symbol: dbQuote.symbol,
            open: parseFloat(dbQuote.open_price),
            high: parseFloat(dbQuote.high_price),
            low: parseFloat(dbQuote.low_price),
            price: parseFloat(dbQuote.current_price),
            volume: parseInt(dbQuote.volume),
            latestTradingDay: dbQuote.latest_trading_day,
            previousClose: parseFloat(dbQuote.previous_close),
            change: parseFloat(dbQuote.change_amount),
            changePercent: dbQuote.change_percent,
            source: 'database'
        });
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
    }
  }));
  return results;
}

// 从数据库获取股票行情数据
async function getStockQuoteFromDB(symbol) {
  try {
    const [rows] = await pool.execute(
      `SELECT symbol, open_price, high_price, low_price, current_price, 
              volume, latest_trading_day, previous_close, change_amount, change_percent,
              updated_at
       FROM stock_quotes 
       WHERE symbol = ?`,
      [symbol]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching ${symbol} quote from DB:`, error);
    return null;
  }
}