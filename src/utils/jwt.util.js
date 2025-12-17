import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// Create token with expiration and algorithm
export const createToken = data => {
  return jwt.sign(data, ENV.jwtSecret, {
    expiresIn: "1h",
    algorithm: "HS256",
  });
};

export const verifyToken = token => {
  try {
    const decoded = jwt.verify(token, ENV.jwtSecret, {
      algorithms: ["HS256"],
    });
    return decoded;
  } catch (err) {
    return null;
  }
};
