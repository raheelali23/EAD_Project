import express from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  removeMaterial,
  enrollInCourse,
  unenrollFromCourse,
  getStudentCourses,
  getCourseDetails,
  getSubmissions,
  submitAssignment,
  getEnrolledStudents,
  removeStudentFromCourse,
  searchCourses,
  uploadMaterial,
  createAssignment,
  downloadMaterial,
  downloadAssignment
} from "../controllers/courseController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only pdf and doc files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed!'), false);
    }
  }
});

router.use((req, res, next) => {
  next();
});

router.get("/debug/test", (req, res) => {
  res.json({ message: "Courses router is working" });
});

// Public routes
router.get("/search", searchCourses);
router.get("/", getCourses);

// Teacher routes
router.post("/", auth, createCourse);
router.delete("/:id", auth, deleteCourse);
router.put("/:id", auth, updateCourse);
router.post("/:id/materials", auth, upload.single('file'), addMaterial);
router.delete("/:id/materials/:materialId", auth, removeMaterial);
router.get("/:id/materials/:materialId/download", auth, downloadMaterial);
router.post("/:id/assignments", auth, upload.single('file'), createAssignment);
router.get("/:id/assignments/:assignmentTitle/submissions", auth, getSubmissions);
router.post("/:id/assignments/:assignmentTitle/submit", auth, submitAssignment);
router.get("/:id/assignments/:assignmentId/download", auth, downloadAssignment);
router.get("/:id/students", auth, getEnrolledStudents);
router.delete("/:id/students/:studentId", auth, removeStudentFromCourse);

// Student routes
router.post("/:id/enroll", auth, enrollInCourse);
router.post("/:id/unenroll", auth, unenrollFromCourse);
router.get("/student/:userId", auth, getStudentCourses);

router.get("/:id", getCourseDetails);

// Get single course (public)
router.get("/:id", getCourse);
router.post('/:courseId/enroll', auth, enrollInCourse);
router.get('/student', auth, getStudentCourses); 

export default router;
