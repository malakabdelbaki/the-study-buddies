const mongoose = require('mongoose');

// Define Schemas
const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  completionPercentage: Number,
  lastAccessed: Date,
});

const CourseSchema = new mongoose.Schema({
  title: String,
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
});

// Define Models
const Progress = mongoose.model('Progress', ProgressSchema);
const Course = mongoose.model('Course', CourseSchema);
const User = mongoose.model('User', UserSchema);

// MongoDB Connection
const connectionUri =
  'mongodb+srv://the-study-buddies:SW12345@cluster0.unkqy.mongodb.net/e-learning_platform?retryWrites=true&w=majority';

async function populateDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionUri);
    console.log('Connected to MongoDB.');

    

    // Insert new users
    const users = await User.insertMany([
      { name: 'Student 1', email: 'student1@example.com', passwordHash: 'hashed_password', role: 'student' },
      { name: 'Student 2', email: 'student2@example.com', passwordHash: 'hashed_password', role: 'student' },
      { name: 'Instructor 1', email: 'instructor1@example.com', passwordHash: 'hashed_password', role: 'instructor' },
    ]);
    console.log('Inserted users:', users);

    // Insert new courses
    const courses = await Course.insertMany([
      { title: 'Course 1', instructor_id: users[2]._id }, // Assign to Instructor 1
      { title: 'Course 2', instructor_id: users[2]._id }, // Assign to Instructor 1
    ]);
    console.log('Inserted courses:', courses);

    // Insert new progress
    const progress = await Progress.insertMany([
      { userId: users[0]._id, courseId: courses[0]._id, completionPercentage: 90, lastAccessed: new Date() },
      { userId: users[1]._id, courseId: courses[0]._id, completionPercentage: 40, lastAccessed: new Date() },
    ]);
    console.log('Inserted progress:', progress);

    console.log('Database populated successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDB();
