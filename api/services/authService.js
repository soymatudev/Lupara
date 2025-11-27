const Logger = require('../utils/Logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

            return { success: true, token, userId: result.insertId.toString() };
        } else {
            Logger.warn(`User creation failed for ${nombre}`);
            return { success: false, message: 'User creation failed' };
        }

    } catch (error) {
        Logger.error(`User creation error: ${error.message}`);
        throw new Error('User creation failed');
    }
}