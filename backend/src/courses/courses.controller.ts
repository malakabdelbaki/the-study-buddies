import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Types } from 'mongoose';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }


  @Get()
  @ApiQuery({ name: 'title', type: String, required: false, description: 'Search courses by title' })
  @ApiQuery({ name: 'category', type: String, required: false, description: 'Search courses by category' })
  async findAll(@Query('title') title:string ,@Query('category') category:string) {
    return await this.coursesService.findAll(title,category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    let ID = new Types.ObjectId(id)
    return await this.coursesService.findOne(ID);
  }

  @Get(':courseid/modules')
  async getModules(@Param('courseid') courseid: string) {
    try {
      // Ensure the courseid is a valid ObjectId
      let ID = new Types.ObjectId(courseid);
      
      // Get modules for the given course ID
      const modules = await this.coursesService.getModules(ID);
      
      // If no modules found, return a meaningful response
      if (!modules || modules.length === 0) {
        throw new HttpException('No modules found for this course', HttpStatus.NOT_FOUND);
      }
  
      return modules;
    } catch (err) {
      // Log the error and throw an exception with the relevant message
      console.error('Error in getModules controller:', err.message);
      throw new HttpException(
        'Error retrieving modules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    let ID = new Types.ObjectId(id)
    return this.coursesService.update(ID, updateCourseDto);
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    let ID = new Types.ObjectId(id)

    return this.coursesService.remove(ID);
  }
}
