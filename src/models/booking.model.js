import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM (24 hs)
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_doc, { _id, services, ...rest }) => ({
        id: _id.toString(),
        ...rest,
        services: services.map(String),
      }),
    },
  }
);

export default mongoose.model("Booking", bookingSchema);
