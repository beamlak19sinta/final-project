const prisma = require('../utils/prisma');

const createQuestion = async (req, res) => {
    const { question } = req.body;

    if (!question || !String(question).trim()) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        const created = await prisma.helpDeskQuestion.create({
            data: {
                question: String(question).trim(),
                userId: req.user?.id || null,
                status: 'PENDING'
            }
        });

        return res.status(201).json({ success: true, message: 'Question submitted successfully', data: created });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to submit question', error: error.message });
    }
};

const getQuestions = async (req, res) => {
    try {
        const questions = await prisma.helpDeskQuestion.findMany({
            include: {
                user: { select: { id: true, name: true, phoneNumber: true, role: true } },
                repliedBy: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, message: 'Questions fetched successfully', data: questions });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
    }
};

const getMyQuestions = async (req, res) => {
    try {
        const questions = await prisma.helpDeskQuestion.findMany({
            where: { userId: req.user.id },
            include: {
                repliedBy: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, message: 'Your questions fetched successfully', data: questions });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch your questions', error: error.message });
    }
};

const getHelpDeskNotes = async (req, res) => {
    try {
        const notes = await prisma.helpDeskQuestion.findMany({
            where: {
                reply: { not: null }
            },
            select: {
                id: true,
                question: true,
                reply: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedNotes = notes.map((note) => ({
            id: note.id,
            title: note.question,
            content: note.reply,
            createdAt: note.createdAt
        }));

        return res.json({ success: true, data: formattedNotes });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch help desk notes', error: error.message });
    }
};

const replyQuestion = async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !String(reply).trim()) {
        return res.status(400).json({ success: false, message: 'Reply is required' });
    }

    try {
        const updated = await prisma.helpDeskQuestion.update({
            where: { id: String(id) },
            data: {
                reply: String(reply).trim(),
                status: 'ANSWERED',
                repliedAt: new Date(),
                repliedById: req.user.id
            }
        });

        return res.json({ success: true, message: 'Question answered successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to reply to question', error: error.message });
    }
};

const answerQuestion = async (req, res) => {
    const { questionId, answer } = req.body;

    if (!questionId || !answer || !String(answer).trim()) {
        return res.status(400).json({ success: false, message: 'questionId and answer are required' });
    }

    try {
        const updated = await prisma.helpDeskQuestion.update({
            where: { id: String(questionId) },
            data: {
                reply: String(answer).trim(),
                status: 'ANSWERED',
                repliedAt: new Date(),
                repliedById: req.user.id
            }
        });

        return res.json({ success: true, message: 'Answer submitted successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to answer question', error: error.message });
    }
};

const forwardQuestion = async (req, res) => {
    const { questionId } = req.body;
    if (!questionId) {
        return res.status(400).json({ success: false, message: 'questionId is required' });
    }

    try {
        const updated = await prisma.helpDeskQuestion.update({
            where: { id: String(questionId) },
            data: {
                forwardedToAdmin: true,
                status: 'FORWARDED'
            }
        });

        return res.json({ success: true, message: 'Question forwarded to admin', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to forward question', error: error.message });
    }
};

module.exports = { createQuestion, getQuestions, getMyQuestions, getHelpDeskNotes, replyQuestion, answerQuestion, forwardQuestion };
