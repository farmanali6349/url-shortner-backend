import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import express from "express";
import { urlRouter } from "./routes/url.route.js";
import { userRouter } from "./routes/user.route.js";
import { isLoggedIn } from "./middlewares/auth.middleware.js";
import cors from "cors";

// Connecting With Database
connectDB();

const app = express();
// MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);
app.use(isLoggedIn);
// For Loggin

// For Catching Form Content In Json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: "Welcome to the url shortner project",
    user: req.user || "Not LoggedIn",
  });
});
// URL Routers
app.use("/api/v1/url", urlRouter);
app.use("/api/v1/user", userRouter);

// Listening Port
app.listen(ENV.port, () => {
  console.log(`http://localhost:${ENV.port}`);
});
