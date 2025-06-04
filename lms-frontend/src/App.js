import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import CourseDetail from "./pages/CourseDetail";
import MyCourses from "./pages/MyCourses";
import StudentDeadlines from "./pages/StudentDeadlines";
import ViewCourse from "./pages/viewcourse";  // Correct import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard/my-courses" element={<MyCourses />} />
        <Route path="/course/:id" element={<ViewCourse />} />  {/* Correct route definition */}
        <Route path="/student-dashboard/deadlines" element={<StudentDeadlines />} />
        <Route path="/teacher-dashboard/course/:id" element={<CourseDetail />} />
        <Route path="/student-dashboard/course/:id" element={<CourseDetail />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
