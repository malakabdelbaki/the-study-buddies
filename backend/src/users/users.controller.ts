  import { Controller, Get, Post, Body, Put, Param, Req, UseGuards, ForbiddenException, InternalServerErrorException, Delete, Patch }  from '@nestjs/common';
  import { UserService } from './users.service';
  import { CreateUserDto } from './dtos/create-user.dto';
  import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
  //import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { authorizationGuard } from '../auth/guards/authorization.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../enums/role.enum';
  import { Public } from '../auth/decorators/public.decorator';
  import { User } from 'src/Models/user.schema';
  import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';
import { ChangePasswordDto } from './dtos/change-password-dto';

  @ApiTags('Users') 
  @Controller('users')
  @UseGuards(authorizationGuard)
  export class UserController {
    constructor(private readonly userService: UserService) {}

    /** --------- ADMIN ONLY ENDPOINTS ----------- */

    @Get('admins')
    //@Roles(Role.Admin)
    @ApiOperation({ summary: 'Retrieve all admin accounts' })
    async getAllAdmins(): Promise<User[]> {
        try {
        return await this.userService.getAllAdmins();
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

    @Get('instructors')
    //@Roles(Role.Admin)
    @ApiOperation({ summary: 'Retrieve all instructor accounts' })
    async getAllInstructors(): Promise<User[]> {
        try {
        return await this.userService.getAllInstructors();
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

    @Delete(':userId')
    //@Roles(Role.Admin)
    @ApiOperation({ summary: 'Delete a user account' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to delete' })
    async deleteUser(@Param('userId') userId: string): Promise<{ message: string }> {
        try {
        return await this.userService.deleteUser(userId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

    @Patch('change-password/:userId')
    //@Roles(Role.Admin)
    @ApiParam({
      name: 'userId',
      description: 'The ID of the user whose password is to be changed',
      required: true,
    })
    @ApiOperation({ summary: 'Admin changes password for a student or instructor' })
    @ApiBody({
      type: ChangePasswordDto,
      description: 'DTO containing the new password for the user',
    })

    async changeUserPassword(
      @Param('userId') userId: string,
      @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<string> {
      return this.userService.changeUserPassword(userId, changePasswordDto);
    }
  
    /** --------- ADMIN & INSTRUCTOR ENDPOINTS ----------- */


    @Get('courses/:courseId/students')
    //@Roles(Role.Admin, Role.Instructor)
    @ApiOperation({ summary: 'Retrieve all students in a specific course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    async getAllStudentsInCourse(@Param('courseId') courseId: string): Promise<User[]> {
        try {
        return await this.userService.getAllStudentsInCourse(courseId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

    
  
    // Create a new user account (Admin can create any user, Instructor can create only students)
    @Post()
    //@Roles(Role.Admin, Role.Instructor)
    @ApiOperation({ summary: 'Create a new user account' })
    @ApiBody({
        description: 'User account details',
        type: CreateUserDto,
    })
    async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
      const currentUser = req.user; // Assuming JWT payload contains user info
      return this.userService.createUser(createUserDto, currentUser);
    }
  
    // Assign students to a course (Admin or Instructor)
    @Put('courses/:courseId/assign-students')
    //@Roles(Role.Admin, Role.Instructor)
    @ApiOperation({ summary: 'Assign students to a course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    @ApiBody({
        description: 'List of student IDs to assign to the course',
        examples: {
        example1: {
            value: { studentIds: ['67474e90d0ba1376650fa797', '67474e90d0ba1376650fa794'] },
        },
        },
    })
    async assignStudentsToCourse( @Param('courseId') courseId: string, @Body('studentIds') studentIds: string[]) {
      return this.userService.assignStudentsToCourse(courseId, studentIds);
    }
  
    // Update student progress
    @Put('courses/:courseId/students/:studentId/progress')
    //@Roles(Role.Admin, Role.Instructor)
    @ApiOperation({ summary: 'Update student progress in a course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student' })
    @ApiBody({
        description: 'Progress update payload',
        examples: { example1: { value: { completionPercentage: 75 } } },
    })
    async updateStudentProgress(@Param('courseId') courseId: string, @Param('studentId') studentId: string, @Body('completionPercentage') completionPercentage: number) {
      return this.userService.updateStudentProgress(courseId, studentId, completionPercentage);
    }
  


    /** --------- PUBLIC ENDPOINTS ----------- */

    // Find user by ID
    @Get(':userId')
    //@Public()
    @ApiOperation({ summary: 'Retrieve a user by their ID' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to retrieve' })
    async findUserById(@Param('userId') userId: string): Promise<User> {
        try {
        return await this.userService.findUserById(userId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }
  
    // Update personal information (User-specific access)
    @Put(':userId/personal-info')
    //@Public()
    @ApiOperation({ summary: 'Update personal information of a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
    @ApiBody({ type: UpdateUserInfoDto })
    async updatePersonalInfo(
      @Param('userId') userId: string,
      @Body() updateDto: UpdateUserInfoDto,
      @Req() req: any,
    ) {
      const currentUser = req.user;
  
      return this.userService.updateUserInfo(userId, updateDto);
    }
  
    // View enrolled courses of a student
    @Get(':userId/courses/enrolled')
    //@Public()
    @ApiOperation({ summary: 'View enrolled courses for a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user' })
    async getEnrolledCoursesOfStudent(@Param('userId') userId: string, @Req() req: any) {
      const currentUser = req.user;
  
      return this.userService.getEnrolledCoursesOfStudent(userId);
    }
  
    // View completed courses of a student
    @Get(':userId/courses/completed')
    //@Public()
    @ApiOperation({ summary: 'View completed courses for a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user' })
    async getCompletedCoursesOfStudent(@Param('userId') userId: string, @Req() req: any) {
      const currentUser = req.user;
  
      return this.userService.getCompletedCoursesOfStudent(userId);
    }
  
    // Get student average score 
    @Get('students/:studentId/average-score')
    //@Public()
    @ApiOperation({ summary: 'Get the average score of a student' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student' })
    async getStudentAverageScore(@Param('studentId') studentId: string, @Req() req: any) {
      const currentUser = req.user;
  
    //   // Students can only view their own scores
    //   if (currentUser.role === Role.Student && currentUser.id !== studentId) {
    //     throw new ForbiddenException('You are not allowed to view this student\'s scores.');
    //   }
  
      return this.userService.getStudentAverageScore(studentId);
    }
  
    // Get student progress in a specific course 
    @Get('courses/:courseId/students/:studentId/progress')
    //@Public()
    @ApiOperation({ summary: 'View progress of a student in a specific course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student' })
    async getStudentProgress(@Param('courseId') courseId: string, @Param('studentId') studentId: string, @Req() req: any, ) {
      const currentUser = req.user;
  
    //   // Students can only view their own progress
    //   if (currentUser.role === Role.Student && currentUser.id !== studentId) { 
    //     throw new ForbiddenException('You are not allowed to view this student\'s progress.');  needs jwt
    //   }
  
      return this.userService.getStudentProgress(courseId, studentId);
    }
    
    // get all courses taught by a certain instructor
    @Get(':instructorId/courses')
    //@Public()
    @ApiOperation({ summary: 'Get all course titles taught by a specific instructor' })
    @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
    async getCoursesByInstructor(@Param('instructorId') instructorId: string) {

      
      return this.userService.getCoursesByInstructor(instructorId);
    }
  }
  