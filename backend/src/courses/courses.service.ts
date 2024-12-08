import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/Models/course.schema';
import { User } from 'src/models/user.schema';
import { ModuleService } from 'src/module/module.service';
import { CreateModuleDto } from 'src/module/dto/create-module.dto';
import { Module } from 'src/Models/modules.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<CourseDocument>,
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

  async findAll(title?: string, category?: string, key_word?: string, difficulty?: string, instructor?: string) {
    try {
      let courses = await this.courseModel.find().populate('instructor_id');
      if (title) courses = courses.filter((course) => course.title === title);
      if (category) courses = courses.filter((course) => course.category === category);
      if (key_word) courses = courses.filter((course) => course.key_words.includes(key_word));
      if (difficulty) courses = courses.filter((course) => course.difficulty_level === difficulty);
      if (instructor) {
        courses = courses.filter((course) => {
          const instructorDetails = course.instructor_id as unknown as User; // Assert type
          return instructorDetails.name === instructor;
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
      const course = await this.courseModel.findById(id);
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
      const updatedCourse = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true });
      return await updatedCourse.save();
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getModules(id: Types.ObjectId, difficulty?: string) {
    try {
      const course = await this.courseModel.findById(id).populate<{ modules: Module[] }>('modules');
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      let modules = course.modules;
      if (!modules || modules.length === 0) {
        throw new HttpException('No modules found for this course', HttpStatus.NOT_FOUND);
      }

      if (difficulty) {
        modules = modules.filter((module) => module.module_difficulty === difficulty);
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

      if (!course.students || course.students.length > 0) {
        throw new HttpException(
          'Cannot delete course as it still has enrolled students',
          HttpStatus.BAD_REQUEST,
        );
      }

      const modules = course.modules;
      for (const mod of modules) {
        try {
          await this.moduleService.deleteModule(mod);
        } catch (err) {
          console.error(`Error deleting module ${mod}:`, err.message);
        }
      }

      await this.courseModel.findByIdAndDelete(id);
      return 'Course deleted successfully';
    } catch (err) {
      console.error('Error deleting course:', err.message);
      throw new HttpException('Error deleting course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async isStudentEnrolledInCourse(courseId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    console.log('Checking if student is enrolled in course...');
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      console.log('Course not found');
      return false;
    }

    return course.students.some((student) => student.toString() === userId.toString());
  }
}
