import Booking from "./booking.model.js";
import Seat from "./seat.model.js";
import ApiError from "../../common/utils/api-error.js";

const createBooking = async (userId, { showId, seatIds, totalPrice }) => {
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    throw ApiError.badRequest("At least one seat must be selected");
  }

  // Check if seats are available
  const bookedSeats = await Seat.find({
    id: { $in: seatIds },
    isbooked: true,
  });

  if (bookedSeats.length > 0) {
    throw ApiError.conflict(
      `Seats ${bookedSeats.map((s) => s.id).join(", ")} are already booked`,
    );
  }

  // Mark seats as booked
  await Seat.updateMany(
    { id: { $in: seatIds } },
    { isbooked: true, bookedBy: userId },
  );

  // Create booking record
  const booking = await Booking.create({
    userId,
    showId: showId || "1",
    seatIds,
    totalPrice,
  });

  return booking;
};

const getBookings = async (userId) => {
  const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
  return bookings;
};

const getBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) throw ApiError.notFound("Booking not found");
  return booking;
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) throw ApiError.notFound("Booking not found");

  if (booking.status === "cancelled") {
    throw ApiError.badRequest("Booking is already cancelled");
  }

  // Release seats
  await Seat.updateMany(
    { id: { $in: booking.seatIds } },
    { isbooked: false, bookedBy: null },
  );

  // Update booking status
  booking.status = "cancelled";
  await booking.save();

  return booking;
};

export { createBooking, getBookings, getBooking, cancelBooking };
