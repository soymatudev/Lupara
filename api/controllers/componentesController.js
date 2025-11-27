const Logger = require('../utils/Logger');
const roleService = require('../services/roleService');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json({ roles });
    } catch (error) {
        Logger.error(`Error fetching roles: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}