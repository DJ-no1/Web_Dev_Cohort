import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showId: {
      type: String,
      required: true,
      default: "1",
    },
    showName: {
      type: String,
      default: "Dhurandhar The Revenge",
    },
    seatIds: [
      {
        type: Number,
        required: true,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

const Booking = model("Booking", bookingSchema);
export default Booking;
