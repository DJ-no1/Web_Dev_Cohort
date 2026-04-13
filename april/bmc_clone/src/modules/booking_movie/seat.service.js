import Seat from "./seat.model.js";
import ApiError from "../../common/utils/api-error.js";

const getSeats = async () => {
  const seats = await Seat.find().sort({ id: 1 });
  return seats;
};

const initializeSeats = async () => {
  const count = await Seat.countDocuments();
  if (count === 0) {
    const seats = Array.from({ length: 64 }, (_, i) => ({
      id: i + 1,
      isbooked: false,
    }));
    await Seat.insertMany(seats);
  }
};

export { getSeats, initializeSeats };
