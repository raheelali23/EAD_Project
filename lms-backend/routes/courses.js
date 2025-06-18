import express from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  addMaterial,
  createAssignment,
  downloadAssignment,
  searchCourses,
  removeMaterial,
  getStudentCourses
} from '../controllers/courseController.js';

const router = express.Router();

// Search and student-specific routes
router.get('/search', auth, searchCourses);
router.get('/student/:studentId', auth, getStudentCourses);

// Basic CRUD routes
router.post('/', auth, createCourse);
router.get('/', auth, getCourses);
router.get('/:id', auth, getCourse);
router.put('/:id', auth, updateCourse);
router.delete('/:id', auth, deleteCourse);
router.delete('/:courseId/materials/:materialId', auth, removeMaterial);

// Enrollment routes
router.post('/:id/enroll', auth, enrollInCourse);
router.post('/:id/unenroll', auth, unenrollFromCourse);

// Material and assignment routes
router.post('/:id/materials', auth, upload.single('file'), addMaterial);
router.post('/:id/assignments', auth, upload.single('file'), createAssignment);
router.get('/:id/assignments/:assignmentId/download', auth, downloadAssignment);

export default router; 