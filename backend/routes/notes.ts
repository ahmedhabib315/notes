const express = require("express");
const router = express.Router();
const User = require("../models/user");
import { body, validationResult } from "express-validator";
import { fetchUser } from "../middleware/fetch-user";
import Notes = require("../models/Notes");

//Create a User Using POST "/api/notes/create", Require Auth
router.post(
  "/create",
  fetchUser,
  [
    body("title", "Please Enter a Title").exists(),
    body("description", "Please Enter a Description").exists(),
  ],
  async (req, res) => {
    //Set Errors if Wrong Values is Passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags } = req.body;
    let { user } = req;
    try {
      const userId = user.id;
      const userData = await User.findById(userId).select("-password");

      const createdAt = new Date();

      if (!userData) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      const note = await new Notes({
        title,
        description,
        tags,
        user: userId,
        createdAt,
      });

      const savedNote = await note.save();

      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

//Create a User Using POST "/api/notes/fetchnotes", Require Auth
router.get("/fetchnotes", fetchUser, async (req, res) => {
  //Set Errors if Wrong Values is Passed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { user } = req;
  try {
    const userId = user.id;
    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(400)
        .json({ error: "Please Login with Correct Credentials" });
    }

    const notes = await Notes.find({ user: userId });

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Some Internal Error Occured");
  }
});

export = router;
