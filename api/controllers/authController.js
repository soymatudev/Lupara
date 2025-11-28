const Logger = require('../utils/Logger');
const authService = require('../services/authService');

exports.userLogin = async (req, res) => {
    const {useremail, password} = req.body;
    Logger.info('Received login request' + useremail + password);
    Logger.info(`Login attempt for email: ${
        JSON.stringify(req.body)
    }`);
    if (!useremail || !password) {
        Logger.warn('Email or password missing in request body');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await authService.userLogin(useremail, password);
        if (result.success) {
            // quitar el token del return
            res.cookie('access_token', result.token, 
            { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })
            .status(200)
            .json({ message: 'Login successful', userId: result.UserId, nombre: result.nombre, token: result.token });

        } else {
            res.status(401).json({ message: result.message });
        }
    } catch (error) {
        Logger.error(`Admin login error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.userCreate = async (req, res) => {
    const {id_rol, nombre, apellido_paterno, apellido_materno, useremail, password} = req.body;

    /* if (!useremail || !password) {
        Logger.warn('Mail or password missing in request body');
        return res.status(400).json({ message: 'Username and password are required' });
    } */

    try {
        const result = await authService.userCreate(id_rol, nombre, apellido_paterno, apellido_materno, useremail, password);
        if (result.success) {
            
            res.cookie('access_token', result.token, 
            { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })
            .status(201)
            .json({ message: 'User created successfully', userId: result.userId, nombre: nombre,  token: result.token });
        } else {
            return res.status(400).json({ message: result.message });
        }
    } catch (error) {
        Logger.error(`Admin registration error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.userLogout = (req, res) => {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Logout successful' });
    res.sendFile('/views/auth/index.html', { root: 'frontend' });
    Logger.info('User logged out successfully');
}

/* Codigo para comprobar token

const token = req.cookies.access_token;

    if(!token) {
        Logger.info('No access token found in cookies');
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    } catch {
        Logger.warn('Invalid token during logout');
        res.status(400).json({ message: 'Invalid token' });
    }

*/