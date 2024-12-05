  import { Controller, Get, Post, Body, Put, Param, Req, UseGuards
  ,InternalServerErrorException, Delete, Patch, ForbiddenException,BadRequestException,
  SetMetadata,}  from '@nestjs/common';
  import { UserService } from './users.service';
  import { CreateUserDto } from './dtos/create-user.dto';
  import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
  import { authorizationGuard } from '../auth/guards/authorization.guard';
  import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../enums/role.enum';
  import { Public } from '../auth/decorators/public.decorator';
  import { User } from 'src/Models/user.schema';
  import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';
  import { ChangePasswordDto } from './dtos/change-password-dto';
  import { RateDto } from './dtos/rate-dto';
  import { EnrollInCourseDto } from './dtos/enroll-in-course-dto';
  import { CreateProgressDto } from './dtos/create-progress-dto';

//@SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  @ApiTags('Users') 
  @Controller('users')
  @UseGuards(authorizationGuard)
  export class UserController {
    constructor(private readonly userService: UserService) {}

    /** --------- ADMIN ONLY ENDPOINTS ----------- */

    @Get('admins')
    //@Roles(Role.Admin)
    @ApiOperation({ summary: 'Retrieve all admin accounts' })
    // @SetMetadata(ROLES_KEY, [Role.Admin])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
    async getAllStudentsInCourse(@Param('courseId') courseId: string): Promise<User[]> {
        try {
        return await this.userService.getAllStudentsInCourse(courseId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
    async assignStudentsToCourse( @Param('courseId') courseId: string, @Body('studentIds') studentIds: string[]) {
      return this.userService.assignStudentsToCourse(courseId, studentIds);
    }
  
    // Update student progress
    @Put('courses/:courseId/students/:studentId/progress')
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
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


    // Create a new user account (Admin can create any user, Instructor can create only students)
    @Post()
    //@Roles(Role.Admin, Role.Instructor)
    @ApiOperation({ summary: 'Create a new user account' })
    @ApiBody({
        description: 'User account details',
        type: CreateUserDto,
    })
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
      const currentUser = req.user; // Assuming JWT payload contains user info
      return this.userService.createUser(createUserDto);
    }

    // Find user by ID
    @Get(':userId')
    //@Public()
    @ApiOperation({ summary: 'Retrieve a user by their ID' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to retrieve' })
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getEnrolledCoursesOfStudent(@Param('userId') userId: string, @Req() req: any) {
      const currentUser = req.user;
  
      return this.userService.getEnrolledCoursesOfStudent(userId);
    }
  
    // View completed courses of a student
    @Get(':userId/courses/completed')
    //@Public()
    @ApiOperation({ summary: 'View completed courses for a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user' })
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getCompletedCoursesOfStudent(@Param('userId') userId: string, @Req() req: any) {
      const currentUser = req.user;
  
      return this.userService.getCompletedCoursesOfStudent(userId);
    }
  
    // Get student average score 
    @Get('students/:studentId/average-score')
    //@Public()
    @ApiOperation({ summary: 'Get the average score of a student' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student' })
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
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
    // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getCoursesByInstructor(@Param('instructorId') instructorId: string) {


      return this.userService.getCoursesByInstructor(instructorId);
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Rate a Module
  @Post('rate/module')
  @ApiOperation({ summary: 'Rate a module' })
  @ApiBody({ type: RateDto })
  // @SetMetadata(ROLES_KEY, [Role.Student])
  async rateModule(@Body() dto: RateDto, @Req() req: any) {
    const userRole = req.user?.role;

    // // Ensure user role is Student
    // if (userRole !== Role.Student) {
    //   throw new ForbiddenException('Only students can rate a module');
    // }

    try {
      return await this.userService.rateModule(dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to rate module');
    }
  }

  // Rate a Course
  @Post('rate/course')
  @ApiOperation({ summary: 'Rate a course' })
  @ApiBody({ type: RateDto })
  // @SetMetadata(ROLES_KEY, [Role.Student])
  async rateCourse(@Body() dto: RateDto, @Req() req: any) {
    const userRole = req.user?.role;

    // // Ensure user role is Student
    // if (userRole !== Role.Student) {
    //   throw new ForbiddenException('Only students can rate a course');
    // }

    try {
      return await this.userService.rateCourse(dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to rate course');
    }
  }

  // Rate an Instructor
  @Post('rate/instructor')
  @ApiOperation({ summary: 'Rate an instructor' })
  @ApiBody({ type: RateDto })
  // @SetMetadata(ROLES_KEY, [Role.Student])
  async rateInstructor(@Body() dto: RateDto, @Req() req: any) {
    const userRole = req.user?.role;

    // // Ensure user role is Student
    // if (userRole !== Role.Student) {
    //   throw new ForbiddenException('Only students can rate an instructor');
    // }

    try {
      return await this.userService.rateInstructor(dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to rate instructor');
    }
  }

  // Enroll in a Course
  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiBody({ type: EnrollInCourseDto })
  // @SetMetadata(ROLES_KEY, [Role.Student])
  async enrollInCourse(@Body() dto: EnrollInCourseDto, @Req() req: any) {
    const userRole = req.user?.role;

    // // Ensure user role is Student
    // if (userRole !== Role.Student) {
    //   throw new ForbiddenException('Only students can enroll in a course');
    // }

    try {
      return await this.userService.enrollInCourse(dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Failed to enroll in course');
    }
  }

  // Create Progress
  @Post('progress')
  @ApiOperation({ summary: 'Create progress for a course' })
  @ApiBody({ type: CreateProgressDto })
  // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
  async createProgress(@Body() dto: CreateProgressDto, @Req() req: any) {
    const userRole = req.user?.role;

    // if (userRole !== Role.Student) {
    //   throw new ForbiddenException('Only students can create progress');
    // }

    try {
      return await this.userService.createProgress(dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Failed to create progress');
    }
  }
  }
  