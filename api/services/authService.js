const Logger = require('../utils/Logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Mailer = require('../utils/Mailer');
const QueryHandler = require('../utils/QueryHandler');
require('dotenv').config();

// Cabe aclarar que todo esto hay que modificarlo y completarlo segun lo que nos pase el equipo de DB

/**
 * 
 * @param {string} correo 
 * @param {string} password 
 * @returns 
 */
exports.userLogin = async (correo, password) => {
    try {
        const sql = 'SELECT id, nombre, password_hash, 1 as role FROM reserva.usuarios WHERE correo = ?';
        const results = await QueryHandler.execute(sql, [correo], 'main');

        if (results.length === 0) {
            Logger.warn(`User login failed: user not found`);
            return { success: false, message: 'Invalid username or password' };
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            Logger.warn(`User login failed: incorrect password for user ${user.nombre}`);
            return { success: false, message: 'Invalid username or password' };
        }

        const token = jwt.sign(
            { UserId: user.id, nombre: user.nombre, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        Logger.info(`User ${user.nombre} logged in successfully`);
        return { success: true, token, UserId: user.id, nombre: user.nombre };
    } catch (error) {
        Logger.error(`User login error: ${error.message}`);
        throw new Error('User login failed');
    }
}

/** 
 * @param {number} id_rol
 * @param {string} nombre 
 * @param {string} apellido_paterno
 * @param {string} apellido_materno
 * @param {string} correo
 * @param {string} password 
 * @returns 
 */
exports.userCreate = async (id_rol, nombre, apellido_paterno, apellido_materno, correo, password) => {
    try {
        const saltRounds = parseInt(process.env.HASH_ROUNDS);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const sql = 'insert into reserva.usuarios (id_rol, nombre, apellido_paterno, apellido_materno, correo, password_hash)' 
        + 'values (?, ?, ?, ?, ?, ?) RETURNING id';
        const result = await QueryHandler.execute(sql, [ id_rol, nombre, apellido_paterno, apellido_materno, correo, passwordHash ], 'main');
        
        if (result.success) {
            Logger.info(`User ${nombre} created successfully`);

            const token = jwt.sign(
                { UserId: result.id, nombre: nombre, role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return { success: true, token, userId: result.insertId.toString(), nombre: nombre };
        } else {
            Logger.warn(`User creation failed for ${nombre}`);
            return { success: false, message: 'User creation failed' };
        }
    } catch (error) {
        Logger.error(`User creation error: ${error.message}`);
        throw new Error('User creation failed');
    }
}

exports.forgotPassword = async (email) => {
    try {
        const user = await QueryHandler.execute(`select id 
        from reserva.usuarios where correo = ?`, [email], 'main');

        if (user.length === 0) {
            Logger.warn(`Password reset requested for non-existent email: ${email}`);
            return { success: false };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000);

        await QueryHandler.execute(`update reserva.usuarios 
        set reset_token = ?, reset_token_expiry = ? 
        where correo = ?`, [resetToken, tokenExpiry, email], 'main');

        let = resetUrl =""
        resetUrl = `${process.env.FRONTEND_URL}/views/forgot-password/index.html?token=${resetToken}`;
        Logger.info(`Generated password reset URL for ${email}: ${resetUrl}`);
        const result = await Mailer.sendResetPasswordEmail(email, resetUrl);
        Logger.info(`Password reset email sent to: ${email}`);
        return { success: true }
    } catch (error) {
        Logger.error(`Forgot password error: ${error.message}`);
        throw new Error('Forgot password process failed');
    }

}

exports.resetPassword = async (token, newPassword) => {
    try {
        const user = await QueryHandler.execute(`select id, reset_token_expiry 
        from reserva.usuarios where reset_token = ?`, [token], 'main');

        if (user.length === 0 || new Date() > new Date(user[0].reset_token_expiry)) {
            Logger.warn(`Invalid or expired password reset token: ${token}`);
            return { success: false, message: 'Invalid or expired token' };
        }

        const saltRounds = parseInt(process.env.HASH_ROUNDS);
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await QueryHandler.execute(`update reserva.usuarios 
        set password_hash = ?, reset_token = NULL, reset_token_expiry = NULL 
        where id = ?`, [passwordHash, user[0].id], 'main');

        Logger.info(`Password reset successfully for user ID: ${user[0].id}`);
        return { success: true };
    } catch (error) {
        Logger.error(`Reset password error: ${error.message}`);
        throw new Error('Reset password process failed');
    }
}

exports.verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.UserId, nombre: decoded.nombre, role: decoded.role };
    } catch (error) {
        Logger.error(`Token verification error: ${error.message}`);
        throw new Error('Invalid or expired token');
    }
}