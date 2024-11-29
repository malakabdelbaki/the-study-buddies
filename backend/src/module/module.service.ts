import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Difficulty } from 'src/enums/difficulty.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from 'src/Models/question.schema';
import { UpdateQuestionDto } from './dto/update-question.dto';
import Module from 'module';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel('Module') private readonly Modulemodel: Model<Module>,
    @InjectModel('Question') private readonly Questionmodel: Model<Question>,
  ) {}

  // Create a new module
  async createModule(createModuleDto: CreateModuleDto) {
    try {
      const newModule = await this.Modulemodel.create(createModuleDto);
      return newModule.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating module', error.message);
    }
  }

  // Get all modules for a specific course and filter by difficulty if provided
  async findModules(CourseId: Types.ObjectId, difficulty?: string) {
    console.log('entered');
    try {
      const query = { course_id: CourseId };
      if (difficulty) query['difficulty'] = difficulty;
      console.log('Alive' , query)
      const modules = await this.Modulemodel.find(query);
      console.log(modules)
      return modules;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving modules', error.message);
    }
  }

  async GetModule(Moduleid:string){
    try{
      const module = this.Modulemodel.findById(Moduleid);
      if (!module) {
        throw new NotFoundException('Module not found');
      }
      return module;
    }
    catch (err){
      throw new InternalServerErrorException('Error updating module', err.message);
    }
  }

  // Update general info of a module
  async updateModule(Moduleid: string, updateModuleDto: UpdateModuleDto) {
    try {
      const module = await this.Modulemodel.findById(Moduleid);
      if (!module) {
        throw new NotFoundException('Module not found');
      }

      const updatedModule = await this.Modulemodel.findByIdAndUpdate(Moduleid, updateModuleDto, { new: true });
      return updatedModule.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating module', error.message);
    }
  }

  // Create a new question within the question bank of the module
  async addQuestion(createQuestionDto: CreateQuestionDto) {
    try {
      const newQuestion = await this.Questionmodel.create(createQuestionDto);
      return newQuestion.save();
    } catch (error) {
      throw new InternalServerErrorException('Error adding question', error.message);
    }
  }

  // Delete a question from the question bank
  async deleteQuestion(quesId: string) {
    try {
      const deletedQuestion = await this.Questionmodel.findByIdAndDelete(quesId);
      if (!deletedQuestion) {
        throw new NotFoundException('Question not found');
      }
      return deletedQuestion;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting question', error.message);
    }
  }

  // Update a question in the question bank
  async updateQuestion(quesId: string, updateQuestionDto: UpdateQuestionDto) {
    try {
      const question = await this.Questionmodel.findById(quesId);
      if (!question) {
        throw new NotFoundException('Question not found');
      }

      const updatedQuestion = await this.Questionmodel.findByIdAndUpdate(quesId, updateQuestionDto, { new: true });
      return updatedQuestion.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating question', error.message);
    }
  }



  async getQuestionBank(Moduleid: string) {
  try {
    // Validate Module ID
    if (!mongoose.Types.ObjectId.isValid(Moduleid)) {
      throw new Error('Invalid Module ID');
    }

    // Retrieve the module and populate the 'question_bank' field
    const module = await this.Modulemodel.findById(Moduleid).populate('question_bank') as unknown as {
      question_bank: Question[];
    };

    // Check if the module exists
    if (!module) {
      console.log('Module not found.');
      return [];
    }
    //console.log(module);
    //Check if the module has a question bank
    if (module.question_bank) {
      let questions = module.question_bank; // Get the populated question_bank
      console.log(questions); // Log the questions
      //questions = questions.populate()
      return questions; // Return the list of questions
    } else {
      console.log('No question bank found for this module.');
      return []; // Return an empty array if no questions
    }
  } catch (err) {
    console.error('Error fetching question bank:', err);
    throw err; // Propagate the error
  }


  
}
}

//For module :
/*
- create a new module (by instructor) --verification needed
- get all modules within a course  --done
- get filter modules based on difficulty level
- update general info of a module
- create a question within the question bank of the module
- delete a question from question bank
- update a question in the question bank

_____________________________________

- delete a module (outdated? or just delete from the database?)
- resourses handling (uploads/urls) 
*/