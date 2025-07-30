import express from 'express';
import pool from '../config/db.js';

// mock stockService
const stockService = {
  async getBatchPrices(symbols) {
    // 模拟返回价格
    return symbols.map(symbol => ({ symbol, price: Math.random() * 100 + 10 }));
  }
};

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

    // 更新实时价格
    if (stockHoldings.length > 0) {
      const symbols = stockHoldings.map((holding) => holding.symbol);
      const prices = await stockService.getBatchPrices(symbols);

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

    // 计算当前资产配置
    const totalValue = stockHoldings.reduce(
      (sum, holding) => sum + holding.shares * holding.current_price,
      0
    );

    const currentAllocation = [
      {
        name: '股票',
        current: totalValue > 0 ? (totalValue / totalValue) * 100 : 0,
        target:
          allocationTargets.find((t) => t.asset_type === 'stocks')?.target_percentage || 60,
        value: totalValue,
        color: '#0088FE',
      },
      // 可以添加更多资产类型
    ];

    res.json({
      success: true,
      data: {
        stockHoldings,
        currentAllocation,
        totalValue,
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

export default router; 