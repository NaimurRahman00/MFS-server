const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Transaction routes
router.post('/send-money', transactionController.sendMoney);
router.post('/cash-out', transactionController.cashOut);
router.post('/cash-in', transactionController.cashIn);
router.get('/balance-inquiry/:id', transactionController.balanceInquiry);
router.get('/transaction-history/:id', transactionController.transactionHistory);

module.exports = router;
