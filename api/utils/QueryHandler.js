const Logger = require('./Logger');
const { getConnection } = require('../config/db');

class QueryHandler {

    /**
     * @param {string} sql - The SQL query to execute
     * @param {Array} params - The parameters for the SQL query
     * @param {string} db - The database to use ('auth' or 'main')
     * @returns {Promise<object>} - The result of the query
     */
    static async execute(sql, params = [], db = 'main') {
        let pool = getConnection(db);
        try {

            let pgsql = sql;
            for(let i = 0; i < params.length; i++) pgsql = pgsql.replace(/\?/, `$${i + 1}`);

            const result = await pool.query(pgsql, params);

            if (pgsql.trim().toUpperCase().startsWith('SELECT')) {
                return result.rows;
            } else {
                return {
                    success: result.rowCount > 0,
                    affectedRows: result.rowCount,
                    insertId: result.rows.length > 0 ? result.rows[0].id : undefined
                };
            }

        } catch (error) {
            Logger.error(`Database ${db} query error: ${error.message}`);
            throw new Error('Database query failed');
        } finally {
            Logger.info(`Database ${db} connection released`); 
        }
    }
}

module.exports = QueryHandler;