// src/controllers/serviceController.js
const prisma = require('../utils/prisma');

// Log helper (optional)
const logAction = async (userId, action, details) => {
  try {
    await prisma.systemLog.create({ data: { userId, action, details } });
  } catch (err) {
    console.error('Failed to log action', err);
  }
};

// ----- Services -----
const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        sector: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

const getCitizenServices = async (req, res) => {
  try {
    const sectors = await prisma.serviceSector.findMany({
      include: {
        services: {
          where: { mode: { in: ['APPOINTMENT', 'QUEUE'] } },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(sectors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch citizen services' });
  }
};

const getSupportServices = async (req, res) => {
  try {
    const sectors = await prisma.serviceSector.findMany({
      include: {
        services: {
          where: { mode: 'ONLINE' },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(sectors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch support services' });
  }
};

const getUnifiedServiceCatalog = async (_req, res) => {
  try {
    const sectors = await prisma.serviceSector.findMany({
      include: {
        services: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const allServices = sectors.flatMap((sector) =>
      (sector.services || []).map((service) => ({
        ...service,
        sectorName: sector.name,
      })),
    );

    const modules = {
      appointmentBooking: allServices.filter((item) => item.mode === 'APPOINTMENT'),
      queueManagement: allServices.filter((item) => item.mode === 'QUEUE'),
      onlineServices: allServices.filter((item) => item.mode === 'ONLINE'),
      serviceCategories: sectors.map((item) => ({ id: item.id, name: item.name, description: item.description })),
      departments: sectors.map((item) => ({ id: item.id, name: item.name })),
    };

    res.json({ sectors, modules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch unified service catalog' });
  }
};

const getServiceById = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

const createService = async (req, res) => {
  const { name, description, sectorId, mode, availability, icon } = req.body;
  try {
    if (!name || !sectorId || !mode) {
      return res.status(400).json({ error: 'name, sectorId and mode are required' });
    }

    const service = await prisma.service.create({
      data: { name, description, sectorId, mode, availability, icon },
    });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, mode, sectorId, availability, icon } = req.body;
  try {
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, mode, sectorId, availability, icon },
    });
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// ----- Sectors -----
const getAllSectors = async (req, res) => {
  try {
    const sectors = await prisma.serviceSector.findMany({
      include: {
        services: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(sectors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sectors' });
  }
};

const createSector = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const sector = await prisma.serviceSector.create({
      data: { name, description, icon },
    });
    res.status(201).json(sector);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sector' });
  }
};

const updateSector = async (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;
  try {
    const sector = await prisma.serviceSector.update({
      where: { id },
      data: { name, description, icon },
    });
    res.json(sector);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update sector' });
  }
};

const deleteSector = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.serviceSector.delete({ where: { id } });
    res.json({ message: 'Sector deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete sector' });
  }
};

module.exports = {
  getAllServices,
  getCitizenServices,
  getSupportServices,
  getUnifiedServiceCatalog,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllSectors,
  createSector,
  updateSector,
  deleteSector,
};