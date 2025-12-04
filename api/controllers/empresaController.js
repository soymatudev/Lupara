const Logger = require('../utils/Logger');
const empresaService = require('../services/empresaService');

exports.getAllEmpresasInfo = async (req, res) => {
    try {
        const empresaInfo = await empresaService.getAllEmpresasInfo();
        res.status(200).json(empresaInfo);
    } catch (error) {
        Logger.error(`Error fetching empresa info: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getFeatured = async (req, res) => {
    try {
        const featuredItems = await empresaService.getFeaturedEmpresas();
        res.status(200).json(featuredItems);
    } catch (error) {
        Logger.error(`Error fetching featured items: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}