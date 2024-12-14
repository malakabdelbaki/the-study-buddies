import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Module, ModuleDocument } from 'src/models/modules.schema';
import { Question, QuestionDocument } from 'src/models/question.schema';
import { Course, CourseDocument } from 'src/models/course.schema';
import { Quiz, QuizDocument } from 'src/models/quiz.schema';
import { Answer, AnswerDocument } from 'src/models/answer.schema';
import { Response, ResponseDocument } from 'src/models/response.schema';
import { User, UserDocument } from 'src/models/user.schema';
import { Progress, ProgressDocument } from 'src/models/progress.schema';
@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Module.name) private readonly moduleModel: Model<ModuleDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>, 
    @InjectModel(Answer.name) private readonly answerModel: Model<AnswerDocument>,
    @InjectModel(Response.name) private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Progress.name) private readonly progressModel: Model<ProgressDocument>,  

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
    // Retrieve the user by ID - working
    const user = await this.userModel.findById(user_id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    } 
    console.log("user: ", user);
    // Retrieve module - working
    const module = await this.getModuleById(module_id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${module_id} not found`);
    }
    console.log("module: ", module);

  
    console.log("***************** 1 *********************")
    // Retrieve the associated course - working
    const course = await this.courseModel.findById(module.course_id).exec();
    if (!course) {
      throw new NotFoundException(`Course for Module ID ${module_id} not found`);
    }
      console.log("course: ", course);
      console.log("***************** 2 *********************")

    // Check if the user is enrolled in the course - working
    const isEnrolled = course.students.some(student => student.toString() === user_id);
    if (!isEnrolled) {
      throw new UnauthorizedException(`User with ID ${user_id} is not enrolled in the course`);
    }
      console.log("***************** 3 *********************")

    // Retrieve questions with module_id - working
    const allQuestions = await this.getQuestionsByModuleId(module_id);
  
        console.log("***************** 4 *********************")

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

    console.log("***************** 5 *********************")


    //*********************** get the accumilative student grade ****************************** */

    // Get the student's grade level from the progress collection - working
    // get progress by user_id and course_id - working
    const progress = await this.progressModel.findOne({userId: user._id, courseId: module.course_id }).exec();
    if (!progress) {
      throw new NotFoundException(`Progress not found for User ID ${user_id} and Course ID ${module.course_id}`);
    }
    console.log("progress: ", progress);

    const studentGrade = progress.AverageGrade;
    if (!studentGrade && studentGrade !== 0) {
      throw new NotFoundException(`Student grade not found for User ID ${user_id}`);
    }
    
    console.log("***************** 6 *********************")

    // Filter questions based on the student's grading level - working
    // Select random questions from the filtered questions - working
    const selectedQuestions = await this.getRandomQuestions(filteredQuestions, module.quiz_length, studentGrade);

    console.log("***************** 7 *********************")



    // Map selected questions to ObjectIds - working
    const questionIds = selectedQuestions.map(q => (q as QuestionDocument)._id);

    // Create the quiz object - working
    const quiz = new this.quizModel({
        title: `${module.title} quiz`,
        module_id: (module as ModuleDocument)._id,
        quiz_type: module.quiz_type,
        questions: questionIds,
        createdBy: module.instructor_id,
        student_id: user._id,
    });

    // Save the quiz to the database - working
    const savedQuiz = await quiz.save();

  
    // Log details for debugging - working
    console.log('Module details:', module);
    console.log('Course details:', course);
    console.log('Filtered Questions:', filteredQuestions);
    console.log(filteredQuestions.length, 'questions found for Module ID', module_id);
    console.log('Selected Questions:', selectedQuestions);
    console.log('Quiz created:', savedQuiz);

    // Return the saved quiz
    return savedQuiz;  
  }
  








    // Helper function to get the value of a key from an array of objects - working
    getValueByKey(array, key) {
      for (const obj of array) {
        if (obj.hasOwnProperty(key)) {
          return obj[key];
        }
      }
      return null; // Return null if the key is not found
    }

    // Create an answer for a question - working
    async createAnswer(question_id:Types.ObjectId ,user_answers: { [key: string]: string; }) {
      console.log("entered the createAnswer function");
      
      //convert question_id to string - working
      const key = question_id.toString();
      const selectedAnswer = this.getValueByKey(user_answers, key); 
      console.log("selected answer: ", selectedAnswer);

     // Retrieve the question by ID - working
      const question = await this.questionModel.findById(question_id)
      // console.log("question: ", question); - working
      
      // Check if the selected answer is correct - working
      let isCorrect = false;
      if(question.correct_answer === selectedAnswer)
        isCorrect = true;

      // Create the answer object - working
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
      // Retrieve the quiz by ID - working
      const quiz = await this.quizModel.findById(quiz_id).exec();
      const student = await this.userModel.findById(user_id).exec(); 
      
      // console.log("quiz_id: ", quiz_id); - working
      // console.log("user_id: ", user_id); - working
      // console.log("quiz: ", quiz); - working
      // console.log("student: ", student); - working


      // array of answers for a quiz 
      const answers = [];
      let answer;

      // create answer for each question in the quiz - working
      for(var index in quiz.questions){
        const question_id = quiz.questions[index]; 
        // console.log("question id: ", question_id); - working
        answer = await this.createAnswer(question_id, user_answers);
        answers.push(answer);
      }


      console.log("answers array: ", answers);

      //calculate the score of the student - working
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

      // Create the response object - working
      const response = new this.responseModel({
        user_id: student._id,
        quiz_id: quiz._id,
        answers: answers,
        score: scorePercentage,
      });


      //get course_id by module_id in quiz - working
      const module = await this.moduleModel.findById(quiz.module_id).exec(); 
      console.log("module: ", module);
      //get progress by user_id and course_id - working
      const progress = await this.progressModel.findOne({userId: student._id, courseId: module.course_id }).exec();
      if (!progress) {
        throw new NotFoundException(`Progress not found for User ID ${user_id} and Course ID ${module.course_id}`);
      }
      console.log("progress: ", progress);
      console.log("############ 1 ##############");

      //update progress - working
      progress.AccumilativeGrade += scorePercentage;
      progress.totalNumberOfQuizzes += 1;
      progress.AverageGrade = progress.AccumilativeGrade / progress.totalNumberOfQuizzes;
      console.log("############ 2 ##############");

      //updating the student level based on the AverageGrade for the adaptive modules - working
      //if a beginner student Average grade is higher than 40% then becomes an Intermediate student - working
      if(progress.AverageGrade > 40 && progress.studentLevel == "Beginner" ){
        progress.studentLevel = "Intermediate" 
      }else{
        //if an Intermediate student Average grade is higher than 70% then becomes an Advanced student - working
        if(progress.AverageGrade > 70 && progress.studentLevel == "Intermediate" ){
          progress.studentLevel = "Advanced" 
        }
      }

      // adding modules to student progress - working
      if(progress.completedModules.includes(module._id as Types.ObjectId)){
        console.log(`Module ${module._id} already found in the completed Modules`)
      }
      if(!progress.completedModules.includes(module._id as Types.ObjectId)){
        progress.completedModules.push(module._id as Types.ObjectId)
        console.log(`Module ${module._id} added in the completed Modules`)
      }
        
      //save progress to the database - working
      progress.save();
      console.log("progress: ", progress);
      console.log("progress.AccumilativeGrade: ", progress.AccumilativeGrade);
      console.log("progress.totalNumberOfQuizzes: ", progress.totalNumberOfQuizzes);
      console.log("progress.AverageGrade: ", progress.AverageGrade);
      console.log("############ 3 ##############");


      console.log("response: ", response); 
      // Save the response to the database - working
      const savedResponse = await response.save();
      return savedResponse; 

    }

        

        
}
    







  
 




