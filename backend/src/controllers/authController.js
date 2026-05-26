const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');

const NATIONAL_ID_REGEX = /^\d{16}$/;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const PHONE_REGEX = /^(09\d{8}|\+2519\d{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
    const { name, phoneNumber, identificationNumber, nationalId, password, role } = req.body;

    try {
        if (!nationalId || !NATIONAL_ID_REGEX.test(String(nationalId))) {
            return res.status(400).json({ message: 'National ID must be exactly 16 numeric digits' });
        }

        const duplicateConditions = [{ phoneNumber }, { nationalId: String(nationalId) }];
        if (identificationNumber) {
            duplicateConditions.push({ identificationNumber });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: duplicateConditions }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this phone number or ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                phoneNumber,
                identificationNumber: identificationNumber || null,
                nationalId: String(nationalId),
                password: hashedPassword,
                role: role || 'CITIZEN'
            }
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { identifier, phoneNumber } = req.body;
    const lookupValue = identifier || phoneNumber;

    if (!lookupValue || typeof lookupValue !== 'string') {
        return res.status(400).json({ message: 'Email or phone is required' });
    }

    try {
        const value = lookupValue.trim();
        const isEmail = EMAIL_REGEX.test(value);
        const isPhone = PHONE_REGEX.test(value);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: 'Identifier must be a valid phone number or email format' });
        }

        const phoneFromEmail = isEmail ? value.split('@')[0] : value;

        const user = await prisma.user.findUnique({
            where: { phoneNumber: phoneFromEmail }
        });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists, password reset instructions are ready.'
            });
        }

        const token = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000)
            }
        });

        console.log("RESET TOKEN:", token);

        return res.json({ success: true, token });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to process forgot password request', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Reset token is required' });
    }

    if (!newPassword || String(newPassword).length < 4) {
        return res.status(400).json({ message: 'New password must be at least 4 characters long' });
    }

    try {
        console.log("TOKEN RECEIVED:", token);
        console.log("CURRENT TIME:", new Date());

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

const login = async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { phoneNumber }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                token,
                refreshToken: token, // Using same token for now, can implement separate refresh token logic later
                user: {
                    id: user.id,
                    email: user.phoneNumber + '@placeholder.com', // Mobile app expects email
                    fullName: user.name,
                    role: user.role,
                    phoneNumber: user.phoneNumber,
                    createdAt: user.createdAt.toISOString()
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    const { name, phoneNumber } = req.body;
    const userId = req.user.id;

    try {
        // Check if phone number is taken by another user
        if (phoneNumber) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phoneNumber,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, phoneNumber },
            select: { id: true, name: true, role: true, phoneNumber: true }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};

const logout = async (req, res) => {
    // For JWT-based auth, logout is typically handled client-side
    // But we can add server-side token blacklisting if needed in the future
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

module.exports = { register, login, logout, updateProfile, changePassword, forgotPassword, resetPassword };

