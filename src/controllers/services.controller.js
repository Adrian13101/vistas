import { servicesService } from "../container.js";

// Controllers: solo manejan HTTP (req/res). La lógica vive en el service.
// Los errores (400, 404...) los lanza el service y los resuelve el middleware de app.js.

// GET /api/services?category=peluquería&available=true
export const getServices = async (req, res, next) => {
  try {
    const services = await servicesService.getServices(req.query);
    res.status(200).json({ status: "success", payload: services });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:sid
export const getServiceById = async (req, res, next) => {
  try {
    const service = await servicesService.getServiceById(req.params.sid);
    res.status(200).json({ status: "success", payload: service });
  } catch (error) {
    next(error);
  }
};

// POST /api/services
export const createService = async (req, res, next) => {
  try {
    const created = await servicesService.createService(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    next(error);
  }
};

// PUT /api/services/:sid
export const updateService = async (req, res, next) => {
  try {
    const updated = await servicesService.updateService(req.params.sid, req.body);
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/services/:sid
export const deleteService = async (req, res, next) => {
  try {
    const deleted = await servicesService.deleteService(req.params.sid);
    res.status(200).json({ status: "success", message: "Servicio eliminado", payload: deleted });
  } catch (error) {
    next(error);
  }
};
