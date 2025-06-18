import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: String,
  deadline: Date,
  fileUrl: String,
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submissionUrl: String,
      submittedAt: Date,
      grade: Number,
      feedback: String
    }
  ]
});

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['video', 'document', 'link'] },
  filePath: String,
  originalFileName: String,
  mimeType: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

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

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ teacher: 1 });
courseSchema.index({ enrolledStudents: 1 });

export default mongoose.model("Course", courseSchema);
