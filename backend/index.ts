import { connectToMongo } from "./db/db";
const express = require("express");
const auth = require("./routes/auth");
const notes = require("./routes/notes");

connectToMongo();
const app = express();
const port = 3001;

app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/notes", notes);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
