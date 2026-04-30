import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const [{ default: connectDB }, { default: app }] = await Promise.all([
  import("./src/common/config/db.js"),
  import("./src/app.js"),
]);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `Server is running at ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
