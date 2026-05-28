const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuthenticateToken, authorizeRoles } = require('../middleware/auth');
const { createQuestion, getQuestions, getMyQuestions, getHelpDeskNotes, replyQuestion, answerQuestion, forwardQuestion } = require('../controllers/helpdeskController');

router.post('/questions', optionalAuthenticateToken, createQuestion);
router.get('/notes', optionalAuthenticateToken, getHelpDeskNotes);
router.get('/questions/my', authenticateToken, authorizeRoles('CITIZEN', 'HELPDESK', 'HELP_DESK', 'OFFICER', 'ADMIN'), getMyQuestions);
router.get('/questions/triage', authenticateToken, authorizeRoles('HELPDESK', 'HELP_DESK', 'ADMIN'), getQuestions);
router.get('/questions', authenticateToken, authorizeRoles('ADMIN'), getQuestions);
router.patch('/questions/:id/reply', authenticateToken, authorizeRoles('ADMIN'), replyQuestion);
router.post('/questions/answer', authenticateToken, authorizeRoles('HELPDESK', 'HELP_DESK', 'ADMIN'), answerQuestion);
router.post('/questions/forward', authenticateToken, authorizeRoles('HELPDESK', 'HELP_DESK', 'ADMIN'), forwardQuestion);

module.exports = router;
