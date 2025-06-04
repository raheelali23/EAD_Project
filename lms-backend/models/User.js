import mongoose  from "mongoose";

const User= new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher"], required: true },
  registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
});

export default  mongoose.model("User", User);
