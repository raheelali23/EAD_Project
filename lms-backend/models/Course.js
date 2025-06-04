import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  materials: [materialSchema],
  assignments: [assignmentSchema],
  enrollmentKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add indexes for better query performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ enrollmentKey: 1 });
courseSchema.index({ teacher: 1 });
courseSchema.index({ enrolledStudents: 1 });

export default mongoose.model("Course", courseSchema);