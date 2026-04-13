import * as bookingService from "./booking.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  ApiResponse.created(res, "Booking created successfully", booking);
};

const getBookings = async (req, res) => {
  const bookings = await bookingService.getBookings(req.user.id);
  ApiResponse.ok(res, "Bookings retrieved", bookings);
};

const getBooking = async (req, res) => {
  const booking = await bookingService.getBooking(
    req.params.bookingId,
    req.user.id,
  );
  ApiResponse.ok(res, "Booking details", booking);
};

const cancelBooking = async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.bookingId,
    req.user.id,
  );
  ApiResponse.ok(res, "Booking cancelled", booking);
};

export { createBooking, getBookings, getBooking, cancelBooking };
