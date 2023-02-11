import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  emailOrId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

const User = mongoose.model("user", userSchema);
module.exports = User;
