import { verifyToken } from "../utils/jwt.util.js";

export const isLoggedIn = (req, res, next) => {
  req.user = null;
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next();
  }

  const token = req.headers["authorization"].split("Bearer ")[1];
  if (!token) {
    return next();
  }

  const data = verifyToken(token);

  if (!data) {
    return next();
  }

  req.user = data;
  next();
};
