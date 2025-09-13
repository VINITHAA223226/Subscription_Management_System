const express = require('express');
const {
  getAnalytics,
  getSubscriptionAnalytics,
  getRevenueAnalytics,
  getUsageAnalytics,
  getTopPlans,
  getChurnAnalytics
} = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authMiddleware, adminOnly, getAnalytics);
router.get('/subscriptions', authMiddleware, adminOnly, getSubscriptionAnalytics);
router.get('/revenue', authMiddleware, adminOnly, getRevenueAnalytics);
router.get('/usage', authMiddleware, adminOnly, getUsageAnalytics);
router.get('/top-plans', authMiddleware, adminOnly, getTopPlans);
router.get('/churn', authMiddleware, adminOnly, getChurnAnalytics);

module.exports = router;
