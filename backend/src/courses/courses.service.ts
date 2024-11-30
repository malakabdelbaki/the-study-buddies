import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from 'src/Models/course.schema';

@Injectable()
export class CoursesService {

  //back to this after making the auth to add guards and authorization to some of the functions
  constructor(@InjectModel('Course') private readonly courseModel: Model<Course>){}

  async create(createCourseDto: CreateCourseDto) {
    let newCourse = await this.courseModel.create(createCourseDto);
    return newCourse.save();
  }

  async findAll(title?:string , category?:string) {      //title: { $regex: new RegExp(`${title}`, 'i') }, // Matches titles containing the query

    let courses :any;
    if (title && category){
      courses = await this.courseModel.find({title:title,category:category});
    }
    else if (category){
      courses = await this.courseModel.find({category:category});
    }
    else if (title){
      courses = await this.courseModel.find({title:title});
    }
    else 
    courses = await this.courseModel.find();
    //http://localhost:3000/courses?title=Course%204%20-updated&&category=CS
    return courses;
  }

  async findOne(id:Types.ObjectId) {
    let course = await this.courseModel.findById(id);
    return course;
  }

  async update(id: Types.ObjectId, updateCourseDto: UpdateCourseDto) {
    let course = this.findOne(id);
    if (!course){
      throw new Error('Course Not found');
    }
    console.log(updateCourseDto);
    let updatedcourse = await this.courseModel.findByIdAndUpdate(id,updateCourseDto,{new:true});
    console.log(updatedcourse)
    return updatedcourse.save();
  }


  async getModules(id: Types.ObjectId) {
    try {
      // Attempt to find the course by its ID
      const course = await this.courseModel.findById(id).populate('modules');
  
      // If no course is found, throw an exception
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
  
      // Return the modules from the course
      const modules = course.modules;
  
      // If modules are empty or undefined, throw an exception
      if (!modules || modules.length === 0) {
        throw new HttpException('No modules found for this course', HttpStatus.NOT_FOUND);
      }
  
      return modules;
    } catch (err) {
      // Log the error and throw an exception if there's a problem
      console.error('Error in getModules service:', err.message);
      throw new HttpException(
        'Error retrieving modules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  async AddModule(id:Types.ObjectId,ModuleId:Types.ObjectId){
    let course = (await this.findOne(id)).populate('modules');
    if (!course){
      throw new Error('Course Not found');
    }
    (await course).modules.push(ModuleId);
    await (await course).save(); // Save the changes
    return course;
  }

  async remove(id: Types.ObjectId) {
    let course = this.findOne(id);
    if (!course){
      throw new Error ('not found course ');
    }
    await this.courseModel.findByIdAndDelete(id);
    //handle any additional things that may affect the other features
    //such as delete the relevent modules and student performanse and so on
    
    return 'deleted successfully';
  }
}
