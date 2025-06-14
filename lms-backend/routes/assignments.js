import express from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  submitAssignment,
  editSubmission,
  deleteSubmission,
  getSubmissionsByAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();

router.post('/:assignmentId/submit', auth, upload.single('file'), submitAssignment);
router.put('/:assignmentId/submit/:submissionId', auth, upload.single('file'), editSubmission);
router.delete('/:assignmentId/submit/:submissionId', auth, deleteSubmission);
router.get('/:assignmentId/submissions', auth, getSubmissionsByAssignment); // for teachers

export default router;
