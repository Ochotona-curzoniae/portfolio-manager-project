import pool from '../config/db.js';

export class BankModel {
  // 获取用户银行账户
  static async getBankAccounts(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bank_accounts WHERE user_id = ?',
        [userId]
      );
      return rows;
    } catch (error) {
      throw new Error('获取银行账户失败: ' + error.message);
    }
  }

  // 获取银行账户总余额
  static async getTotalBankBalance(userId) {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as total_assets,
          SUM(CASE WHEN balance < 0 THEN ABS(balance) ELSE 0 END) as total_debt
        FROM bank_accounts 
        WHERE user_id = ?
      `,
        [userId]
      );

      return rows[0];
    } catch (error) {
      throw new Error('获取银行余额失败: ' + error.message);
    }
  }

  // 获取交易记录
  static async getTransactions(userId, limit = 20, offset = 0) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );

      return rows;
    } catch (error) {
      throw new Error('获取交易记录失败: ' + error.message);
    }
  }

  // 添加银行账户
  static async addBankAccount(
    userId,
    bankName,
    accountType,
    accountNumber,
    balance,
    currency = 'CNY',
    interestRate = 0,
    creditLimit = 0
  ) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO bank_accounts (user_id, bank_name, account_type, account_number, balance, currency, interest_rate, credit_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, bankName, accountType, accountNumber, balance, currency, interestRate, creditLimit]
      );

      return result.insertId;
    } catch (error) {
      throw new Error('添加银行账户失败: ' + error.message);
    }
  }

  // 添加交易记录
  static async addTransaction(userId, accountId, description, amount, type, transactionDate = new Date()) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO transactions (user_id, account_id, description, amount, transaction_type, transaction_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, accountId, description, amount, type, transactionDate]
      );

      return result.insertId;
    } catch (error) {
      throw new Error('添加交易记录失败: ' + error.message);
    }
  }

  // 更新银行账户
  static async updateBankAccount(
    userId,
    bankName,
    accountType,
    accountNumber,
    balance,
    interestRate = 0,
    creditLimit = 0
  ) {
    try {
      const [result] = await pool.execute(
        `UPDATE bank_accounts 
         SET bank_name = ?, account_type = ?, balance = ?, interest_rate = ?, credit_limit = ?
         WHERE user_id = ? AND account_number = ?`,
        [bankName, accountType, balance, interestRate, creditLimit, userId, accountNumber]
      );

      if (result.affectedRows === 0) {
        throw new Error('未找到要更新的银行账户');
      }

      return result.affectedRows;
    } catch (error) {
      throw new Error('更新银行账户失败: ' + error.message);
    }
  }

} 