import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1, validate: Number.isInteger }, // minutos
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    available: { type: Boolean, required: true },
  },
  {
    versionKey: false,
    // Se expone `id` (string) en lugar de `_id`, igual que en la API original.
    toJSON: {
      transform: (_doc, { _id, ...rest }) => ({ id: _id.toString(), ...rest }),
    },
  }
);

export default mongoose.model("Service", serviceSchema);
