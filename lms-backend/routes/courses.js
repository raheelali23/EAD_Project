import express from "express"
const router = express.Router();
import  {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getStudentCourses,
  getCourseDetails,
  getEnrolledStudents,
  removeStudentFromCourse,
  searchCourses
} from "../controllers/courseController.js"
import multer from "multer"
import path from "path"
import auth from  "../middleware/auth.js"

// Debug middleware for this router
router.use((req, res, next) => {
  // console.log('Courses Router:', req.method, req.originalUrl);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Debug route to test if router is working
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
// router.post("/:id/materials", auth, upload.single("file"), addMaterial);
// router.delete("/:id/materials/:materialId", auth, removeMaterial);
// router.get("/:id/materials/:materialId/download", auth, downloadMaterial);
// router.post("/:id/assignments", auth, createAssignment);
// router.get("/:id/assignments/:assignmentTitle/submissions", auth, getSubmissions);
// router.post("/:id/assignments/:assignmentTitle/submit", auth, submitAssignment);
router.get("/:id/students", auth, getEnrolledStudents);
router.delete("/:id/students/:studentId", auth, removeStudentFromCourse);

// Student routes
router.post("/:id/enroll", auth, enrollInCourse);
router.post("/:id/unenroll", auth, unenrollFromCourse);
router.get("/student/:userId", auth, getStudentCourses);

// Course details route (should be last to avoid conflicts)
router.get("/:id", getCourseDetails);

// Get single course (public)
router.get("/:id", getCourse);
router.post('/:courseId/enroll', auth, enrollInCourse);
router.get('/student', auth, getStudentCourses); 

export default router;
