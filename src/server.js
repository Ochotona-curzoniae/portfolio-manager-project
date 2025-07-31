import express from 'express'
import mysql from 'mysql2'
import overviewRouter from './overview.js'
import portfolioRouter from './portfolio.js'
import { BankModel } from './bankModel.js';

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use('/api', overviewRouter)
app.use('/api/portfolio', portfolioRouter)
app.get('/api/networth/:days', async (req, res) => {
    try {
      // 3. .THEN/.CATCH EXAMPLE: Alternative to async/await
      const { days } = req.params;
        res.json({
            "total":2317371,
            "changeToday":3402,
            "history":[
                { date: '2024-06-29', value: 2100000 },
                { date: '2024-06-30', value: 2100000 },
                { date: '2024-07-01', value: 2100000 },
                { date: '2024-07-02', value: 2100000 },
                { date: '2024-07-03', value: 2100000 },
                { date: '2024-07-04', value: 2100000 },
                { date: '2024-07-05', value: 2100000 },
                { date: '2024-07-06', value: 2100000 },
                { date: '2024-07-07', value: 2100000 },
                { date: '2024-07-08', value: 2100000 },
                { date: '2024-07-09', value: 2100000 },
                { date: '2024-07-10', value: 2100000 },
                { date: '2024-07-11', value: 2100000 },
                { date: '2024-07-12', value: 2100000 },
                { date: '2024-07-13', value: 2100000 },
                { date: '2024-07-14', value: 2100000 },
                { date: '2024-07-15', value: 2100000 },
                { date: '2024-07-16', value: 2100000 },
                { date: '2024-07-17', value: 2100000 },
                { date: '2024-07-18', value: 2100000 },
                { date: '2024-07-19', value: 2100000 },
                { date: '2024-07-20', value: 2100000 },
                { date: '2024-07-21', value: 2100000 },
                { date: '2024-07-22', value: 2100000 },
                { date: '2024-07-23', value: 2050000 },
                { date: '2024-07-24', value: 2100000 },
                { date: '2024-07-25', value: 2150000 },
                { date: '2024-07-26', value: 2200000 },
                { date: '2024-07-27', value: 2250000 },
                { date: '2024-07-28', value: 2317371 }
              ]
        })
    } catch (err) {
      next(err);
    }
  });
  app.get('/', async (req, res) => {
    try {
      console.log("hello hello")
      res.json({
        "name": "success"
      })
    } catch (err) {
      next(err);
    }
  });

// 新增市场主要动态API
app.get('/api/stocks/market-movers', async (req, res) => {
  res.json({
    success: true,
    data: {
      gainers: [
        { symbol: 'NVDA', name: '英伟达', price: 892.14, change: 45.67, changePercent: 5.39, volume: 89200000 },
        { symbol: 'TSLA', name: '特斯拉', price: 248.50, change: 32.15, changePercent: 4.85, volume: 156700000 }
      ],
      losers: [
        { symbol: 'META', name: 'Meta', price: 325.67, change: -18.92, changePercent: -5.49, volume: 78400000 },
        { symbol: 'NFLX', name: '奈飞', price: 456.78, change: -22.34, changePercent: -4.66, volume: 23100000 }
      ],
      mostActive: [
        { symbol: 'TSLA', name: '特斯拉', price: 248.50, change: 32.15, changePercent: 4.85, volume: 234500000 },
        { symbol: 'AAPL', name: '苹果', price: 175.43, change: 8.92, changePercent: 3.37, volume: 189700000 }
      ],
      indices: [
        { name: '道琼斯', value: 38712.21, changePercent: 0.15 },
        { name: '纳斯达克', value: 17857.02, changePercent: 0.3 },
        { name: '标普500', value: 5473.17, changePercent: 0.2 }
      ]
    }
  });
});

// 获取指定用户银行账户列表
app.get('/api/bank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const accounts = await BankModel.getBankAccounts(userId);
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加新银行账户
app.post('/api/bank', async (req, res) => {
  try {
    const { userId, bankName, accountType, accountNumber, balance, currency, interestRate, creditLimit } = req.body;
    await BankModel.addBankAccount(
      userId,
      bankName,
      accountType,
      accountNumber,
      balance,
      currency,
      interestRate,
      creditLimit
    ); 
    res.json({ success: true, message: 'Bank account added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 编辑银行账户
app.put('/api/bank', async (req, res) => {
  try {
    const { userId, bankName, accountType, accountNumber, balance, interestRate, creditLimit } = req.body;
    await BankModel.updateBankAccount(
      userId,
      bankName,
      accountType,
      accountNumber,
      balance,
      interestRate,
      creditLimit
    );
    res.json({ success: true, message: 'Bank account updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 编辑银行账户
app.put('/api/bank', async (req, res) => {
  try {
    const { userId, bankName, accountType, accountNumber, balance, interestRate, creditLimit } = req.body;
    await BankModel.updateBankAccount(
      userId,
      bankName,
      accountType,
      accountNumber,
      balance,
      interestRate,
      creditLimit
    );
    res.json({ success: true, message: 'Bank account updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// // 批量获取股票行情（调用 external api）
// app.get('/stocks/batch/', async (req, res) => {
//   // 支持 /stocks?symbols=AAPL,TSLA,GOOGL
//   const API_KEY_ALPH = "47JBNGXKY9RHCER4";
//   let symbols = req.query.symbols ? req.query.symbols.split(',') : [];
//   console.log(symbols);

//   // 并发请求所有 symbol
//   const results = await Promise.all(symbols.map(async (symbol) => {
//     const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY_ALPH}`;
//     try {
//       const response = await axios.get(url);
//       const data = response.data['Global Quote'];

//       if (!data || Object.keys(data).length === 0) {
//         return { symbol, error: 'Symbol not found or invalid response' };
//       }

//       return {
//         symbol: data['01. symbol'],
//         open: parseFloat(data['02. open']),
//         high: parseFloat(data['03. high']),
//         low: parseFloat(data['04. low']),
//         price: parseFloat(data['05. price']),
//         volume: parseInt(data['06. volume']),
//         latestTradingDay: data['07. latest trading day'],
//         previousClose: parseFloat(data['08. previous close']),
//         change: parseFloat(data['09. change']),
//         changePercent: data['10. change percent'],
//       };
//     } catch (error) {
//       return { symbol, error: error.message || 'Failed to fetch stock data' };
//     }
//   }));

//   res.json({ success: true, data: results });
// });

app.listen(3000, () => console.log('running on http://localhost:3000'));
