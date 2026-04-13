import * as seatService from "./seat.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const getSeats = async (req, res) => {
  const seats = await seatService.getSeats();
  ApiResponse.ok(res, "Seats retrieved", seats);
};

export { getSeats };
