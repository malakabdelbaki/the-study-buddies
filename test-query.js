//for testing purposee

// const mongoose = require('mongoose');

// // Define Course Schema
// const CourseSchema = new mongoose.Schema({
//   title: String,
//   instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// });
// const Course = mongoose.model('Course', CourseSchema); // Register the Course schema

// // Define Progress Schema
// const ProgressSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Reference the Course model
//   completionPercentage: Number,
//   lastAccessed: Date,
// });
// const Progress = mongoose.model('Progress', ProgressSchema); // Register the Progress schema

// // MongoDB Connection URI
// const connectionUri =
//   'mongodb+srv://the-study-buddies:SW12345@cluster0.unkqy.mongodb.net/e-learning_platform?retryWrites=true&w=majority';

// async function testQuery() {
//   try {
//     await mongoose.connect(connectionUri);
//     console.log('Connected to MongoDB.');

//     const result = await Progress.find({
//       userId: new mongoose.Types.ObjectId('67458e188dad400e774a54d3'),
//     }).populate({ path: 'courseId', select: 'title' });

//     console.log('Query result:', JSON.stringify(result, null, 2));
//     await mongoose.disconnect();
//   } catch (error) {
//     console.error('Error during query execution:', error);
//   }
// }

// testQuery();
