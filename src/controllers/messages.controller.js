import { messagesService } from "../container.js";

// GET /api/messages
export const getMessages = async (req, res, next) => {
  try {
    const messages = await messagesService.getMessages();
    res.status(200).json({ status: "success", payload: messages });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:mid
export const getMessageById = async (req, res, next) => {
  try {
    const message = await messagesService.getMessageById(req.params.mid);
    res.status(200).json({ status: "success", payload: message });
  } catch (error) {
    next(error);
  }
};

// POST /api/messages
export const createMessage = async (req, res, next) => {
  try {
    const created = await messagesService.createMessage(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (error) {
    next(error);
  }
};
