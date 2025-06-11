const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  addMaterial,
  createAssignment,
  downloadAssignment
} = require('../controllers/courseController');

router.post('/', auth, createCourse);
router.get('/', auth, getCourses);
router.get('/:id', auth, getCourseById);
router.put('/:id', auth, updateCourse);
router.delete('/:id', auth, deleteCourse);
router.post('/:id/enroll', auth, enrollStudent);
router.post('/:id/materials', auth, upload.single('file'), addMaterial);
router.post('/:id/assignments', auth, upload.single('file'), createAssignment);
router.get('/:id/assignments/:assignmentId/download', auth, downloadAssignment);

module.exports = router;
