const mongoose = require('mongoose');

// Define schemas and models
const User = mongoose.model(
  'User',
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    ratings: { type: [Number], default: [] },
  })
);

const Course = mongoose.model(
  'Course',
  new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty_level: { type: String, required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    modules: { type: [mongoose.Schema.Types.ObjectId], ref: 'Module', default: [] },
    ratings: { type: [Number], default: [] },
  })
);

const Module = mongoose.model(
  'Module',
  new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    resources: { type: [String], default: [] },
    quiz_type: { type: String, required: true },
    question_bank: { type: [mongoose.Schema.Types.ObjectId], ref: 'Question', default: [] },
    module_difficulty: { type: String, required: true },
    quiz_length: { type: Number, required: true },
    ratings: { type: [Number], default: [] },
  })
);

const Question = mongoose.model(
  'Question',
  new mongoose.Schema({
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    options: { type: Map, of: String, required: true },
    correct_answer: { type: String, required: true },
    difficulty_level: { type: String, required: true },
    question_type: { type: String, required: true },
  })
);

const Progress = mongoose.model(
  'Progress',
  new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completionPercentage: { type: Number, required: true },
    lastAccessed: { type: Date, default: Date.now },
    totalNumberOfQuizzes: { type: Number, default: 0 },
    AccumilativeGrade: { type: Number, default: 0 },
    AverageGrade: { type: Number, default: 0 },
  })
);

// MongoDB Connection
const connectionUri = 'mongodb+srv://the-study-buddies:SW12345@cluster0.unkqy.mongodb.net/e-learning_platform';

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionUri);
    console.log('Connected to MongoDB.');

    // Create the student (Mike)
    const student = await User.create({
      name: 'Mike Ross',
      email: 'mike.ross@example.com',
      passwordHash: 'hashedpassword',
      role: 'student',
    });

    console.log('Student created:', student);

    // Create two courses
    const courses = await Course.insertMany([
      {
        title: 'Mike Course 1',
        description: 'Description for Course 1',
        category: 'Science',
        difficulty_level: 'medium',
        instructor_id: new mongoose.Types.ObjectId(), // Replace with a valid instructor ID
        students: [student._id],
        modules: [],
      },
      {
        title: 'Mike Course 2',
        description: 'Description for Course 2',
        category: 'Technology',
        difficulty_level: 'hard',
        instructor_id: new mongoose.Types.ObjectId(), // Replace with a valid instructor ID
        students: [student._id],
        modules: [],
      },
    ]);

    console.log('Courses created:', courses);

    // Create 3 modules for each course
    for (const course of courses) {
      const modules = [];
      for (let i = 1; i <= 3; i++) {
        const module = await Module.create({
          course_id: course._id,
          instructor_id: course.instructor_id,
          title: `Mike Module ${i} for ${course.title}`,
          content: `Content for Module ${i} of ${course.title}`,
          resources: [`https://resource${i}.com`],
          quiz_type: 'mixed',
          question_bank: [],
          module_difficulty: i === 1 ? 'easy' : i === 2 ? 'medium' : 'hard',
          quiz_length: 12,
        });

        modules.push(module._id);

        // Create 4 questions for each difficulty level in the module
        const difficulties = ['easy', 'medium', 'hard'];
        for (const difficulty of difficulties) {
          for (let q = 1; q <= 4; q++) {
            await Question.create({
              module_id: module._id,
              instructor_id: course.instructor_id,
              question: `Question ${q} (${difficulty}) for Module ${i}`,
              options: {
                a: `Option A for Question ${q}`,
                b: `Option B for Question ${q}`,
                c: `Option C for Question ${q}`,
                d: `Option D for Question ${q}`,
              },
              correct_answer: 'a',
              difficulty_level: difficulty,
              question_type: difficulty === 'hard' ? 'mcq' : 'true/false',
            });
          }
        }
      }

      // Update the course with its modules
      course.modules = modules;
      await course.save();
    }

    // Create progress records for Mike for both courses
    for (const course of courses) {
      await Progress.create({
        userId: student._id,
        courseId: course._id,
        completionPercentage: 0,
        totalNumberOfQuizzes: 0,
        AccumilativeGrade: 0,
        AverageGrade: 0,
      });
    }

    console.log('Database populated successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();
