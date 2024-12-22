import {  Controller, 
  Get,  Post, Body,  Patch, Param, Delete, Query, HttpException,  HttpStatus, 
  UseGuards,
  Req
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from '../auth/guards/authentication.guard';
import { InstructorGuard } from 'src/auth/guards/instructor.guard';

@ApiTags('Courses') // Tag for Swagger grouping
@UseGuards(AuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Create a new course' })
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @ApiOperation({ summary: 'Creat e a new course' })
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Post()
  async create(@Req() request,@Body() createCourseDto: CreateCourseDto) {
    try {
      // const instructorId = '675467bea5b439cd11141846'; // Extract instructorId
      // console.log('kk');
      // if(!instructorId || !request.user){
      //   throw new HttpException('Error not found an instructor', HttpStatus.INTERNAL_SERVER_ERROR);
      // }
      return await this.coursesService.create({...createCourseDto,
        instructor_id: new Types.ObjectId(request.user.userid)}); 
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
    @Req() request,
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('key_word') key_word?: string,
    @Query('difficulty') difficulty?: string,
    @Query('instructor') instructor?: string,
  ) {
    try {
      console.log(title);
      let ID = new Types.ObjectId(request.user.userid)
      let courses = await this.coursesService.findAll(ID,title, category, key_word, difficulty, instructor);
      return courses;

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
      console.log(id);
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
  async update(@Req() request,@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    try {
      console.log('wwwwwww')
      if (!request.user || !request.user.userid)
        throw new HttpException('You Can not update this Course!', HttpStatus.INTERNAL_SERVER_ERROR);
      
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.update(objectId, updateCourseDto);
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Retrieve modules of a course with optional difficulty filter' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Get(':id/modules')
  async getModules(@Req() request,@Param('id') id: string) {
    try {
      
      const user_id = request.user?.userid; // Extract instructorId
      if(!user_id || !request.user){
        throw new HttpException('Error not found an instructor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const courseId = new Types.ObjectId(id);
      const user = new Types.ObjectId(user_id)
      return await this.coursesService.getModules(user,courseId);
    } catch (err) {
      console.error('Error fetching modules:', err.message);
      throw new HttpException('Error fetching modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Roles(Role.Admin,Role.Instructor)
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

  @ApiOperation({ summary: 'Rate Course' })
  @ApiParam({ name: 'id', description: 'Course ID', type: String })
  @Roles(Role.Student)
  @UseGuards(authorizationGuard)
  @Post(':id/rate')
  async RateCourse(@Req() request,@Param('id') id: string ,@Body() ratingbody:{rating:number}) {
    try {
      const {rating} = ratingbody;
      const courseid = new Types.ObjectId(id);
      const studentid = request.user?.userid; // Extract instructorId
      if(!studentid || !request.user){
        throw new HttpException('Error not found a student', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return await this.coursesService.rateCourse(studentid,courseid,rating);
    } catch (err) {
      console.log(err.message);
      throw new HttpException('Error Rating a Course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':course_id/enableNotes')
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  async enableNotes(@Req() request,@Param('course_id') id: string) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.enableNotes(objectId);
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':course_id/disableNotes')
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  async disableNotes(@Req() request,@Param('course_id') id: string) {
    try {
      const objectId = new Types.ObjectId(id);
      return await this.coursesService.disableNotes(objectId);
    } catch (err) {
      console.error('Error updating course:', err.message);
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
