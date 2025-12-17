import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import express from "express";
import { urlRouter } from "./routes/url.route.js";
import { userRouter } from "./routes/user.route.js";
// Connecting With Database
connectDB();

const app = express();

// MIDDLEWARES

// For Catching Form Content In Json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL Routers
app.use("/api/v1/url", urlRouter);
app.use("/api/v1/user", userRouter);

// Listening Port
app.listen(ENV.port, () => {
  console.log(`http://localhost:${ENV.port}`);
});
