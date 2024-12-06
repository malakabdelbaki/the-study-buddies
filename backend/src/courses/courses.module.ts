import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from 'src/Models/course.schema';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ModuleService } from 'src/module/module.service';
import { ModuleModule } from 'src/module/module.module';
import { LogsModule } from 'src/log/log.module';

@Module({
  imports:[MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }]),ModuleModule,LogsModule] ,// Register scheme]
  controllers: [CoursesController],
  providers: [CoursesService,authorizationGuard],
  exports: [CoursesService],
})
export class CoursesModule {}



/*
- get all courses ok
- get a certain course by id ok
- filter based on :  ok
      - instructor name
      - title 
      - category
      - keywords
      - course Difficulty level

- get all modules within the course ok
- get all courses with : ok
      - instructor id  ->from the user module 
      - studentid     ->from the user module 
- update general info of the course -> by the instructor (I think)
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
