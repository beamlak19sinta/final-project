const express = require('express');
const router = express.Router();
const { createFeedback, getAnonymousFeedback } = require('../controllers/feedbackController');

router.get('/', getAnonymousFeedback);
router.post('/', createFeedback);

module.exports = router;
