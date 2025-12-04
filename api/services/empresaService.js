const Logger = require('../utils/Logger');
const QueryHandler = require('../utils/QueryHandler');

/**
 * @returns {Promise<Object>} Empresa information
 */
exports.getAllEmpresasInfo = async () => {
    const sql = `SELECT p.id, p.nombre_proveedor as name, p.direccion as location,
    p.descripcion_corta, p.descripcion_larga, p.rating_promedio, c.nombre_categoria AS service
    FROM reserva.proveedores p, reserva.categorias_servicio c
    WHERE p.id_categoria = c.id`;
    try {
        const results = await QueryHandler.execute(sql, [], 'main');
        Logger.info('Fetched empresa information');
        return results;
    } catch (error) {
        Logger.error(`Error fetching empresa info from database: ${error.message}`);
        throw new Error('Failed to fetch empresa info');
    }
}

/**
 * @returns {Promise<Array>} Featured items
 */
exports.getFeaturedEmpresas = async () => {
    const sql = `select p.id, p.nombre_proveedor as name, p.descripcion_corta, p.direccion as location, 
    p.rating_promedio, p.es_destacado, c.nombre_categoria AS service, url as imageUrl
    from reserva.proveedores p, reserva.categorias_servicio c, recursos.activo a
    where p.id_categoria = c.id
    and p.es_destacado = TRUE and p.id IS NOT NULL
    and p.id = a.id_proveedor
    ORDER BY p.rating_promedio DESC, p.fecha_registro DESC
    `;
    try {
        const results = await QueryHandler.execute(sql, [], 'main');
        Logger.info(`Fetched ${results.length} featured items`);
        return results;
    } catch (error) {
        Logger.error(`Error fetching featured items from database: ${error.message}`);
        throw new Error('Failed to fetch featured items');
    }
}