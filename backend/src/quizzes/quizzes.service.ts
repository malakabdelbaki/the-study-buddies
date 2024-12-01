import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Module, ModuleDocument } from 'src/models/modules.schema';
import { Question, QuestionDocument } from 'src/models/question.schema';
import { Course, CourseDocument } from 'src/models/course.schema';
import { Quiz, QuizDocument } from 'src/models/quiz.schema';
import { Answer, AnswerDocument } from 'src/models/answer.schema';
import { Response, ResponseDocument } from 'src/models/response.schema';
@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Module.name) private readonly moduleModel: Model<ModuleDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>, 
    @InjectModel(Answer.name) private readonly answerModel: Model<AnswerDocument>,
    @InjectModel(Response.name) private readonly responseModel: Model<ResponseDocument>,

  ) {}

  // Retrieve a specific module by ID - working
  async getModuleById(module_id: string): Promise<Module> {
    const module = await this.moduleModel.findById(module_id).exec();
    if (!module) {
      throw new NotFoundException(`Module with ID ${module_id} not found`);
    }
    return module;
  }

  // Retrieve all questions associated with a module - working
  async getQuestionsByModuleId(module_id: string): Promise<Question[]> {
    if (!Types.ObjectId.isValid(module_id)) {
      throw new NotFoundException(`Invalid Module ID: ${module_id}`);
    }
  
    const objectId = new Types.ObjectId(module_id);
    const questions = await this.questionModel.find({ module_id: objectId }).exec();
  
    if (!questions || questions.length === 0) {
      throw new NotFoundException(`No questions found for Module ID ${module_id}`);
    }
  
    return questions;
  }


  //********************* logic for handling - filter questions based on student grade *********************************** */

  // helper function to get questions with no duplication - working
  getQuestionsWithNoDuplication(questions: Question[], count: number, alreadyChosen: Question[] = []): Question[] {
    // Exclude already chosen questions from the pool of questions using alreadyChosen
    const remainingQuestions = questions.filter(
      question => !(alreadyChosen as QuestionDocument[]).some(chosen => (chosen as QuestionDocument)._id.toString() === (question as QuestionDocument)._id.toString())
    );
  
    const selected: Question[] = [];
    const questionPool = [...remainingQuestions]; // Clone the array to manipulate
  
    while (selected.length < count) {
      if (questionPool.length === 0) {
        // Break if no more questions are available
        break;
      }
  
      // Randomly pick a question and remove it from the pool
      const randomIndex = Math.floor(Math.random() * questionPool.length);
      selected.push(questionPool.splice(randomIndex, 1)[0]);
    }
  
    return selected;
  }


  // get random questions from the filtered questions (filtered by Quiz type) - working
  getRandomQuestions(filteredQuestions: Question[], quizLength: number, studentGrade: number): Question[] {
    // Group questions by difficulty
    const easyQuestions = filteredQuestions.filter(q => q.difficulty_level === 'easy');
    const mediumQuestions = filteredQuestions.filter(q => q.difficulty_level === 'medium');
    const hardQuestions = filteredQuestions.filter(q => q.difficulty_level === 'hard');
  
    let selectedQuestions: Question[] = [];
  
    if (studentGrade >= 0 && studentGrade < 50) {
      // Less than 50%: All questions from 'easy'
      selectedQuestions = this.getQuestionsWithNoDuplication(easyQuestions, quizLength);
    } else if (studentGrade >= 50 && studentGrade < 70) {
      // 50% to 70%: Half from 'easy', half from 'medium'
      // split the quiz length into half
      const half = Math.floor(quizLength / 2);
      
      // get questions for each difficulty level
      let easySubset = this.getQuestionsWithNoDuplication(easyQuestions, half);
      let mediumSubset = this.getQuestionsWithNoDuplication(mediumQuestions, quizLength - easySubset.length);
  
      // Fill remaining questions to reach the quiz length by getting the rest of the questions from the other difficulty level
      if (mediumSubset.length < half) {
        easySubset = [
          ...easySubset,
          ...this.getQuestionsWithNoDuplication(easyQuestions, quizLength - mediumSubset.length - easySubset.length, [...easySubset, ...mediumSubset]),
        ];
      }
  
      if (easySubset.length < half) {
        mediumSubset = [
          ...mediumSubset,
          ...this.getQuestionsWithNoDuplication(mediumQuestions, quizLength - mediumSubset.length - easySubset.length, [...easySubset, ...mediumSubset]),
        ];
      }
  
      selectedQuestions = [...easySubset, ...mediumSubset];
    } else if (studentGrade >= 70 && studentGrade < 90) {
      // 70% to 90%: One-third from 'easy', 'medium', and 'hard'
      const third = Math.floor(quizLength / 3);
  
      let easySubset = this.getQuestionsWithNoDuplication(easyQuestions, third);
      let mediumSubset = this.getQuestionsWithNoDuplication(mediumQuestions, third);
      let hardSubset = this.getQuestionsWithNoDuplication(hardQuestions, quizLength - easySubset.length - mediumSubset.length);
  
      // Fill remaining questions to reach the quiz length by getting the rest of the questions from the other difficulty level
      if (hardSubset.length < third) {
        easySubset = [
          ...easySubset,
          ...this.getQuestionsWithNoDuplication(easyQuestions, quizLength - easySubset.length - mediumSubset.length - hardSubset.length, [...easySubset, ...mediumSubset, ...hardSubset]),
        ];
        mediumSubset = [
          ...mediumSubset,
          ...this.getQuestionsWithNoDuplication(mediumQuestions, quizLength - easySubset.length - mediumSubset.length - hardSubset.length, [...easySubset, ...mediumSubset, ...hardSubset]),
        ];
      }
  
      selectedQuestions = [...easySubset, ...mediumSubset, ...hardSubset];
    } else if (studentGrade >= 90 && studentGrade <= 100) {
      // 90% to 100%: Half from 'medium', half from 'hard'
      const half = Math.floor(quizLength / 2);
  
      let mediumSubset = this.getQuestionsWithNoDuplication(mediumQuestions, half);
      let hardSubset = this.getQuestionsWithNoDuplication(hardQuestions, quizLength - mediumSubset.length);
  
      // Fill remaining questions to reach the quiz length by getting the rest of the questions from the other difficulty level
      if (hardSubset.length < half) {
        mediumSubset = [
          ...mediumSubset,
          ...this.getQuestionsWithNoDuplication(mediumQuestions, quizLength - mediumSubset.length - hardSubset.length, [...mediumSubset, ...hardSubset]),
        ];
      }
  
      if (mediumSubset.length < half) {
        hardSubset = [
          ...hardSubset,
          ...this.getQuestionsWithNoDuplication(hardQuestions, quizLength - mediumSubset.length - hardSubset.length, [...mediumSubset, ...hardSubset]),
        ];
      }
  
      selectedQuestions = [...mediumSubset, ...hardSubset];
    }
  
    // Handle insufficient total questions by duplicating selected questions
    while (selectedQuestions.length < quizLength) {
      selectedQuestions.push(...selectedQuestions.slice(0, quizLength - selectedQuestions.length));
    }
  
    // Shuffle the final selected questions
    return selectedQuestions.sort(() => 0.5 - Math.random());
  }



  

  // Create a quiz
  async createQuiz(user_id: string, module_id: string) {
    // Retrieve module - working
    const module = await this.getModuleById(module_id);
  
    // Retrieve the associated course - working
    const course = await this.courseModel.findById(module.course_id).exec();
    if (!course) {
      throw new NotFoundException(`Course for Module ID ${module_id} not found`);
    }
  
    // Check if the user is enrolled in the course - working
    const isEnrolled = course.students.some(student => student.toString() === user_id);
    if (!isEnrolled) {
      throw new UnauthorizedException(`User with ID ${user_id} is not enrolled in the course`);
    }
  
    // Retrieve questions with module_id - working
    const allQuestions = await this.getQuestionsByModuleId(module_id);
  
    // Filter questions based on the module's quiz type - working
    const filteredQuestions = module.quiz_type === 'mixed'
    ? allQuestions
    : allQuestions.filter(q => q.question_type.toString() === module.quiz_type.toString());
  
    // Throw an error if no questions are found for the module quiz type
    if (filteredQuestions.length === 0) {
      throw new NotFoundException(
        `No questions found for Module ID ${module_id} with quiz type ${module.quiz_type}`
      );
    }

    // Warn if filtered questions are fewer than the requested quiz length
    if (filteredQuestions.length < module.quiz_length) {
        console.warn(
          `Filtered questions (${filteredQuestions.length}) are fewer than the requested quiz length (${module.quiz_length}). Questions will be reused to meet the required count.`
        );
      }

    
    // Get the student's grade level
    const studentGrade = 100;  

    
    // Filter questions based on the student's grading level - working
     // Select random questions from the filtered questions - working
    const selectedQuestions = this.getRandomQuestions(filteredQuestions, module.quiz_length, studentGrade);



    // Add quiz creation logic here
    // Map selected questions to ObjectIds
    const questionIds = selectedQuestions.map(q => (q as QuestionDocument)._id);

    // Create the quiz object
    const quiz = new this.quizModel({
        title: `${module.title} quiz`,
        module_id: module_id,
        quiz_type: module.quiz_type,
        questions: questionIds,
        createdBy: module.instructor_id,
        student_id: user_id,
    });

    // Save the quiz to the database
    const savedQuiz = await quiz.save();

  
    // Log details for debugging
    console.log('Module details:', module);
    console.log('Course details:', course);
    console.log('Filtered Questions:', filteredQuestions);
    console.log(filteredQuestions.length, 'questions found for Module ID', module_id);
    console.log('Selected Questions:', selectedQuestions);
    console.log('Quiz created:', savedQuiz);
    // console.log('filtered Questions By Grade: ', filteredQuestionsByGrade);

    // Return the saved quiz
    return savedQuiz;  }
  








    // Helper function to get the value of a key from an array of objects
    getValueByKey(array, key) {
      for (const obj of array) {
        if (obj.hasOwnProperty(key)) {
          return obj[key];
        }
      }
      return null; // Return null if the key is not found
    }

    // Create an answer for a question
    async createAnswer(question_id:Types.ObjectId ,user_answers: { [key: string]: string; }) {
      console.log("entered the createAnswer function");
      
      //convert question_id to string 
      const key = question_id.toString();
      const selectedAnswer = this.getValueByKey(user_answers, key); 
      // console.log("selected answer: ", selectedAnswer); - working

     // Retrieve the question by ID
      const question = await this.questionModel.findById(question_id)
      // console.log("question: ", question); - working
      
      // Check if the selected answer is correct
      let isCorrect = false;
      if(question.correct_answer === selectedAnswer)
        isCorrect = true;

      // Create the answer object 
      const answer = new this.answerModel({
        question_id: question_id,
        selectedAnswer: selectedAnswer,
        isCorrect: isCorrect,
      });
      
      // Save the answer to the database
      // console.log("answer: ", answer); - working
      const savedAnswer = await answer.save();
      return answer;
    }



    async createResponse(quiz_id: string, user_id: string, user_answers:{[key:string] : string}) {
      console.log("entered the createResponse function");
      // Retrieve the quiz by ID
      const quiz = await this.quizModel.findById(quiz_id).exec();

      // array of answers for a quiz
      const answers = [];
      let answer;

      // create answer for each question in the quiz
      for(var index in quiz.questions){
        const question_id = quiz.questions[index]; 
        // console.log("question id: ", question_id); - working
        answer = await this.createAnswer(question_id, user_answers);
        answers.push(answer);
      }


      console.log("answers array: ", answers);

      //calculate the score of the student
      let score = 0;
      for(var index in quiz.questions){
        console.log("entered score calculation loop");
        const question_id = quiz.questions[index]; 
        //find answer by question_id
        const answer = await this.answerModel.findOne({question_id: question_id}).exec();
        // console.log("answer for score : ", answer); - working
        if(answer.isCorrect)
          score++;
      }


      console.log("score: ", score);
      const scorePercentage = (score / quiz.questions.length) * 100;
      console.log("score percentage: ", scorePercentage);

      // Create the response object
      const response = new this.responseModel({
        user_id: user_id,
        quiz_id: quiz_id,
        answers: answers,
        score: scorePercentage,
      });
      // console.log("response: ", response); - working
      // Save the response to the database
      const savedResponse = await response.save();

    }

        

        
}
    


