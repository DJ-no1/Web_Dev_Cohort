import { Schema, model } from "mongoose";

const seatSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    isbooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Seat = model("Seat", seatSchema);
export default Seat;
