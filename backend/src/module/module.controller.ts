import { Controller, Get, Post,Query, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Difficulty } from 'src/enums/difficulty.enum';
import { Types } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiQuery } from '@nestjs/swagger';
import { CoursesService } from 'src/courses/courses.service';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService,private readonly courseService:CoursesService) {}

  // Create a new module
  @Post() //ok
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    try {
      const module = await this.moduleService.createModule(createModuleDto);
      module.save();
      
      const courseId = createModuleDto.course_id; // Assuming the courseId is in the DTO 
      this.courseService.AddModule(courseId,module._id);
      return module;
    }
    catch(err){
      throw new HttpException('Failed to create module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':ModuleId')//ok
  async getModule(@Param('ModuleId') ModuleId:string){
    try{
      return await this.moduleService.GetModule(ModuleId);
    } catch (error) {
      throw new HttpException('Failed to create module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all modules of a course
  // @Get(':courseId')
  // @ApiQuery({ name: 'difficulty', type: String, required: false, description: 'Search courses by difficulty' })
  // async findModules(@Param('courseId') courseId: string, @Query('difficulty') difficulty?: string) {
  //   try {
  //     // Validate the courseId before attempting to convert it to ObjectId
  //     if (!Types.ObjectId.isValid(courseId)) {
  //       throw new HttpException('Invalid courseId', HttpStatus.BAD_REQUEST);
  //     }
      
  //     const courseIdObject = new Types.ObjectId(courseId);
  //     console.log('Request received for courseId:', courseIdObject);
      
  //     return await this.moduleService.findModules(courseIdObject, difficulty);
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException('Failed to retrieve modules', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
  

  // Get a single module by ID
  // @Get('module/:id')
  // async findOne(@Param('id') id: string) {
  //   try {
  //     return await this.moduleService.findOne(id);
  //   } catch (error) {
  //     throw new HttpException('Module not found', HttpStatus.NOT_FOUND);
  //   }
  // }

  // Update a module's general info
  @Patch(':moduleId')
  async update(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto
  ) {
    try {
      return await this.moduleService.updateModule(moduleId, updateModuleDto);
    } catch (error) {
      throw new HttpException('Failed to update module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a module
  // @Delete(':moduleId')
  // async remove(@Param('moduleId') moduleId: string) {
  //   try {
  //     return await this.moduleService.remove(moduleId);
  //   } catch (error) {
  //     throw new HttpException('Failed to delete module', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // Add a question to a module's question bank
  @Post('question')
  async addQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    try {
      return await this.moduleService.addQuestion(createQuestionDto);
    } catch (error) {
      throw new HttpException('Failed to add question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update a question in the module's question bank
  @Patch('question/:quesId')
  async updateQuestion(@Param('quesId') quesId: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    try {
      return await this.moduleService.updateQuestion(quesId, updateQuestionDto);
    } catch (error) {
      throw new HttpException('Failed to update question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a question from the module's question bank
  @Delete('question/:quesId')
  async deleteQuestion(@Param('quesId') quesId: string) {
    try {
      return await this.moduleService.deleteQuestion(quesId);
    } catch (error) {
      throw new HttpException('Failed to delete question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('question-bank/:moduleId')
  async getQuestionBank(@Param('moduleId') moduleId:string){
    try{
      return await this.moduleService.getQuestionBank(moduleId);
    }
    catch(error){
      throw new HttpException('Failed to delete question', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}





/*
- get all courses
- get a certain course by id
- filter based on :  
      - instructor name
      - title 
      - category
      - keywords
      - course Difficulty level

- get all modules within the course
- get all courses with :
      - instructor id  ->from the user module 
      - studentid     ->from the user module 
- update general info of the course -> by the instructor/admin (I think)
- create a new course -> by the instructor/admin (I think)
- student enroll into the course ->update both array of the courses(inside the student) and the array of students(inside the course)
- create a new module inside this course (handle the array of modules & the courseid in the module) ->by the instructor
- delete oudated course ->by admin ( delete also all related modules->question_bank->quizes->interactions->..)

- get a module by id
- filter module:
      - difficulty level
      - 
- update general info of a module,including:
      - quiz_type
      - number of questions in the quiz

-(Resources management) : 
      - get all resources (outdated and not outdated) (instructor only)
      - filter outdated resources ->student
      - add a new resource ->instructor
      - update (change to outdated resource by the instructor)

- create a question within the question bank of the module ->by the instructor
- get all questions of a module
- delete a question from question bank ->by the instructor
- update a question in the question bank ->by the instructor
- delete module ->by the instructor/admin(I think)
_____________________________________

*/


