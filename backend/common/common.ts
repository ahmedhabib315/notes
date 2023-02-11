import bcrypt = require("bcryptjs");

export async function getHashedPassword(req, password: string) {
  // Hashing Entered Password By User
  const salt = await bcrypt.genSalt(10);
  const secPassword = await bcrypt.hash(password, salt);

  req.secPassword = secPassword;
}
