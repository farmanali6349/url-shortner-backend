import { Router } from "express";
import bcrypt from "bcrypt";
const userRouter = Router();
import { User } from "../model/user.model.js";
import { createToken } from "../utils/jwt.util.js";

userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "All fields are required",
      error: new Error("All fields are required"),
      data: null,
    });
  }

  // Checks if user already exists
  const isAlreadyExist = await User.findOne({ email: email });

  if (isAlreadyExist) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "User already exist.",
      error: new Error("User already exist"),
      data: null,
    });
  }

  // Create A New User
  try {
    const newUser = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "User Created Successfully.",
      data: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error?.message || "Server Side Error :: Creating User",
      error,
      data: null,
    });
  }
});
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Email or Password is missing.",
      error: new Error("Email or Password is missing."),
      data: null,
    });
  }
  try {
    // Checks if user already exists
    const user = await User.findOne({ email: email });
    console.log("user");
    console.log(user);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "User not found, Please Sign Up First.",
        error: new Error("User not found"),
        data: null,
      });
    }

    // Compare

    const authenticated = await user.comparePassword(password);
    if (!authenticated) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Email or Password is wrong.",
        error: new Error("Email or Password is wrong."),
        data: null,
      });
    }

    const token = createToken({ id: user._id, name: user.name, email: user.email });

    if (!token) {
      throw new Error("Loggin Token Not Generated");
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "You are loggedin.",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error?.message || "Server Side Error :: Login User",
      error,
      data: null,
    });
  }
});

export { userRouter };
