const mongoose = require('mongoose');

// Define Question Schema
const QuestionSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true, unique: true },
  options: {
    a: { type: String, required: false },
    b: { type: String, required: false },
    c: { type: String, required: false },
    d: { type: String, required: false },
  },
  correct_answer: { type: String, required: true },
  difficulty_level: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  question_type: { type: String, enum: ['mcq', 'true/false'], required: true },
});

// Define Question Model
const Question = mongoose.model('Question', QuestionSchema);

// MongoDB Connection
const connectionUri =
  'mongodb+srv://the-study-buddies:SW12345@cluster0.unkqy.mongodb.net/e-learning_platform?retryWrites=true&w=majority';

async function populateQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionUri);
    console.log('Connected to MongoDB.');

    // Questions to be inserted
    const questions = [
      // MCQ Questions
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'), // Replace with actual instructor ID
        question: 'What is the largest planet in our solar system?',
        options: {
          a: 'Earth',
          b: 'Mars',
          c: 'Jupiter',
          d: 'Venus',
        },
        correct_answer: 'c',
        difficulty_level: 'easy',
        question_type: 'mcq',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'What is the chemical symbol for water?',
        options: {
          a: 'O2',
          b: 'H2O',
          c: 'CO2',
          d: 'NaCl',
        },
        correct_answer: 'b',
        difficulty_level: 'easy',
        question_type: 'mcq',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'What is the capital of Japan?',
        options: {
          a: 'Tokyo',
          b: 'Kyoto',
          c: 'Osaka',
          d: 'Hokkaido',
        },
        correct_answer: 'a',
        difficulty_level: 'medium',
        question_type: 'mcq',
      },

      // True/False Questions
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'The Earth is flat.',
        options: {
          a: 'True',
          b: 'False',
        },
        correct_answer: 'b', // False
        difficulty_level: 'easy',
        question_type: 'true/false',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'Water boils at 100°C at sea level.',
        options: {
          a: 'True',
          b: 'False',
        },
        correct_answer: 'a', // True
        difficulty_level: 'medium',
        question_type: 'true/false',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'Humans can breathe underwater without equipment.',
        options: {
          a: 'True',
          b: 'False',
        },
        correct_answer: 'b', // False
        difficulty_level: 'easy',
        question_type: 'true/false',
      },

      // Mixed Questions
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'What is the square root of 16?',
        options: {
          a: '2',
          b: '4',
          c: '6',
          d: '8',
        },
        correct_answer: 'b',
        difficulty_level: 'medium',
        question_type: 'mcq',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'Is the speed of light faster than the speed of sound?',
        options: {
          a: 'True',
          b: 'False',
        },
        correct_answer: 'a', // True
        difficulty_level: 'hard',
        question_type: 'true/false',
      },
      {
        module_id: new mongoose.Types.ObjectId('674a515c6f9d97d7b78b7aee'),
        instructor_id: new mongoose.Types.ObjectId('67458e188dad400e774a54d5'),
        question: 'Which organ in the human body is responsible for pumping blood?',
        options: {
          a: 'Brain',
          b: 'Lungs',
          c: 'Heart',
          d: 'Liver',
        },
        correct_answer: 'c',
        difficulty_level: 'easy',
        question_type: 'mcq',
      },
    ];

    // Insert questions into the database
    const insertedQuestions = await Question.insertMany(questions);
    console.log('Inserted questions:', insertedQuestions);

    console.log('Question population complete.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error populating questions:', error);
  }
}

populateQuestions();
