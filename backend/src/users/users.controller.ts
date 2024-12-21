  import { Controller, Get, Post, Body, Put, Param, Req, UseGuards
  ,InternalServerErrorException, Delete, Patch, ForbiddenException,BadRequestException,
  SetMetadata,
  Query,}  from '@nestjs/common';
  import { UserService } from './users.service';
  import { CreateUserDto } from './dtos/create-user.dto';
  import { UpdateUserInfoDto } from './dtos/update-user-info.dto';
  import { authorizationGuard } from '../auth/guards/authorization.guard';
  import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { Role } from '../enums/role.enum';
  import { Public } from '../auth/decorators/public.decorator';
  import { User } from 'src/Models/user.schema';
  import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
  import { ChangePasswordDto } from './dtos/change-password-dto';
  import { RateDto } from './dtos/rate-dto';
  import { EnrollInCourseDto } from './dtos/enroll-in-course-dto';
  import { CreateProgressDto } from './dtos/create-progress-dto';
  import { AuthGuard } from 'src/auth/guards/authentication.guard';

//@SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  @ApiTags('Users') 
  @Controller('users')
  @UseGuards(authorizationGuard)
  @UseGuards(AuthGuard)
  export class UserController {
    constructor(private readonly userService: UserService) {}


    

    @Get('progress')
    @ApiOperation({ summary: 'View progress of a student in a specific course by name' })
    @ApiQuery({ name: 'title', description: 'course title' })  // Use @ApiQuery for query parameters
    @ApiQuery({ name: 'name', description: 'student name' })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getStudentProgressByName(
      @Query('title') title: string,
      @Query('name') name: string,
      @Req() req: any
    ) {
      console.log(`Received title: ${title}, name: ${name}`);  // Debugging log

      if (!title || !name) {
        throw new BadRequestException('Both title and name are required.');
      }

      const loggedInUser = req.user;

      // Check if the logged-in user is an admin or instructor
      if (loggedInUser.role === Role.Admin || loggedInUser.role === Role.Instructor) {
        // Admins and instructors can access any student's progress
        return this.userService.getStudentProgressByName(title, name);
      }

      // If the logged-in user is a student, they can only view their own progress
      if (loggedInUser.role === Role.Student) {
        if (loggedInUser.name !== name) {
          throw new ForbiddenException('You can only access your own progress');
        }
        return this.userService.getStudentProgressByName(title, name);
      }

      // If the user is not authorized
      throw new ForbiddenException('You do not have permission to view this student\'s progress');
    }

    // Update student progress
    @Put('progress')
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
    @ApiOperation({ summary: 'Update student progress in a course BY NAME ' })
    @ApiQuery({ name: 'title', description: 'course title' })  // Use @ApiQuery for query parameters
    @ApiQuery({ name: 'name', description: 'student name' })
    @ApiBody({
        description: 'Progress update payload',
        examples: { example1: { value: { completionPercentage: 75 } } },
    })
    async updateStudentProgressByName(
     @Query('title') title: string,
     @Query('name') name: string,
     @Body('completionPercentage') completionPercentage: number): Promise<string> {
      return this.userService.updateStudentProgressByName(title, name, completionPercentage);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get the current user' })
    async getMe(@Req() req: any) {
      const loggedInUser = req.user;
      console.log(loggedInUser);
  
      if (!loggedInUser) {
        throw new ForbiddenException('User is not authenticated');
      }
  
      return await this.userService.findUserById(loggedInUser.userid);
    }
  
///////////////////////////////////////////////ADMIN ONLY////////////////////////////////////////////////////////////////////
@Get('search')
  @ApiOperation({ summary: 'Search for users by name or email' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student,Role.Admin])
  async searchUsers(
    @Query('searchTerm') searchTerm: string ,
    @Req() req: any,
  ): Promise<User[]> {
    const loggedInUser = req.user;

    console.log('Search Term:', searchTerm);
    console.log('Logged In User:', loggedInUser);


    if (!loggedInUser) {
      throw new ForbiddenException('User is not logged in.');
    }

    if (!searchTerm || searchTerm.trim() === '') {
      throw new BadRequestException('Search term cannot be empty.');
    }

    try {
      const users = await this.userService.searchUsers(searchTerm, loggedInUser);
      console.log(`Found ${users.length} users matching the search term`);
      return users;

    } catch (error) {
      throw new InternalServerErrorException('Error occurred while searching users: ' + error.message);
    }
  }

    

    @Get('admins')
    //@Roles(Role.Admin)
    @ApiOperation({ summary: 'Retrieve all admin accounts' })
    @SetMetadata(ROLES_KEY, [Role.Admin])
    async getAllAdmins(@Req() req: any): Promise<User[]> {

        const loggedInUser = req.user;

        if (!loggedInUser) {
          throw new ForbiddenException('Admin is not logged in.');
        }
    
        try {
        return await this.userService.getAllAdmins();
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

    @Get('instructors')
    @ApiOperation({ summary: 'Retrieve all instructor accounts' })
    @SetMetadata(ROLES_KEY, [Role.Admin])
    async getAllInstructors(@Req() req: any): Promise<User[]> {

      const loggedInUser = req.user;

        if (!loggedInUser) {
          throw new ForbiddenException('Admin is not logged in.');
        }

        try {
        return await this.userService.getAllInstructors();
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }


    

  
///////////////////////////////////////////////ADMIN AND INSTRUCTOR////////////////////////////////////////////////////////////////////


    @Get('courses/:courseId')
    @ApiOperation({ summary: 'Retrieve all students in a specific course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
    async getAllStudentsInCourse(@Param('courseId') courseId: string): Promise<User[]> {
        try {
        return await this.userService.getAllStudentsInCourse(courseId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }

  
    // Assign students to a course (Admin or Instructor)
    @Put('courses/:courseId/assign-students')
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
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
    async assignStudentsToCourse( @Param('courseId') courseId: string, @Body('studentIds') studentIds: string[]) {
      return this.userService.assignStudentsToCourse(courseId, studentIds);
    }
  
    // Update student progress
    @Put('courses/:courseId/students/:studentId/progress')
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor])
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

     
  


///////////////////////////////////////////////PUBLIC////////////////////////////////////////////////////////////////////



    @Delete(':userId')
    @ApiOperation({ summary: 'Delete a user account' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to delete' , required: false,})
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async deleteUser(@Param('userId') userId: string, @Req() req: any): Promise<{ message: string }> {

      const loggedInUser = req.user;

        if (!loggedInUser) {
          throw new ForbiddenException('User is not logged in.');
        }

        try {
        return await this.userService.deleteUser(userId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }


    @Patch('change-password/:userId')
    @ApiParam({
      name: 'userId',
      description: 'The ID of the user whose password is to be changed',
      required: false,
    })
    @ApiOperation({ summary: 'Change password (Admins for any user, others for themselves)' })
    @ApiBody({
      type: ChangePasswordDto,
      description: 'DTO containing the new password for the user',
    })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async changeUserPassword(
      @Param('userId') userId: string,
      @Body() changePasswordDto: ChangePasswordDto,
      @Req() req: any, // Access the logged-in user's details
    ): Promise<string> {
      try {
        // Extract logged-in user information from the JWT
        const loggedInUser = req.user;

        if (!loggedInUser) {
          throw new ForbiddenException('User is not authenticated');
        }

      // Admins can update their own or anyone's password
      if (loggedInUser.role === Role.Admin) {
        if (!userId) {
          throw new BadRequestException(
            'Admin must specify a userId to change the password'
          );
        }
        return this.userService.changeUserPassword(userId, changePasswordDto);
      }

      // Non-admins can only update their own password
      if (loggedInUser.role === Role.Student || loggedInUser.role === Role.Instructor) {
        // If userId is provided, ensure it matches the logged-in user's ID
        if (userId && loggedInUser.userid !== userId) {
          throw new ForbiddenException('You can only change your own password');
        }

        // Default to the logged-in user's ID if no userId is provided
        return this.userService.changeUserPassword(loggedInUser.userid, changePasswordDto);
      }

      throw new ForbiddenException('Invalid role for this operation');
    } catch (error) {
      throw new BadRequestException(`Error changing password: ${error.message}`);
    }
    }


    // Create a new user account 
    @Post()
    @ApiOperation({ summary: 'Create a new user account' })
    @ApiBody({
        description: 'User account details',
        type: CreateUserDto,
    })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
     // const currentUser = req.user.userid; // Assuming JWT payload contains user info
      return this.userService.createUser(createUserDto);
    }

    // Find user by ID
    @Get(':userId')
    @ApiOperation({ summary: 'Retrieve a user by their ID' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to retrieve' })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async findUserById(@Param('userId') userId: string): Promise<User> {
        try {
        return await this.userService.findUserById(userId);
        } catch (error) {
        throw new InternalServerErrorException(error.message);
        }
    }
  
    // Update personal information 
    @Put(':userId/personal-info')
    @ApiOperation({ summary: 'Update personal information of a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
    @ApiBody({ type: UpdateUserInfoDto })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async updatePersonalInfo(
      @Body() updateDto: UpdateUserInfoDto,
      @Req() req: any,
    ) {
      const currentUser = req.user.userid;
  
      return this.userService.updatePersonalInfo(currentUser, updateDto);
    }
  
    // View enrolled courses of a student
    @Get(':userId?/courses/enrolled')
    @ApiOperation({ summary: 'View enrolled courses for a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user', required: false, })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getEnrolledCoursesOfStudent(@Param('userId') userId: string | undefined, @Req() req: any) {
      const loggedInUser = req.user;

      // Check if the logged-in user is an admin or instructor
      if (loggedInUser.role === Role.Admin || loggedInUser.role === Role.Instructor) {
          return this.userService.getEnrolledCoursesOfStudent(userId);
      }

      if (loggedInUser.role === Role.Student) {

      //   if (userId && userId.trim() !== ''  && loggedInUser.userid !== userId) {
      //    throw new ForbiddenException('You can only access your own courses');
      // }
        return this.userService.getEnrolledCoursesOfStudent(loggedInUser.userid);
      }

      // If the user is not authorized
      throw new ForbiddenException('You do not have permission to view this student\'s courses');
      }
  
    // View completed courses of a student
    @Get(':userId?/courses/completed')
    @ApiOperation({ summary: 'View completed courses for a user' })
    @ApiParam({ name: 'userId', description: 'The ID of the user', required: false, // Mark as optional in Swagger
    })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getCompletedCoursesOfStudent(@Param('userId') userId: string | undefined , @Req() req: any) {
      const loggedInUser = req.user;

      // Check if the logged-in user is an admin or instructor
      if (loggedInUser.role === Role.Admin || loggedInUser.role === Role.Instructor) {
          return this.userService.getCompletedCoursesOfStudent(userId);
      }

      if (loggedInUser.role === Role.Student) {

      //   if (userId != null && loggedInUser.userid !== userId) {
      //    throw new ForbiddenException('You can only access your own courses');
      // }
        return this.userService.getCompletedCoursesOfStudent(loggedInUser.userid);
      }

      // If the user is not authorized
      throw new ForbiddenException('You do not have permission to view this student\'s courses');
  
    }
  
    // Get student average score across all courses (per course implemented by phebe)
    @Get('students/:studentId/average-score')
    @ApiOperation({ summary: 'Get the average score of a student' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student', required: false, })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getStudentAverageScore(@Param('studentId') studentId: string, @Req() req: any) {
      const loggedInUser = req.user;

      // Check if the logged-in user is an admin or instructor
      if (loggedInUser.role === Role.Admin || loggedInUser.role === Role.Instructor) {
          return this.userService.getStudentAverageScore(studentId);
      }

      if (loggedInUser.role === Role.Student) {

      //   if (studentId && loggedInUser.userid !== studentId) {
      //    throw new ForbiddenException('You can only access your own score');
      // }
        return this.userService.getStudentAverageScore(loggedInUser.userid);
      }

      // If the user is not authorized
      throw new ForbiddenException('You do not have permission to view this student\'s scores');
    }
  
    // Get student progress in a specific course 
    @Get('courses/:courseId/student/:studentId/progress')
    @ApiOperation({ summary: 'View progress of a student in a specific course' })
    @ApiParam({ name: 'courseId', description: 'The ID of the course' })
    @ApiParam({ name: 'studentId', description: 'The ID of the student' , required: false,})
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getStudentProgress(@Param('courseId') courseId: string, @Param('studentId') studentId: string, @Req() req: any, ) {
      const loggedInUser = req.user;

        // Check if the logged-in user is an admin or instructor
      if (loggedInUser.role === Role.Admin || loggedInUser.role === Role.Instructor) {
        // Admins and instructors can access any student's progress
        return this.userService.getStudentProgress(courseId, studentId);
      }

      // If the logged-in user is a student, they can only view their own progress
      if (loggedInUser.role === Role.Student) {

      //   if (studentId && loggedInUser.userid !== studentId) {
      //    throw new ForbiddenException('You can only access your own progress');
      // }
        return this.userService.getStudentProgress(courseId, loggedInUser.userid);
      }

      // If the user is not authorized
      throw new ForbiddenException('You do not have permission to view this student\'s progress');
    }
    
    // get all courses taught by a certain instructor
    @Get(':instructorId/courses')
    @ApiOperation({ summary: 'Get all course titles taught by a specific instructor' })
    @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
    @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
    async getCoursesByInstructor(@Param('instructorId') instructorId: string) {


      return this.userService.getCoursesByInstructor(instructorId);
    }

///////////////////////////////////////////////STUDENT ONLY////////////////////////////////////////////////////////////////////

    // Rate a Module
  @Post('rate/module')
  @ApiOperation({ summary: 'Rate a module' })
  @ApiBody({ type: RateDto })
  @SetMetadata(ROLES_KEY, [Role.Student])
  async rateModule(@Body() dto: RateDto, @Req() req: any) {

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
  @SetMetadata(ROLES_KEY, [Role.Student])
  async rateCourse(@Body() dto: RateDto, @Req() req: any) {
    const loggedInUser = req.user.userid;

    try {
      return await this.userService.rateCourse(loggedInUser,dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to rate course');
    }
  }

  // Rate an Instructor
  @Post('rate/instructor')
  @ApiOperation({ summary: 'Rate an instructor' })
  @ApiBody({ type: RateDto })
  @SetMetadata(ROLES_KEY, [Role.Student])
  async rateInstructor(@Body() dto: RateDto, @Req() req: any) {
    const loggedInUser = req.user.userid;
    
    try {
      return await this.userService.rateInstructor(loggedInUser,dto);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to rate instructor');
    }
  }

  // Enroll in a Course
  @Post('enroll')
  @ApiOperation({ summary: 'Enrol                                                                                                                                                                                                                          dl in a course' })
  @ApiBody({ type: EnrollInCourseDto })
  @SetMetadata(ROLES_KEY, [Role.Student])
  async enrollInCourse( @Body() dto: EnrollInCourseDto, @Req() req: any) {

    const loggedInUser= req.user;

    try {
      return await this.userService.enrollInCourse(loggedInUser.userid ,dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message || 'Failed to enroll in course');
    }
  }

  @Get('search/:name')
  @ApiOperation({ summary: 'Search for a user by name' })
  @ApiParam({ name: 'name', description: 'The name of the user to search for' })
  @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student]) // Optional if you want role-based restrictions in metadata
  async findUserByName(@Param('name') name: string, @Req() req: any): Promise<any> {
    const userRole = req.user.role; // Assuming the role is attached to the user in the request object (e.g., from JWT)

    try {
      // // Check if the role is student
      // if (userRole === Role.Student) {
      //   throw new ForbiddenException('Students cannot search for other students. You can only search for instructors.');
      // }

      // Call the service to get the user by name
      const f= await this.userService.findUserByName(name);
      return f ;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error; // Rethrow Forbidden exception
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  
  

  // // Create Progress
  // @Post('progress')
  // @ApiOperation({ summary: 'Create progress for a course' })
  // @ApiBody({ type: CreateProgressDto })
  // // @SetMetadata(ROLES_KEY, [Role.Admin, Role.Instructor, Role.Student])
  // async createProgress( @Param('studentId') studentId: string,
  // @Body() dto: CreateProgressDto, @Req() req: any) {

  //   const loggedInUser= req.user;

  //   // if (userRole !== Role.Student) {
  //   //   throw new ForbiddenException('Only students can create progress');
  //   // }

  //   try {
  //     return await this.userService.createProgress(studentId,dto);
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(error.message || 'Failed to create progress');
  //   }
  // }
}
  