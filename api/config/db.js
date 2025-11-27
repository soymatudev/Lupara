const Logger = require('../utils/Logger');
const { Pool } = require('pg');
require('dotenv').config();

const secPool = new Pool({
    host: process.env.HOST_DB_SEC_DEV ?? process.env.HOST_DB_SEC_PROD,
    user: process.env.USER_DB_SEC_DEV ?? process.env.USER_DB_SEC_PROD,
    password: process.env.PASSWORD_DB_SEC_DEV ?? process.env.PASSWORD_DB_SEC_PROD,
    database: process.env.NAME_DB_SEC_DEV ?? process.env.NAME_DB_SEC_PROD,
    pool_mode: process.env.POOL_MODE_DB_SEC_PROD ?? process.env.POOL_MODE_DB_SEC_PROD,
    connectionLimit: 5
});

const mainPool = new Pool({
    host: process.env.HOST_DB_MAIN_DEV ?? process.env.HOST_DB_MAIN_PROD,
    user: process.env.USER_DB_MAIN_DEV ?? process.env.USER_DB_MAIN_PROD,
    password: process.env.PASSWORD_DB_MAIN_DEV ?? process.env.PASSWORD_DB_MAIN_PROD,
    database: process.env.NAME_DB_MAIN_DEV ?? process.env.NAME_DB_MAIN_PROD,
    pool_mode: process.env.POOL_MODE_DB_MAIN_DEV ?? process.env.POOL_MODE_DB_MAIN_PROD,
    connectionLimit: 5
});

/**
* @param {string} poolName - 'auth' or 'main'
* @returns {Promise<object>} - Object Pool 
*/

function getConnection (poolName) {
    try {
        const pool = poolName === 'auth' ? secPool : mainPool;
        const dbName = poolName === 'auth' ? 
            process.env.NAME_DB_AUTH_DEV  ?? process.env.NAME_DB_AUTH_PROD 
            : process.env.NAME_DB_MAIN_DEV ?? process.env.NAME_DB_MAIN_PROD;

        Logger.info(`Try connection to database: ${dbName}`);
        return pool;
    } catch (error) {
        Logger.error(`Database connection error: ${error.message}`);
        throw new Error(`Database connection failed ${poolName}`);
    }
}

function closePools() {
    /* secPool.end()
    .then(() => Logger.info('Auth DB pool has ended'))
    .catch(err => Logger.error(`Error ending Auth DB pool: ${err.message}`)); */

    mainPool.end()
    .then(() => Logger.info('Main DB pool has ended'))
    .catch(err => Logger.error(`Error ending Main DB pool: ${err.message}`));
}

function testConnection() {
    /* secPool.query('SELECT 1 + 1 AS result')
    .then(() => Logger.info('secPool DB connection test successful'))
    .catch(err => Logger.error(`secPool DB connection test failed: ${err.message}`)); */

    mainPool.query('SELECT 1 + 1 AS result')
    .then(() => Logger.info('Main DB connection test successful'))
    .catch(err => Logger.error(`Main DB connection test failed: ${err.message}`));

    return mainPool;
}

module.exports = { getConnection, closePools, testConnection };