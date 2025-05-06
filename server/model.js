import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  Index: { type: Number, required: true },
  "First Name": { type: String, required: true },
  "Last Name": { type: String, required: true },
  Email: { type: String, required: true }
});

const user = mongoose.model('User', userSchema);

export default user;
