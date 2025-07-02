Group Members For EAD Project :
Muskan Jarwar   023-22-0185
Muzammil Fatima 023-22-0296
Raheel Ali      023-22-0024

MERN Learning Management System (LMS)
A full-featured Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). It allows teachers to create and manage courses, upload materials, and handle student assignments — while students can enroll in courses, access materials, and submit assignments.
Features
•	JWT-based authentication
•	Teacher & student dashboards
•	Course creation, editing, deletion (teacher)
•	Enrollment with or without enrollment key
•	Upload and manage course materials
•	Create and manage assignments with deadlines
•	Track and view student submissions
•	Responsive, clean UI (Bootstrap / Tailwind CSS)
Project Structure

mern-lms/
 ├── client/       # React frontend
 └── server/       # Express + Node.js backend (API + MongoDB models)

⚙ Installation
1 Clone the repository
git clone https://github.com/raheelali23/EAD_Project.git
cd EAD_Project

2 Install server dependencies
cd lms-backend
npm install

3 Install client dependencies
cd  lms-frontend
npm install
npm i mongoose
npm i express
npm i cors
npm i react-router-dom
npm i react-icons
npm i bootstrap
npm i bootstrap-icons
npm i dotenv
npm i jsonwebtoken
npm i multer
npm i nodemon


5 Run the application

# Terminal 1: Run backend
cd lms-backend
npm start

# Terminal 2: Run frontend
cd lms-frontend
npm start

App runs at: http://localhost:3000 (React client)
API runs at: http://localhost:5000/api
API Endpoints 
Auth
•	POST /api/auth/register → Register as student/teacher
•	POST /api/auth/login → Login and receive JWT token
Courses

search & Student-specific
•	GET /api/courses/search — Search for courses
•	GET /api/courses/student/:studentId — Get courses a specific student is enrolled in

Course CRUD
•	POST /api/courses — Create a new course (teacher only)
•	GET /api/courses — Get a list of all courses
•	GET /api/courses/:id — Get details of a specific course
•	PUT /api/courses/:id — Update a course
•	DELETE /api/courses/:id — Delete a course
•	DELETE /api/courses/:courseId/materials/:materialId — Remove a material from a course

Enrollment
•	POST /api/courses/:id/enroll — Enroll in a course
•	POST /api/courses/:id/unenroll — Unenroll from a course

Materials
•	POST /api/courses/:id/materials — Upload material to a course (file upload required)

Assignments
•	POST /api/courses/:id/assignments — Create an assignment (file upload required)
•	GET /api/courses/:id/assignments/:assignmentId/download — Download assignment file
•	DELETE /api/courses/:id/assignments/:assignmentId — Delete an assignment
•	PUT /api/courses/:id/assignments/:assignmentId/deadline — Update assignment deadline

Assignment Submissions
•	POST /api/courses/:id/assignments/:assignmentId/submit — Submit an assignment (file upload required)
•	GET /api/courses/:id/assignments/:assignmentId/submissions — List all submissions for an assignment
•	GET /api/courses/:id/assignments/:assignmentId/submissions/:submissionId/download — Download a student’s submission
•	DELETE /api/courses/:id/assignments/:assignmentId/submit — Delete a submission


Requirements
•	Node.js v16+
•	MongoDB Atlas or local MongoDB server
•	npm or yarn
