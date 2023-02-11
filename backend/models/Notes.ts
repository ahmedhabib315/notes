import mongoose from "mongoose";
const { Schema } = mongoose;

const notesSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    reference: 'user',
  },
  tags: {
    type: String,
    default: "General",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  lastUpdated: {
    type: Date,
  },
});

export = mongoose.model("notes", notesSchema);
