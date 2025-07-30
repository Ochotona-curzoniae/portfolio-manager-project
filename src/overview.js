import express from 'express';
import pool from '../config/db.js';
import { getBatchPrices } from './stockService.js';

const router = express.Router();

// 获取用户总资产概览
router.get('/overview/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 获取银行账户余额
    const [bankAccounts] = await pool.execute(
      'SELECT * FROM bank_accounts WHERE user_id = ?',
      [userId]
    );

    // 获取股票持仓
    const [stockHoldings] = await pool.execute(
      'SELECT * FROM stock_holdings WHERE user_id = ?',
      [userId]
    );

    // 更新股票实时价格
    if (stockHoldings.length > 0) {
      const symbols = stockHoldings.map((holding) => holding.symbol);
      const prices = await getBatchPrices(symbols);

      // 更新数据库中的当前价格
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

    // 计算总资产
    const bankBalance = bankAccounts
      .filter((acc) => acc.account_type !== 'credit_card')
      .reduce((sum, acc) => sum + Number.parseFloat(acc.balance), 0);

    const investmentValue = stockHoldings.reduce(
      (sum, holding) => sum + holding.shares * holding.current_price,
      0
    );

    const totalDebt = bankAccounts
      .filter((acc) => acc.account_type === 'credit_card' && acc.balance < 0)
      .reduce((sum, acc) => sum + Math.abs(Number.parseFloat(acc.balance)), 0);

    const totalNetWorth = bankBalance + investmentValue - totalDebt;

    // 获取净资产历史数据
    const [netWorthHistory] = await pool.execute(
      'SELECT * FROM net_worth_history WHERE user_id = ? ORDER BY record_date DESC LIMIT 6',
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalNetWorth,
        bankBalance,
        investmentValue,
        totalDebt,
        bankAccounts,
        stockHoldings,
        netWorthHistory: netWorthHistory.reverse(),
        totalGainLoss: 5000.25,
        gainLossPercent: 5.26
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 