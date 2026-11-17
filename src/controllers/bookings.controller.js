import { bookingsService } from "../container.js";

// Controllers: solo manejan HTTP (req/res). La lógica vive en el service.

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const created = await bookingsService.createBooking(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:bid
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.bid);
    res.status(200).json({ status: "success", payload: booking });
  } catch (error) {
    next(error);
  }
};

// POST /api/bookings/:bid/services/:sid
export const addServiceToBooking = async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const updated = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json({ status: "success", payload: updated });
  } catch (error) {
    next(error);
  }
};
