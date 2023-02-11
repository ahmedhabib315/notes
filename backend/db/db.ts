import mongoose from "mongoose";
const mongooseUri = "mongodb://0.0.0.0:27017/?directConnection=true";

mongoose.set("strictQuery", true);

export const connectToMongo = () => {
  mongoose
    .connect(mongooseUri)
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((err) => {
      console.log("Not Connected to Database ERROR! ", err);
    });
};
