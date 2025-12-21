const jwt = require("jsonwebtoken");
const Logger = require("../utils/Logger");
require("dotenv").config();

exports.checkAuth = (req, res, next) => {
    const token = req.cookies.access_token || req.headers["authorization"];
    
    if (!token) {
        Logger.info("No access token found in request");
        return res.status(401).json({ 
            success: false, 
            message: 'No tienes permiso para acceder. Por favor, inicia sesión.' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.UserId, username: decoded.username };
        next();
    } catch (error) {
        Logger.warn("Invalid access token: " + error.message);
        return res.status(401).json({ 
            success: false, 
            message: 'Sesión expirada o inválida. Inicia sesión de nuevo.' 
        });
    }
};

module.exports = exports.checkAuth;