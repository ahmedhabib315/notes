const jwt = require("jsonwebtoken");
const JWT_SECRET = "SecretWebToken";

export const fetchUser = async (req, res, next) => {
  //Get Token From the Header
  const token = req.header("auth-token");

  //If Token is not available then throw error
  if (!token) {
    return res
      .status(401)
      .json({ error: "Please Authenticate Using Valid TOken" });
  }

  try {
    //Verify If Token is ours and send it in request to verify
    const data = await jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Please Authenticate Using Valid TOken" });
  }
};
