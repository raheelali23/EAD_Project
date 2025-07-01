import mongoose from 'mongoose';
import Course from './models/Course.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix assignments without _id
const fixAssignments = async () => {
  try {
    console.log('Checking for assignments without _id...');
    
    const courses = await Course.find({});
    let fixedCount = 0;
    
    for (const course of courses) {
      let courseModified = false;
      
      for (let i = 0; i < course.assignments.length; i++) {
        const assignment = course.assignments[i];
        
        // Check if assignment has _id
        if (!assignment._id) {
          console.log(`Found assignment without _id in course: ${course.title}`);
          console.log(`Assignment: ${assignment.title}`);
          
          // Remove the assignment without _id
          course.assignments.splice(i, 1);
          courseModified = true;
          fixedCount++;
          i--; // Adjust index after removal
        }
      }
      
      if (courseModified) {
        await course.save();
        console.log(`Fixed course: ${course.title}`);
      }
    }
    
    console.log(`Fixed ${fixedCount} assignments without _id`);
    console.log('Assignment fix completed!');
    
  } catch (error) {
    console.error('Error fixing assignments:', error);
  }
};

// List assignments without _id or with invalid _id
const listAssignmentsWithoutId = async () => {
  try {
    const courses = await Course.find({});
    let found = false;
    for (const course of courses) {
      for (const assignment of course.assignments) {
        if (!assignment._id || typeof assignment._id !== 'object' || !assignment._id.toString().match(/^[a-fA-F0-9]{24}$/)) {
          found = true;
          console.log(`Course: ${course.title} (${course._id})`);
          console.log('  Problematic assignment:', assignment);
        }
      }
    }
    if (!found) {
      console.log('All assignments have valid _id fields.');
    }
  } catch (error) {
    console.error('Error listing assignments without _id:', error);
  }
};

// Run the fix and/or listing
const run = async () => {
  await connectDB();
  await listAssignmentsWithoutId();
  // await fixAssignments(); // Uncomment to also fix
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

run(); 