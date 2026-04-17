import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import authRoute from "./modules/auth/auth.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);

// // Serve frontend static files (simple test UI)
// const frontendPath = path.resolve("frontend");
// app.use(express.static(frontendPath));
// app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

// Catch-all for undefined routes
app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});
export default app;
