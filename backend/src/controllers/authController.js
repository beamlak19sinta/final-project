const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');

const NATIONAL_ID_REGEX = /^\d{16}$/;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const PHONE_REGEX = /^(0[79]\d{8}|\+251[79]\d{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeBody = (body) => {
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[HIDDEN]';
    if (sanitized.newPassword) sanitized.newPassword = '[HIDDEN]';
    if (sanitized.currentPassword) sanitized.currentPassword = '[HIDDEN]';
    return JSON.stringify(sanitized);
};

const register = async (req, res) => {
    const { name, phoneNumber, identificationNumber, nationalId, password, role } = req.body;
    console.log(`[AUTH] Registration request received. Body: ${sanitizeBody(req.body)}`);

    try {
        if (!nationalId || !NATIONAL_ID_REGEX.test(String(nationalId))) {
            console.warn(`[AUTH Warning] Registration rejected: National ID '${nationalId}' does not match exactly 16 numeric digits.`);
            return res.status(400).json({ message: 'National ID must be exactly 16 numeric digits' });
        }

        const duplicateConditions = [{ phoneNumber }, { nationalId: String(nationalId) }];
        if (identificationNumber) {
            duplicateConditions.push({ identificationNumber });
        }

        console.log(`[AUTH] Checking duplicate users with conditions:`, duplicateConditions);
        const existingUser = await prisma.user.findFirst({
            where: { OR: duplicateConditions }
        });

        if (existingUser) {
            console.warn(`[AUTH Warning] Registration rejected: Duplicate user exists for phone number or IDs.`);
            return res.status(400).json({ message: 'User with this phone number or ID already exists' });
        }

        console.log(`[AUTH] Generating password hash for new user...`);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`[AUTH] Creating new user in Prisma...`);
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

        console.log(`[AUTH Success] User successfully registered with database ID: ${user.id}`);
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error(`[AUTH Error] Registration failed due to database or server error:`, error);
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    console.log(`[AUTH] Forgot password request received. Body: ${sanitizeBody(req.body)}`);
    const { identifier, phoneNumber } = req.body;
    const lookupValue = identifier || phoneNumber;

    if (!lookupValue || typeof lookupValue !== 'string') {
        console.warn(`[AUTH Warning] Forgot password rejected: Identifier or phone is missing/invalid.`);
        return res.status(400).json({ message: 'Email or phone is required' });
    }

    try {
        const value = lookupValue.trim();
        const isEmail = EMAIL_REGEX.test(value);
        const isPhone = PHONE_REGEX.test(value);

        if (!isEmail && !isPhone) {
            console.warn(`[AUTH Warning] Forgot password rejected: Identifier '${value}' is not a valid email or phone format.`);
            return res.status(400).json({ message: 'Identifier must be a valid phone number or email format' });
        }

        const phoneFromEmail = isEmail ? value.split('@')[0] : value;
        console.log(`[AUTH] Searching for user by phone number: '${phoneFromEmail}'`);

        const user = await prisma.user.findUnique({
            where: { phoneNumber: phoneFromEmail }
        });

        if (!user) {
            console.warn(`[AUTH Warning] Forgot password: No user exists for phone '${phoneFromEmail}'. Returning generic success to prevent email/phone enumeration.`);
            return res.json({
                success: true,
                message: 'If an account exists, password reset instructions are ready.'
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        console.log(`[AUTH] Generated reset token for user ID: ${user.id}. Saving reset token and 30-min expiry to database...`);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000)
            }
        });

        console.log(`[AUTH Success] Forgot password token saved and emitted to console log: '${token}'`);
        return res.json({ success: true, token });
    } catch (error) {
        console.error(`[AUTH Error] Forgot password request failed due to database or server error:`, error);
        return res.status(500).json({ message: 'Failed to process forgot password request', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    console.log(`[AUTH] Reset password request received. Body: ${sanitizeBody(req.body)}`);
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
        console.warn(`[AUTH Warning] Reset password rejected: Reset token is missing or invalid.`);
        return res.status(400).json({ message: 'Reset token is required' });
    }

    if (!newPassword || String(newPassword).length < 4) {
        console.warn(`[AUTH Warning] Reset password rejected: New password length is less than 4 characters.`);
        return res.status(400).json({ message: 'New password must be at least 4 characters long' });
    }

    try {
        console.log(`[AUTH] Verifying reset token in database...`);
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() }
            }
        });

        if (!user) {
            console.warn(`[AUTH Warning] Reset password rejected: Reset token is invalid or has expired.`);
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        console.log(`[AUTH] Token verified successfully for user: ${user.name} (${user.id}). Hashing new password...`);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`[AUTH] Saving new password and clearing reset token...`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        console.log(`[AUTH Success] Password successfully reset for user ID: ${user.id}`);
        return res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error(`[AUTH Error] Reset password failed due to server or database error:`, error);
        return res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

const login = async (req, res) => {
    console.log(`[AUTH] Login request received. Body: ${sanitizeBody(req.body)}`);
    const { phoneNumber, password } = req.body;

    try {
        console.log(`[AUTH] Searching database for user with phone: '${phoneNumber}'`);
        const user = await prisma.user.findUnique({
            where: { phoneNumber }
        });

        if (!user) {
            console.warn(`[AUTH Warning] Login rejected: No user found for phone '${phoneNumber}'`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[AUTH] User found: ${user.name} (${user.id}). Comparing password hashes...`);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.warn(`[AUTH Warning] Login rejected: Password mismatch for user ID: ${user.id}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[AUTH] Password validated successfully. Signing JWT token...`);
        if (!process.env.JWT_SECRET) {
            console.warn(`[AUTH Warning] JWT_SECRET is NOT set in environment variables! Using standard fallback secret key.`);
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'my_super_secret_key',
            { expiresIn: '24h' }
        );

        console.log(`[AUTH Success] User '${user.name}' successfully authenticated. JWT token signed and emitted.`);

        res.json({
            success: true,
            data: {
                token,
                refreshToken: token,
                user: {
                    id: user.id,
                    email: user.phoneNumber + '@placeholder.com',
                    fullName: user.name,
                    role: user.role,
                    phoneNumber: user.phoneNumber,
                    createdAt: user.createdAt.toISOString()
                }
            }
        });
    } catch (error) {
        console.error(`[AUTH Error] Login request failed due to database or server error:`, error);
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

