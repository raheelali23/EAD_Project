# MERN Learning Management System (LMS)

## 👥 Group Members

- **Muskan** – 023-22-0185  
- **Muzammil Fatima** – 023-22-0296  
- **Raheel Ali** – 023-22-0024  

---

## 📚 Project Overview

A full-featured Learning Management System (LMS) built with the **MERN stack** (MongoDB, Express.js, React, Node.js).  
It allows teachers to create and manage courses, upload materials, and handle student assignments — while students can enroll in courses, access materials, and submit assignments.

---

## 🖼 Screenshot

![App Screenshot](https://raw.githubusercontent.com/raheelali23/EAD_Project/refs/heads/main/Screenshot%202025-07-01%20203748.png?raw=true)

---

## ✨ Features

- JWT-based authentication  
- Teacher & student dashboards  
- Course creation, editing, and deletion (teacher only)  
- Enrollment with enrollment key  
- Upload and manage course materials  
- Create and manage assignments with deadlines  
- Track and view student submissions  
- Responsive, clean UI (Bootstrap / Tailwind CSS)

---

## 📁 Project Structure

mern-lms/
├── client/ # React frontend
└── server/ # Express + Node.js backend (API + MongoDB models)

yaml
Copy
Edit

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/raheelali23/EAD_Project.git
cd EAD_Project
2. Install Server Dependencies
bash
Copy
Edit
cd lms-backend
npm install
3. Install Client Dependencies
bash
Copy
Edit
cd ../lms-frontend
npm install
npm i mongoose express cors react-router-dom react-icons bootstrap bootstrap-icons dotenv jsonwebtoken multer nodemon
4. Run the Application
Terminal 1: Run Backend
bash
Copy
Edit
cd lms-backend
node server.js
Terminal 2: Run Frontend
bash
Copy
Edit
cd lms-frontend
npm start
React client: http://localhost:3000

API server: http://localhost:5000/api

🧪 API Endpoints
🔐 Auth
POST /api/auth/register – Register as student/teacher

POST /api/auth/login – Login and receive JWT token

📚 Courses
Search & Student-Specific
GET /api/courses/search – Search for courses

GET /api/courses/student/:studentId – Get courses a specific student is enrolled in

Course CRUD
POST /api/courses – Create a new course (teacher only)

GET /api/courses – Get a list of all courses

GET /api/courses/:id – Get details of a specific course

PUT /api/courses/:id – Update a course

DELETE /api/courses/:id – Delete a course

DELETE /api/courses/:courseId/materials/:materialId – Remove a material from a course

🧑‍🏫 Enrollment
POST /api/courses/:id/enroll – Enroll in a course

POST /api/courses/:id/unenroll – Unenroll from a course

📁 Materials
POST /api/courses/:id/materials – Upload material to a course (file upload required)

📝 Assignments
POST /api/courses/:id/assignments – Create an assignment (file upload required)

GET /api/courses/:id/assignments/:assignmentId/download – Download assignment file

DELETE /api/courses/:id/assignments/:assignmentId – Delete an assignment

PUT /api/courses/:id/assignments/:assignmentId/deadline – Update assignment deadline

📤 Assignment Submissions
POST /api/courses/:id/assignments/:assignmentId/submit – Submit an assignment (file upload required)

GET /api/courses/:id/assignments/:assignmentId/submissions – List all submissions for an assignment

GET /api/courses/:id/assignments/:assignmentId/submissions/:submissionId/download – Download a student’s submission

DELETE /api/courses/:id/assignments/:assignmentId/submit – Delete a submission

🧰 Requirements
Node.js v16+

MongoDB Atlas or local MongoDB server

npm or yarn

