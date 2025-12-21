export const isAllowed = async (req, res, next) => {
  const user = req?.user;

  if (!user || !user?.email) {
    return res.status(401).json({
      statusCode: 401,
      success: false,
      message: "You are unauthorized",
      error: new Error("Unauthorized User"),
    });
  }

  next();
};
