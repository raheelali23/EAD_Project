import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './route.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() =>  console.log("MongoDB Connected to:", mongoose.connection.name," port ",process.env.PORT))
.catch((err) => console.log(err));

// Routes
app.use('/api/users', router);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});