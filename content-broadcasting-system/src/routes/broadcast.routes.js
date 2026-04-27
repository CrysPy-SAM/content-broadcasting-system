const express = require('express');
const router = express.Router();
const BroadcastController = require('../controllers/broadcast.controller');
const { broadcastLimiter } = require('../middlewares/rateLimiter.middleware');

// All broadcast routes are PUBLIC (no authentication needed - students access these)
router.get(
  '/:teacher_id',
  broadcastLimiter,
  BroadcastController.getLiveContent
);

// GET /content/live/:teacher_id/schedule - Preview full rotation schedule
router.get(
  '/:teacher_id/schedule',
  broadcastLimiter,
  BroadcastController.getSchedulePreview
);

module.exports = router;
