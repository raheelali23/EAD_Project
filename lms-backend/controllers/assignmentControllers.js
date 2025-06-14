import { Submission } from '../models/Submission.js';
import Course  from '../models/Course.js';

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id;

    const existing = await Submission.findOne({ assignmentId, studentId });

    if (existing) {
      return res.status(400).json({ message: "You have already submitted this assignment. Please edit or delete it." });
    }

    const submission = new Submission({
      assignmentId,
      courseId: req.body.courseId,
      studentId,
      filePath: req.file.filename,
      submittedAt: new Date(),
    });

    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submission failed." });
  }
};

export const editSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findOne({ _id: submissionId, studentId });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found or not authorized." });
    }

    submission.filePath = req.file.filename;
    submission.updatedAt = new Date();
    await submission.save();

    res.json({ message: "Submission updated.", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating submission." });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user._id;

    const deleted = await Submission.findOneAndDelete({ _id: submissionId, studentId });

    if (!deleted) {
      return res.status(404).json({ message: "Submission not found or not authorized." });
    }

    res.json({ message: "Submission deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting submission." });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email');
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load submissions." });
  }
};
