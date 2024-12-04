import {  Controller, 
  Get,  Post, Body,  Patch, Param, Delete, Query, HttpException,  HttpStatus, 
  UseGuards
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { Role } from 'src/enums/role.enum';

@ApiTags('Courses') // Tag for Swagger grouping
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Create a new course' })
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    try {
      return await this.coursesService.create({...createCourseDto,
        instructor_id:new Types.ObjectId(createCourseDto.instructor_id)});
    } catch (err) {
      console.error('Error creating course:', err.message);
      throw new HttpException('Error creating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Retrieve all courses with optional filters' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by course title' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by course category' })
  @ApiQuery({ name: 'key_word', required: false, description: 'Filter by course keywords' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Filter by difficulty level' })
  @ApiQuery({ name: 'instructor', required: false, description: 'Filter by instructor name' })
  @Get()
  async findAll(
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('key_word') key_word?: string,
    @Query('difficulty') difficulty?: string,
    @Query('instructor') instructor?: string,
  ) {
    try {
      return await this.coursesService.findAll(title, category, key_word, difficulty, instructor);
    } catch (err) {
      console.error('Error fetching courses:', err.message);
      throw new HttpException('Error fetching courses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Retrieve a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.findOne(objectId);
    } catch (err) {
      console.error('Error fetching course:', err.message);
      throw err instanceof HttpException
        ? err
        : new HttpException('Error fetching course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Roles(Role.Instructor)
@UseGuards(authorizationGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.update(objectId, updateCourseDto);
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Retrieve modules of a course with optional difficulty filter' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Filter modules by difficulty' })
  @Get(':id/modules')
  async getModules(@Param('id') id: string, @Query('difficulty') difficulty?: string) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.getModules(objectId, difficulty);
    } catch (err) {
      console.error('Error fetching modules:', err.message);
      throw new HttpException('Error fetching modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Roles(Role.Admin)
  @UseGuards(authorizationGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.remove(objectId);
    } catch (err) {
      console.error('Error deleting course:', err.message);
      throw new HttpException('Error deleting course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
