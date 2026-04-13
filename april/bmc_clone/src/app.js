import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import authRoute from "./modules/auth/auth.routes.js";
import bookingRoute from "./modules/booking_movie/booking.routes.js";
import seatRoute from "./modules/booking_movie/seat.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/seats", seatRoute);

// Serve frontend static files
const frontendPath = path.resolve(path.join(__dirname, "../frontend"));
app.use(express.static(frontendPath));

// Single Page App Routing - serve HTML files
const serveHTML = (filename) => (req, res) => {
  res.sendFile(path.join(frontendPath, `${filename}.html`));
};

app.get("/", serveHTML("index"));
app.get("/login", serveHTML("login"));
app.get("/register", serveHTML("register"));
app.get("/dashboard", serveHTML("dashboard"));
app.get("/booking", serveHTML("booking"));
app.get("/bookings", serveHTML("bookings"));
app.get("/profile", serveHTML("profile"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message, error: true });
});

// Catch-all for undefined routes (must be last)
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.originalUrl} not found`, error: true });
});

export default app;
