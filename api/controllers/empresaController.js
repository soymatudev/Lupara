const Logger = require("../utils/Logger");
const empresaService = require("../services/empresaService");

exports.getAllEmpresasInfo = async (req, res) => {
  try {
    const empresaInfo = await empresaService.getAllEmpresasInfo();
    res.status(200).json(empresaInfo);
  } catch (error) {
    Logger.error(`Error fetching empresa info: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmpresaById = async (req, res) => {
  const empresaId = req.params.id;
  try {
    const empresaDetails = await empresaService.getEmpresaById(empresaId);
    res.status(200).json(empresaDetails);
  } catch (error) {
    Logger.error(`Error fetching empresa by ID: ${error.message}`);
    if (error.message === "Empresa not found") {
      res.status(404).json({ message: "Empresa not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getEmpresaImages = async (req, res) => {
  const empresaId = req.params.id;
  try {
    const images = await empresaService.getEmpresaImages(empresaId);
    res.status(200).json(images);
  } catch (error) {
    Logger.error(`Error fetching empresa images: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmpresaMaps = async (req, res) => {
  const empresaId = req.params.id;
  try {
    const maps = await empresaService.getEmpresaMaps(empresaId);
    res.status(200).json(maps);
  } catch (error) {
    Logger.error(`Error fetching empresa maps: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmpresaSlots = async (req, res) => {
  const empresaId = req.params.id;
  const selectDate = req.params.date || null;
  try {
    const slots = await empresaService.getEmpresaSlots(empresaId, selectDate);
    res.status(200).json(slots);
  } catch (error) {
    Logger.error(`Error fetching empresa slots: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const featuredItems = await empresaService.getFeaturedEmpresas();
    res.status(200).json(featuredItems);
  } catch (error) {
    Logger.error(`Error fetching featured items: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
