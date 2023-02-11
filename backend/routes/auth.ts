const User = require("../models/user");
const jwt = require("jsonwebtoken");
import bcrypt = require("bcryptjs");
import { body, validationResult } from "express-validator";
import express = require("express");
import { fetchUser } from "../middleware/fetch-user";
import { getHashedPassword } from "../common/common";
const router = express.Router();

const JWT_SECRET = "SecretWebToken";

//Create a User Using POST "/api/auth/create", Does not require Auth
router.post(
  "/create",
  [
    body("name", "Name Should Contain more than 2 words").isLength({ min: 2 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Enter a Valid Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //Set Errors if Wrong Values is Passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //Check if a User already Exists
      let user = await User.findOne({ emailOrId: req.body.email });

      //If Exists then throw error
      if (user) {
        return res
          .status(400)
          .json({ error: "User Already Exist with this Email" });
      }

      // Hashing Entered Password By User
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        emailOrId: req.body.email,
        password: secPassword,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      }).then((user) => res.json(user));

      const data = {
        user: {
          id: user.id,
        },
      };

      //Create an AuthToken
      const authToken = await jwt.sign(data, JWT_SECRET);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

//Login a User Using POST "/api/auth/login", Does not require Auth
router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Please Enter a Password").exists(),
  ],
  async (req, res) => {
    //Set Errors if Wrong Values is Passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //Check if a User already Exists
      let user = await User.findOne({ emailOrId: email });

      //If User Doesn't exists then throw error
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      //Check Password
      const passwordCompare = await bcrypt.compare(password, user.password);

      //If Password Doesn't Match then throw error
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      //Create an AuthToken
      const authToken = await jwt.sign(payload, JWT_SECRET);

      res.json(authToken);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

// Get Logged in User Details using POST "/api/auth/getuser", Login required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    //Get User Id from request and verify if User exists
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(400)
        .json({ error: "Please Login with Correct Credentials" });
    }

    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Some Internal Error Occured");
  }
});

//Update Password of Logged in User Using POST "api/auth/update"
router.post(
  "/update",
  fetchUser,
  [
    body("newPassword", "Please Enter New Password").exists(),
    body("confirmNewPassword", "Please Confirm New Password").exists(),
  ],
  async (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;

    try {
      if (!newPassword || !confirmNewPassword) {
        return res
          .status(400)
          .json({ error: "Please Enter and Confirm New Password" });
      }
      if (newPassword != confirmNewPassword) {
        return res.status(400).json({ error: "New Passwords Do Not Match" });
      }

      // Hashing Entered Password By User
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(newPassword, salt);

      const data = {};
      data["password"] = secPassword;
      data["lastUpdated"] = new Date();

      //Get User Id from request and verify if User exists
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      User.findByIdAndUpdate(userId, data, (err, doc) => {
        if (err) {
          console.error(err);
          return res.json({ error: "Some Error Occured in Your Request" });
        } else if (doc) {
          return res.json(doc);
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

export = router;
