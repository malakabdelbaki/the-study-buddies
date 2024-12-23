import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/Models/course.schema';
import { User, UserDocument } from 'src/Models/user.schema';
import { ModuleService } from 'src/module/module.service';
import { CreateModuleDto } from 'src/module/dto/create-module.dto';
import { Module } from 'src/Models/modules.schema';
import { Role } from 'src/enums/role.enum';
import { Progress, ProgressDocument } from 'src/Models/progress.schema';
import { Difficulty } from 'src/enums/difficulty.enum';
import { Course_diff } from 'src/enums/course-diff.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<CourseDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Progress') private readonly progressModel: Model<ProgressDocument>,


    private readonly moduleService: ModuleService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    try {
      const newCourse = await this.courseModel.create(createCourseDto);
      return await newCourse.save();
    } catch (err) {
      console.error('Error creating course:', err.message);
      throw new HttpException('Error creating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    userid: Types.ObjectId,
    title?: string,
    category?: string,
    key_word?: string,
    difficulty?: string,
    instructor?: string
  ) {
    try {
      const query: any = {};
      console.log(title);
      // Partial matching with regex (case-insensitive)
      if (title) query.title = { $regex: title, $options: 'i' };
      if (category) query.category = { $regex: category, $options: 'i' };
      if (key_word) query.key_words = { $regex: key_word, $options: 'i' };
      if (difficulty) query.difficulty_level = { $regex: difficulty, $options: 'i' };
  
      // Exclude deleted courses for students
      const user = await this.userModel.findById(userid);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      if (user.role === Role.Student) {
        query.is_deleted = false;
      }
      console.log(query);
      // Fetch courses with query
      let courses = await this.courseModel.find(query).populate('instructor_id');
  
      // Filter by instructor name (partial matching, case-insensitive)
      if (instructor) {
        courses = courses.filter((course) => {
          const instructorDetails = course.instructor_id as unknown as User; // Assert type
          return (
            instructorDetails &&
            instructorDetails.name &&
            new RegExp(instructor, 'i').test(instructorDetails.name)
          );
        });
      }
  
      return courses;
    } catch (err) {
      console.error('Error fetching courses:', err.message);
      throw new HttpException('Error fetching courses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async findOne(id: Types.ObjectId) {
    try {
      console.log("in course", id);
      const course = await this.courseModel.findById(id).populate('instructor_id');
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      return course;
    } catch (err) {
      console.error('Error fetching course:', err.message);
      throw err instanceof HttpException
        ? err
        : new HttpException('Error fetching course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: Types.ObjectId, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.findOne(id);
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      course.key_words =[];
      if (updateCourseDto.key_words){
        updateCourseDto.key_words.forEach((keyword)=>{
          course.key_words.push(keyword);
          course.save()
        });
        updateCourseDto.key_words = undefined;
      }
      const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true });
      return await updatedCourse.save();
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
   

  async getModules(user_id:Types.ObjectId,courseid: Types.ObjectId) {
    try {
      const course = await this.courseModel.findById(courseid).populate('modules','students');
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      console.log(user_id._id.toString());
      let User = await this.userModel.findById(user_id._id.toString());
      if (!User){
        console.log(User)
        throw new HttpException('No User is logged in', HttpStatus.NOT_FOUND);
      }

      let modules = course.modules;
      if(!modules)
        throw new HttpException('No modules found for this course', HttpStatus.UNAUTHORIZED);

      
      
      if (User.role === Role.Instructor){
          console.log(user_id);
          console.log(course.instructor_id);
          if (course.instructor_id._id.toString() !== user_id.toString())
            throw new HttpException('this instructor is not authorized', HttpStatus.UNAUTHORIZED);

      }

      else if (User.role === Role.Student){

        const isEnrolled = course.students.includes(user_id);
        if (!isEnrolled) {
          throw new HttpException('Student not enrolled in this course', HttpStatus.FORBIDDEN);
        }
        console.log(modules);
        let StudentPerformance = await this.progressModel.findOne({userId:user_id,courseId:courseid})
        if(!StudentPerformance)
          throw new HttpException('Not Found The Progress Of the student', HttpStatus.INTERNAL_SERVER_ERROR);
        console.log("kkkkk",StudentPerformance);
        if (StudentPerformance.studentLevel === Course_diff.BEGINNER){
          console.log('entered');
          const easyModules = [];
          for (const module of modules) {
              const mod = await this.moduleService.findOne(module);
              if (mod.module_difficulty === Difficulty.EASY) {
                  easyModules.push(module);
              }
          }
          return easyModules;
        }
      
        else if (StudentPerformance.studentLevel === Course_diff.INTERMEDIATE){
          const easy_medModules = [];
          for (const module of modules) {
              const mod = await this.moduleService.findOne(module);
              if (mod.module_difficulty === Difficulty.EASY || mod.module_difficulty===Difficulty.MEDIUM) {
                easy_medModules.push(module);
              }
          }
          return easy_medModules;
        }
      }
      return modules;
    
    } catch (err) {
      console.error('Error retrieving modules:', err.message);
      throw new HttpException('Error retrieving modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const course = await this.courseModel.findById(id).populate('students modules');
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      if (!course.students || course.students.length === 0) {
        course.is_deleted = true; 
        course.save();
        return 'Course deleted successfully';
      }

      let IsNotComplete = false;
      course.students.forEach(async (studentId) => {
        console.log(studentId);
        let progress = await this.progressModel.find({userId:studentId,courseId:id});
        if ((progress as unknown as Progress).completionPercentage !== 100){
          IsNotComplete = true;
        }
      });
      
      if (IsNotComplete){
        throw new Error ('You can not delete the course as there are some students already enroll')
      }
      
      course.is_deleted = true; 
      course.save();
      return 'Course deleted successfully';
      
    } catch (err) {
      console.error('Error deleting course:', err.message);
      throw new HttpException('Error deleting course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async isStudentEnrolledInCourse(courseId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    console.log('Checking if student is enrolled in course...', courseId, userId);  
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      console.log('Course not found');
      return false;
    }

    return course.students.some((student) => student.toString() === userId.toString());
  }


  async rateCourse(student_id:Types.ObjectId,course_id:Types.ObjectId,rating:number){
      let course = await this.findOne(course_id);
      if(!course){
        throw new Error ('no Course Found with this ID');
      }
      
      if (!rating){
        throw new Error(' You must Enter a rating');
      }

      course.ratings.set(student_id,rating);
      await course.save();
      let trys = this.courseModel.findById(course_id);
      return trys;
  }


  async enableNotes(courseId: Types.ObjectId){
    let course = await this.findOne(courseId);
    if(!course){
      throw new Error ('no Course Found with this ID');
    }
    course.isNoteEnabled = true;
    await course.save();
    return course;
  }

  async disableNotes(courseId: Types.ObjectId){
    let course = await this.findOne(courseId);
    if(!course){
      throw new Error ('no Course Found with this ID');
    }
    course.isNoteEnabled = false;
    await course.save();
    return course;
  }

}
