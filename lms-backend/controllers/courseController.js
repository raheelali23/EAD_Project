import User from "../models/User";
import fs from 'fs';
import path from 'path';
import Course from "../models/Course";

// Get all courses
const getCourses = async (req, res) => {
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
const getCourse = async (req, res) => {
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
const getCourseDetails = async (req, res) => {
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
const createCourse = async (req, res) => {
  try {
    const { title, description, enrollmentKey } = req.body;
    
    if (!title || !enrollmentKey) {
      return res.status(400).json({ message: 'Title and enrollment key are required' });
    }

    // Check if enrollment key already exists
    const existingCourse = await Course.findOne({ enrollmentKey });
    if (existingCourse) {
      return res.status(400).json({ message: 'Enrollment key already exists' });
    }

    const course = new Course({
      title,
      description,
      enrollmentKey,
      teacher: req.user.id
    });

    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Remove course from enrolled students
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    // Delete course materials
    if (course.materials && course.materials.length > 0) {
      course.materials.forEach(material => {
        if (material.filePath) {
          const filePath = path.join(__dirname, '..', material.filePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: error.message });
  }
};



const enrollInCourse = async (req, res) => {
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
const unenrollFromCourse = async (req, res) => {
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
const getStudentCourses = async (req, res) => {
  try {
    const userId = req.params.userId;

    const courses = await Course.find({ enrolledStudents: userId });

    // Ensure the result is always an array
    if (!Array.isArray(courses)) {
      return res.status(200).json([]);
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({ message: "Server error" });
  }
};






// Get enrolled students for teacher
const getEnrolledStudents = async (req, res) => {
  const course = await Course.findById(req.params.id).populate("enrolledStudents", "name email");
  res.json(course.enrolledStudents);
};

// Remove student from course (teacher)
const removeStudentFromCourse = async (req, res) => {
  const { id } = req.params; // courseId
  const { studentId } = req.body;

  await Course.findByIdAndUpdate(id, { $pull: { enrolledStudents: studentId } });
  await User.findByIdAndUpdate(studentId, { $pull: { registeredCourses: id } });

  res.json({ message: "Student removed from course" });
};

const searchCourses = async (req, res) => {
  try {
    const query = req.query.q || "";
    const courses = await Course.find({ title: { $regex: query, $options: "i" } })
      .populate("teacher", "name email")              // populate teacher info
      .populate("enrolledStudents", "name email");    // optionally populate enrolled students
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  searchCourses,
};
