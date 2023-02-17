const express = require("express");
const router = express.Router();
const User = require("../models/user");
import { body, validationResult } from "express-validator";
import { fetchUser } from "../middleware/fetch-user";
import Notes = require("../models/Notes");

//Create a Note Using POST "/api/notes/create", Require Auth
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
      const lastUpdated = new Date();

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
        lastUpdated,
      });

      const savedNote = await note.save();

      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

//Fetch All notes Using Get "/api/notes/fetchnotes", Require Auth
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

//Update a Note Using PUT "/api/notes/update", Require Auth
router.put(
  "/update/:id",
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

    let { user } = req;

    const { title, description, tags } = req.body;
    const noteId = req.params.id;
    try {
      const userId = user.id;
      const userData = await User.findById(userId).select("-password");

      if (!userData) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      const updatedData = {};

      if (title) updatedData["title"] = title;

      if (description) updatedData["description"] = description;

      if (tags) updatedData["tags"] = tags;

      updatedData["lastUpdated"] = new Date();

      let note = await Notes.findById(noteId);

      if (!note) {
        return res.status(404).send("Not Found");
      }

      if (note.user.toString() !== userId) {
        return res
          .json(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      note = await Notes.findByIdAndUpdate(
        noteId,
        { $set: updatedData },
        { new: true }
      );
      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

//Delete a Note Using PUT "/api/notes/update", Require Auth
router.delete(
  "/delete/:id",
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

    let { user } = req;

    const { title, description, tags } = req.body;
    const noteId = req.params.id;
    try {
      const userId = user.id;
      const userData = await User.findById(userId).select("-password");

      if (!userData) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      const updatedData = {};

      if (title) updatedData["title"] = title;

      if (description) updatedData["description"] = description;

      if (tags) updatedData["tags"] = tags;

      updatedData["lastUpdated"] = new Date();

      let note = await Notes.findById(noteId);

      if (!note) {
        return res.status(404).send("Not Found");
      }

      if (note.user.toString() !== userId) {
        return res
          .status(400)
          .json({ error: "Please Login with Correct Credentials" });
      }

      note = await Notes.findByIdAndDelete(noteId);
      res.send("Note Has Been Deleted");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Some Internal Error Occured");
    }
  }
);

export = router;
