import { Service } from "../models/index.js";

// Búsqueda exacta pero sin distinguir mayúsculas ni tildes ("estetica" encuentra "Estética").
// Se arma una regex donde cada letra acepta sus variantes con tilde.
const VARIANTS = { a: "áàäâãå", e: "éèëê", i: "íìïî", o: "óòöôõ", u: "úùüû", n: "ñ", c: "ç" };
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const accentInsensitive = (text) => {
  const base = String(text).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const pattern = [...base]
    .map((ch) => {
      const chars = ch + (VARIANTS[ch] ?? "");
      return VARIANTS[ch] ? `[${chars}${chars.toUpperCase()}]` : escapeRegex(ch);
    })
    .join("");
  return new RegExp(`^${pattern}$`, "i");
};

// DAO: único lugar que sabe CÓMO se guardan los servicios (ahora, MongoDB con Mongoose).
// No tiene reglas de negocio ni conoce req/res. Devuelve objetos planos (toJSON) o null.
export default class ServicesDAO {
  constructor(model = Service) {
    this.model = model;
  }

  // Filtros opcionales: { category?: string, available?: boolean }
  async getAll({ category, available } = {}) {
    const query = {};
    if (category !== undefined) query.category = accentInsensitive(category);
    if (available !== undefined) query.available = available;

    const docs = await this.model.find(query).sort({ _id: 1 });
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

  async update(id, data) {
    // El id nunca se toca: $set solo recibe los campos permitidos.
    const doc = await this.model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    return doc ? doc.toJSON() : null;
  }

  async delete(id) {
    const doc = await this.model.findByIdAndDelete(id);
    return doc ? doc.toJSON() : null;
  }
}
