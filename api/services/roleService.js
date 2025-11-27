const Logger = require('../utils/Logger');
const QueryHandler = require('../utils/QueryHandler');

exports.getAllRoles = async () => {
    try {
        const sql = 'SELECT * FROM permisos.rol';
        const results = await QueryHandler.execute(sql, [], 'main');
        
        Logger.info(`Fetched ${results.length} roles from database`);
        return results;
    } catch (error) {
        Logger.error(`User login error: ${error.message}`);
        throw new Error('User login failed');
    }
}
