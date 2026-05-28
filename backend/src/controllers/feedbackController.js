const prisma = require('../utils/prisma');

const createFeedback = async (req, res) => {
    const { message, rating } = req.body;

    if (!message || !String(message).trim()) {
        return res.status(400).json({ success: false, message: 'Feedback message is required' });
    }

    if (rating !== undefined && rating !== null) {
        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
        }
    }

    try {
        const feedback = await prisma.feedback.create({
            data: {
                message: String(message).trim(),
                rating: rating === undefined || rating === null || rating === '' ? null : Number(rating)
            }
        });

        return res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to submit feedback', error: error.message });
    }
};

const getAnonymousFeedback = async (req, res) => {
    try {
        const feedback = await prisma.feedback.findMany({
            select: {
                message: true,
                rating: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, data: feedback });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch feedback', error: error.message });
    }
};

module.exports = { createFeedback, getAnonymousFeedback };
