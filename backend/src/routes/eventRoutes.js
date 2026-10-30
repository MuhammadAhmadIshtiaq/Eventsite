const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEventById);
router.get('/stats', eventController.getStats);

// Protected routes (require user to be logged in)
router.post('/registrations', authenticateToken, eventController.registerForEvent);
router.get('/registrations/my', authenticateToken, eventController.getMyRegistrations);

module.exports = router;
