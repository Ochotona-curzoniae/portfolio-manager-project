import express from 'express';
import pool from '../config/db.js';
import { getBatchPrices, getLast7Closes, getDefaultQuotes} from './stockService.js';
import { BankModel } from './bankModel.js';

const router = express.Router();

// 获取投资组合详情
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 获取股票持仓
    const [stockHoldings] = await pool.execute(
      'SELECT * FROM stock_holdings WHERE user_id = ?',
      [userId]
    );

    // 获取银行账户
    const bankAccounts = await BankModel.getBankAccounts(userId);

    // 更新实时价格
    if (stockHoldings.length > 0) {
      const symbols = stockHoldings.map((holding) => holding.symbol);
      const prices = await getBatchPrices(symbols);

      for (let i = 0; i < stockHoldings.length; i++) {
        const holding = stockHoldings[i];
        const priceData = prices.find((p) => p.symbol === holding.symbol);
        if (priceData) {
          await pool.execute(
            'UPDATE stock_holdings SET current_price = ? WHERE id = ?',
            [priceData.price, holding.id]
          );
          holding.current_price = priceData.price;
        }
      }
    }

    // 获取资产配置目标
    const [allocationTargets] = await pool.execute(
      'SELECT * FROM asset_allocation_targets WHERE user_id = ?',
      [userId]
    );

    // 计算每类资产的当前市值
    const assetTypeValueMap = {};
    // 股票
    assetTypeValueMap['stocks'] = stockHoldings.reduce(
      (sum, holding) => sum + holding.shares * holding.current_price,
      0
    );
    // 其他类型（bonds, funds, cash）可根据实际业务补充
    assetTypeValueMap['bonds'] = 0;
    assetTypeValueMap['funds'] = 0;
    assetTypeValueMap['cash'] = bankAccounts.reduce(
      (sum, account) => sum + Number.parseFloat(account.balance), 0
    );

    // 计算总资产
    const totalValue = Object.values(assetTypeValueMap).reduce((sum, v) => sum + v, 0);

    // 颜色映射
    const colorMap = {
      stocks: '#0088FE',
      bonds: '#00C49F',
      funds: '#FFBB28',
      cash: '#FF8042'
    };

    // 动态生成 currentAllocation
    const currentAllocation = allocationTargets.map(t => ({
      name: t.asset_type,
      current: totalValue > 0 ? (assetTypeValueMap[t.asset_type] / totalValue) * 100 : 0,
      target: t.target_percentage,
      value: assetTypeValueMap[t.asset_type],
      color: colorMap[t.asset_type] || '#8884d8'
    }));

    res.json({
      success: true,
      data: {
        stockHoldings,
        currentAllocation,
        totalValue,
        stockValue: assetTypeValueMap['stocks'],
        cashValue: assetTypeValueMap['cash'],
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 买入股票
router.post('/buy', async (req, res) => {
  try {
    const { userId, symbol, shares, price, companyName } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 检查是否已有持仓
      const [existingHolding] = await connection.execute(
        'SELECT * FROM stock_holdings WHERE user_id = ? AND symbol = ?',
        [userId, symbol]
      );

      if (existingHolding.length > 0) {
        // 更新现有持仓
        const holding = existingHolding[0];
        const newShares = holding.shares + shares;
        const newAvgPrice =
          (holding.shares * holding.avg_price + shares * price) / newShares;

        await connection.execute(
          'UPDATE stock_holdings SET shares = ?, avg_price = ?, current_price = ? WHERE id = ?',
          [newShares, newAvgPrice, price, holding.id]
        );
      } else {
        // 创建新持仓
        await connection.execute(
          'INSERT INTO stock_holdings (user_id, symbol, company_name, shares, avg_price, current_price) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, symbol, companyName, shares, price, price]
        );
      }

      // 记录交易
      await connection.execute(
        'INSERT INTO transactions (user_id, transaction_type, symbol, shares, price, amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, 'buy', symbol, shares, price, -(shares * price), `购买 ${companyName} 股票`]
      );

      await connection.commit();
      res.json({ success: true, message: 'Stock purchased successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 股票历史收盘价测试接口
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await getLast7Closes(symbol);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 单股票价格接口
router.get('/history/simple/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await getBatchPrices([symbol]);
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 查询股票默认接口(默认查询7只股票)
router.get('/history/simple/symbols', async (req, res) => {
  try {
    const result = await getDefaultQuotes();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



export default router; 