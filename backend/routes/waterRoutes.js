const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');

router.post('/', waterController.addReading);
router.get('/latest', waterController.getLatestReading);
router.get('/history', waterController.getHistory);
router.get('/today', waterController.getToday);
router.get('/stats', waterController.getStats);
router.delete('/clear', waterController.clearReadings);
router.get('/charts/hourly', waterController.getHourlyUsage);

module.exports = router;
