import { Message } from "../models/index.js";

// DAO: acceso a la colección de mensajes en MongoDB.
export default class MessagesDAO {
  constructor(model = Message) {
    this.model = model;
  }

  async getAll() {
    const docs = await this.model.find().sort({ _id: 1 });
    return docs.map((d) => d.toJSON());
  }

  async getById(id) {
    const doc = await this.model.findById(id);
    return doc ? doc.toJSON() : null;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toJSON();
  }
}
