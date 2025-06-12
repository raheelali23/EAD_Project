import Course from "../models/Course.js";
import User from "../models/User.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get submissions for an assignment
export const getSubmissions = async (req, res) => {
  try {
  const { courseId, assignmentTitle } = req.params;

    const course = await Course.findById(courseId)
      .populate("assignments.submissions.student", "name email");
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

  const assignment = course.assignments.find(a => a.title === assignmentTitle);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

  res.json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
  const { courseId } = req.params;
  const { studentId, assignmentTitle, submissionUrl } = req.body;

  const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

  const assignment = course.assignments.find(a => a.title === assignmentTitle);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if student is already enrolled
    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(403).json({ message: "Student is not enrolled in this course" });
    }

    // Add submission
  assignment.submissions.push({
    student: studentId,
    submissionUrl,
    submittedAt: new Date()
  });

  await course.save();
    res.json({ message: "Submission saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single course
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get course details
export const getCourseDetails = async (req, res) => {
  try {
  const course = await Course.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("enrolledStudents", "name email")
      .populate("assignments.submissions.student", "name email");
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

  res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create course
export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const teacherId = req.user.id;

    const course = new Course({
      title,
      description,
      teacher: teacherId,
      enrollmentKey: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    course.title = title || course.title;
    course.description = description || course.description;
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const enrollInCourse = async (req, res) => {
  const studentId = req.user.id;
  const courseId = req.params.id;
  const { enrollmentKey } = req.body; 


  if (!enrollmentKey) {
    return res.status(400).json({ message: "Enrollment key is required" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if the enrollment key matches
    if (course.enrollmentKey !== enrollmentKey) {
      return res.status(400).json({ message: "Invalid enrollment key" });
    }

    // If student is not already enrolled
    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    // Optionally, also update the student's enrolledCourses
    await User.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourses: course._id } } // Prevent duplicates
    );

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req, res) => {
  try {
    // Get the student ID directly from req.user, which is populated by the auth middleware
    const studentId = req.user.id;  

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    // Remove the student from the enrolledStudents list in the course
    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    // Remove the course from the student's enrolledCourses list
    await User.findByIdAndUpdate(
      studentId,
      { $pull: { enrolledCourses: course._id } }
    );

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get courses for a student
export const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const courses = await Course.find({ enrolledStudents: studentId })
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// Get enrolled students for teacher
export const getEnrolledStudents = async (req, res) => {
  const course = await Course.findById(req.params.id).populate("enrolledStudents", "name email");
  res.json(course.enrolledStudents);
};

// Remove student from course (teacher)
export const removeStudentFromCourse = async (req, res) => {
  const { id } = req.params; // courseId
  const { studentId } = req.body;

  await Course.findByIdAndUpdate(id, { $pull: { enrolledStudents: studentId } });
  await User.findByIdAndUpdate(studentId, { $pull: { registeredCourses: id } });

  res.json({ message: "Student removed from course" });
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = q ? {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    } : {};

    const courses = await Course.find(searchQuery)
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove material from course
export const removeMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const material = course.materials.id(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Optional: delete the file from disk
    if (material.filePath) {
      const filePath = path.join(process.cwd(), material.filePath); // adjust as needed
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    material.deleteOne(); 
    await course.save();

    res.json({ message: 'Material removed successfully' });
  } catch (error) {
    console.error('Error removing material:', error);
    res.status(500).json({ message: error.message });
  }
};


// Add material to course
export const addMaterial = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add materials to this course' });
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }
    
    const material = {
      title,
      description,
      type,
      filePath: fileUrl
    };

    course.materials.push(material);
    await course.save();

    const updatedCourse = await Course.findById(req.params.id);

    res.status(201).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, deadline } = req.body;
    
    if (!title || !deadline) {
      return res.status(400).json({ message: 'Title and deadline are required' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add assignments to this course' });
    }
    
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }
    
    const assignment = {
      title,
      deadline,
      fileUrl
    };
    
    course.assignments.push(assignment);
    await course.save();
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload material (slide links or URLs)
export const uploadMaterial = async (req, res) => {
  const { id } = req.params;
  const { material } = req.body; // e.g., slide URL
  const course = await Course.findByIdAndUpdate(id, { $push: { materials: material } }, { new: true });
  res.json(course);
};

// Download material
export const downloadMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is either teacher or enrolled student
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = course.enrolledStudents.includes(req.user.id);
    
    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: 'Not authorized to access this material' });
    }

    const material = course.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (!material.filePath) {
      return res.status(400).json({ message: 'No file associated with this material' });
    }

    const filePath = path.join(__dirname, '..', material.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', material.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${material.originalFileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Download assignment file
export const downloadAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const assignment = course.assignments.id(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (!assignment.fileUrl) {
      return res.status(404).json({ message: 'No file attached to this assignment' });
    }
    
    const filePath = path.join(process.cwd(), assignment.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename=${assignment.title}${path.extname(assignment.fileUrl)}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
