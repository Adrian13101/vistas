import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, { _id, ...rest }) => ({ id: _id.toString(), ...rest }),
    },
  }
);

export default mongoose.model("Message", messageSchema);
