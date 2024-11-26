import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Model } from 'mongoose';
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

  async findOne(id:string) {
    let course = await this.courseModel.findById(id);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    let course = this.findOne(id);
    if (!course){
      throw new Error('Course Not found');
    }
    let updatedcourse = await this.courseModel.findByIdAndUpdate(id,updateCourseDto,{new:true});
    return updatedcourse.save();
  }

  async remove(id: string) {
    let course = this.findOne(id);
    if (!course){
      throw new Error ('not found course ');
    }
    await this.courseModel.findByIdAndDelete(id);
    //handle any additional things that may affect the other features
    return 'deleted successfully';
  }
}
