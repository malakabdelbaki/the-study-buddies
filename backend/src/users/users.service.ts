import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  mongoose,{ Model } from 'mongoose';
import { User, UserDocument } from '../Models/user.schema';
import { Course, CourseDocument } from '../Models/course.schema';
import { Progress, ProgressDocument } from '../Models/progress.schema';
import { Response, ResponseDocument } from '../Models/response.schema';
import { Module, ModuleDocument } from '../Models/modules.schema';
import { CreateUserDto } from './dtos/create-user.dto';  
import { UpdateUserInfoDto } from './dtos/update-user-info.dto'; 
import { Role } from '../enums/role.enum';
import { Types } from 'mongoose';
import { ChangePasswordDto } from './dtos/change-password-dto';
import * as bcrypt from 'bcrypt';
import { RateDto } from './dtos/rate-dto';
import { EnrollInCourseDto } from './dtos/enroll-in-course-dto';
import { CreateProgressDto } from './dtos/create-progress-dto';
import * as path from 'path'; // Add this import
import * as fs from 'fs'; // If you're using fs to check or delete files



@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  /** --------- ADMIN ONLY FUNCTIONALITIES ----------- */


  // Get all admins
  async getAllAdmins(): Promise<User[]> {
    try {
      const admins = await this.userModel.find({ role: Role.Admin });
      if (!admins.length) throw new NotFoundException('No admins found.');
      return admins;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching admins', error.message);
    }
  }

  // Get all instructors
  async getAllInstructors(): Promise<User[]> {
    try {
      const instructors = await this.userModel.find({ role: Role.Instructor });
      if (!instructors.length) throw new NotFoundException('No instructors found.');
      return instructors;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching instructors', error.message);
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findByIdAndDelete(userId);
      console.log("DELETED USER"+ user)
      if (!user) throw new NotFoundException('User not found.');

      return { message: 'User successfully deleted.' };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user', error.message);
    }
  }

  async changeUserPassword(
    userId: string,
    changeDto: ChangePasswordDto,
  ): Promise<string> {
    try {
      // Find the user by ID
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const isSameAsOldPassword = await bcrypt.compare(changeDto.newPassword, user.passwordHash);
      if (isSameAsOldPassword) {
          throw new BadRequestException('New password cannot be the same as the old password');
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(changeDto.newPassword, 10);
     
      // Update the password hash
      user.passwordHash = hashedPassword;
      await user.save();
  
      return `Password for user ${user.name} has been successfully updated`;
    } catch (error) {
      throw new BadRequestException(`Error updating password: ${error.message}`);
    }
  }

  /** --------- ADMIN & INSTRUCTOR COMMON FUNCTIONALITIES ----------- */

  // Get all students in a specific course
  async getAllStudentsInCourse(courseId: string): Promise<User[]> {
    try {
      // Find the course without populating students
      const course = await this.courseModel.findById(courseId).exec();
  
      if (!course) {
        throw new NotFoundException('Course not found.');
      }
  
      if (!course.students || course.students.length === 0) {
        throw new NotFoundException('No students found in this course.');
      }
  
      // Fetch and populate each student manually
      const populatedStudents = await Promise.all(
        course.students.map(async (studentId: Types.ObjectId) => {
          const student = await this.userModel.findById(studentId).select('name email role').exec();
          if (!student) {
            console.warn(`Student with ID ${studentId} not found.`);
            return null;
          }
          return student;
        })
      );
  
      // Filter out any null values in case some students weren't found
      const validStudents = populatedStudents.filter((student) => student !== null);
  
      console.log('Populated Students:', validStudents);
  
      return validStudents as User[];
    } catch (error: any) {
      console.error('Error fetching students in course:', error.message);
      throw new InternalServerErrorException('Error fetching students in course', error.message);
    }
  }
  

  

  //Find user by email, added for auth
  async findByEmail(email: string):Promise<UserDocument> {
    const user=await this.userModel.findOne({email})
    return user;  // Fetch a student by username
}

  
  

  // Assign students to a course
  async assignStudentsToCourse(courseId: string, studentIds: string[]): Promise<Course> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found.');

      // Convert studentIds to ObjectIds
      const objectIds =  studentIds.map(id => new Types.ObjectId(id));

      // Remove already assigned students from the studentIds array
      const newStudents = objectIds.filter(studentId => !course.students.includes(studentId));

      if (newStudents.length === 0) {
        throw new BadRequestException('All students are already assigned to the course.');
      }

      // Add all new students to the course
      course.students.push(...newStudents);

      // Save the updated course
      return await course.save();
    } catch (error) {
        throw new InternalServerErrorException('Error assigning students to course', error.message);
      }
  }

  //updates student progress
  async updateStudentProgress(courseId: string, studentId: string, completionPercentage: number): Promise<Progress> {
    try {
            if (completionPercentage < 0 || completionPercentage > 100) {
              throw new BadRequestException('Completion percentage must be between 0 and 100.');
            }

         // Ensure ObjectId type if needed
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        const studentObjectId = new mongoose.Types.ObjectId(studentId);

      const progress = await this.progressModel.findOneAndUpdate(
        { courseId : courseObjectId, userId: studentObjectId },
        { completionPercentage, lastAccessed: new Date() },
        { new: true },
      );

      if (!progress) throw new NotFoundException('Progress record not found.');

      return progress;
    } catch (error) {
      throw new InternalServerErrorException('Error updating student progress', error.message);
    }
  }

  //updates student progress
  async updateStudentProgressByName(title: string, name: string, completionPercentage: number): Promise<string> {
    try {
      // Validate completion percentage
      if (completionPercentage < 0 || completionPercentage > 100) {
        throw new BadRequestException('Completion percentage must be between 0 and 100.');
      }
  
      // Find course and student based on title and name
      const course = await this.courseModel.findOne({ title });
      const student = await this.userModel.findOne({ name });
  
      // Check if course or student exists
      if (!course) {
        throw new NotFoundException(`Course with title "${title}" not found.`);
      }
  
      if (!student) {
        throw new NotFoundException(`Student with name "${name}" not found.`);
      }
  
      // Update progress with courseId and userId
      const progress = await this.progressModel.findOneAndUpdate(
        { courseId: course._id, userId: student._id },
        { completionPercentage, lastAccessed: new Date() },
        { new: true },
      );
  
      if (!progress) {
        throw new NotFoundException('Progress record not found.');
      }
  
      return "Progress Updated Successfully";
    } catch (error) {
      throw new InternalServerErrorException('Error updating student progress', error.message);
    }
  }
  
  

  /** --------- PUBLIC FUNCTIONALITIES ----------- */


  //creates a user account, but instructor only creates user accounts
  /**async createUser(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    try {
      // Ensure instructors can only create student accounts
    //   if (currentUser.role === Role.Instructor && createUserDto.role !== Role.Student) { //needs jwt to work
    //     throw new BadRequestException('Instructors can only create student accounts.');
    //   }
  
      // Check if the email is already in use
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        throw new BadRequestException('Email already in use.');
      }
  
      // Hash the user's password
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);
  
      // Create a new user document
      const newUser = new this.userModel({
        ...createUserDto,
        passwordHash,
      });
  
      // Save and return the new user
      return await newUser.save();
    } catch (error) {
        throw new InternalServerErrorException('Error creating user', error.message);
      }
  } */

  //create a user -edited
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if the email is already in use
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        throw new BadRequestException('Email already in use.');
      }
        
      // Create a new user document
      const newUser = new this.userModel({
        ...createUserDto
      });
      // if(createUserDto.role === Role.Instructor){
      //   newUser.ratings = [];
      // }
  
      // Save and return the new user
      return await newUser.save();
    } catch (error) {
        throw new InternalServerErrorException('Error creating user', error.message);
      }
  }
  

  // Find user by ID
  async findUserById(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found.');
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user by ID', error.message);
    }
  }

  // Update user information
  async updatePersonalInfo(
    userId: string,
    updateDto: UpdateUserInfoDto, // Use DTO to update user info
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateDto, { new: true });

      if (!updatedUser) throw new NotFoundException('User not found.');

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating user personal info', error.message);
    }
  }

  async updateProfilePic(userId: string, file: Express.Multer.File): Promise<User> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete the old profile picture if it exists
      // if (user.profilePictureUrl) {
      //   const oldFilePath = path.join(process.cwd(), user.profilePictureUrl);
      //   if (fs.existsSync(oldFilePath)) {
      //     fs.unlinkSync(oldFilePath);
      //   }
      // }

      // Update the user's profile picture URL
      const profilePictureUrl = path.join('uploads', file.filename);
      user.profilePictureUrl = profilePictureUrl;
      

      // Save the updated user
      await user.save();

      return user;
    } catch (error) {
      // If an error occurs, delete the uploaded file
      // if (file.path) {
      //   fs.unlinkSync(file.path);
      // }
      throw error;
    }
  }
  

  // View enrolled courses of a student
  async getEnrolledCoursesOfStudent(userId: string): Promise<any> {
    try {
      console.log(userId);
      const studentObjectId = new mongoose.Types.ObjectId(userId);

      let courses = await this.courseModel.find({ students: studentObjectId }).populate('instructor_id');
      console.log("Courses hereeee "+ courses);
      if (!courses.length) throw new NotFoundException('No courses found for this user.');
      courses = courses.filter((course)=>course.is_deleted === false);
      console.log("Courses hereeee "+ courses);
      
      return courses;
    } catch (error) {
        throw new InternalServerErrorException('Error fetching enrolled courses', error.message);
      }
  }

 // Track completed courses of a student
async getCompletedCoursesOfStudent(userId: string): Promise<any> {
  try {
    const studentObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch completed progresses and populate the course information
    const completed = await this.progressModel
      .find({ userId: studentObjectId, completionPercentage: 100 })
      .populate({
        path: 'courseId', // Ensure courseId is a reference in progressModel
        select: 'title', // Only fetch the title field from courseModel
      });

    // if (!completed.length) throw new NotFoundException('No completed courses found.');

    // Map the data to return the required structure
    // const result = completed.map((progress) => ({
    //   progressId: progress._id,
    //   title: (progress.courseId as any).title, // Use type assertion
    // }));
    // console.log(result);\
    let completedCourses = [];
    for( const comp of completed){
      completedCourses.push(await this.courseModel.findById(comp.courseId));
    }

    return completedCourses;
  } catch (error) {
    throw new InternalServerErrorException('Error fetching completed courses', error.message);
  }
}


  //get the average of scores of a certain student
  async getStudentAverageScore(studentId: string): Promise<any> {
    try {

      const studentObjectId = new mongoose.Types.ObjectId(studentId);

      // Fetch all responses for the given student
      const studentResponses = await this.responseModel.find({ user_id: studentObjectId });
  
      // If no responses are found, throw an exception
      if (!studentResponses.length) {
        throw new NotFoundException('No responses found for this student.');
      }
  
      // Calculate the total and average score
      const totalScore = studentResponses.reduce((sum, response) => sum + response.score, 0);
      const averageScore = totalScore / studentResponses.length;
  
      // Return the result
      return {
        studentId,
        totalResponses: studentResponses.length,
        averageScore,
      };
    } catch (error) {
        throw new InternalServerErrorException('Error calculating student average score', error.message);
      }
  }
  
  // get progress of student in a certain course
  async getStudentProgress(courseId: string, studentId: string): Promise<Progress> {
    try {

         // Ensure ObjectId type if needed
         const courseObjectId = new mongoose.Types.ObjectId(courseId);
         const studentObjectId = new mongoose.Types.ObjectId(studentId);
      // Find progress record and populate courseId and userId fields
        const progress = await this.progressModel
        .findOne({ courseId: courseObjectId, userId: studentObjectId })
        .populate({
          path: 'courseId', // Populate the courseId field
          select: 'title', // Map courseId to its title
        })
        .populate({
          path: 'userId', // Populate the userId field
          select: 'name', // Map userId to the user's name
        })
        .exec();
  
      if (!progress) {
        throw new NotFoundException('No progress record found for this student in the specified course.');
      }
  
      return progress;
    } catch (error) {
        throw new InternalServerErrorException('Error retrieving student progress', error.message);
      }
  }

  async getStudentProgressByName(title: string, name: string): Promise<Progress> {
    try {
      //console.log(`Received title: ${title}, name: ${name}`);  // Debugging log

      // Find the course ID by title
      const course = await this.courseModel.findOne({ title}).exec();
      if (!course) {
        throw new NotFoundException(`Course with title "${title}" not found.`);
      }
  
      // Find the student ID by name
      const student = await this.userModel.findOne({ name }).exec();
      if (!student) {
        throw new NotFoundException(`Student with name "${name}" not found.`);
      }
  
      // Find progress record by courseId and studentId
      const progress = await this.progressModel
        .findOne({ courseId: course._id, userId: student._id })
        .populate({
          path: 'courseId', // Populate the courseId field
          select: 'title', // Map courseId to its title
        })
        .populate({
          path: 'userId', // Populate the userId field
          select: 'name', // Map userId to the user's name
        })
        .exec();
  
      if (!progress) {
        throw new NotFoundException(
          `No progress record found for student "${name}" in course "${title}".`,
        );
      }
  
      return progress;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error retrieving student progress',
        error.message,
      );
    }
  }
  
  
  // get all courses taught by a certain instructor
  async getCoursesByInstructor(instructorId: string): Promise<any> {
    try {
      // Ensure the instructor ID is a valid ObjectId
      const instructorObjectId = new Types.ObjectId(instructorId);

      // Fetch all courses taught by the instructor
      const courses = await this.courseModel.find({ instructor_id: instructorObjectId }).select('title _id');

      if (!courses.length) {
        throw new NotFoundException(`No courses found for the instructor with ID: ${instructorId}`);
      }

      // Return an array of objects containing both title and id
      return courses.map(course => ({
        title: course.title,
        _id: course._id, 
      }));
    } catch (error) {
      throw new NotFoundException('Error fetching courses', error.message);
    }
  }

  // STUDENT ONLY ENDPOINTS 

  // Rate a Module
  async rateModule(dto: RateDto) {
    const module = await this.moduleModel.findById(dto.targetId);
    if (!module) throw new NotFoundException('Module not found');
    //module.ratings.push(dto.rating);
    await module.save();
    return { message: 'Module rated successfully', ratings: module.ratings };
  }

  // Rate a Course
  async rateCourse(studentId: string, dto: RateDto) {
    const course = await this.courseModel.findById(dto.targetId);
    if (!course) throw new NotFoundException('Course not found');

    // Check if the studentId is in the students array of the course
    if (!course.students.includes(new Types.ObjectId(studentId))) {
      throw new BadRequestException('You are not enrolled in this course in order to rate it');
    }

    //course.ratings.push(dto.rating);
    await course.save();
    return { message: 'Course rated successfully', ratings: course.ratings };
  }

  // Rate an Instructor
  async rateInstructor(studentId: string,dto: RateDto) {
    const instructor = await this.userModel.findById(dto.targetId);
    if (!instructor || instructor.role !== 'instructor')
      throw new NotFoundException('Instructor not found');

    // Fetch all courses taught by the instructor
    const instructorCourses = await this.getCoursesByInstructor(dto.targetId);

    // Fetch all courses the student is enrolled in
    const studentCourses = await this.getEnrolledCoursesOfStudent(studentId);

    // Check if there is any overlap between student's courses and instructor's courses
    const hasCommonCourse = studentCourses.some(studentCourse =>
      instructorCourses.some(instructorCourse => instructorCourse.id.toString() === studentCourse.id.toString())
    );

    if (!hasCommonCourse) {
      throw new BadRequestException(`You are not enrolled in any course taught by this instructor.`);
    }
    console.log(instructor.ratings);
    instructor.ratings.set(new Types.ObjectId(studentId),dto.rating)
    console.log(instructor.ratings);
    //instructor.ratings.push(dto.rating);
    await instructor.save();
    return { message: 'Instructor rated successfully', ratings: instructor.ratings };
  }

  // Enroll in a Course and create progress automatically
  async enrollInCourse(studentId: string, dto: EnrollInCourseDto) {
    const course = await this.courseModel.findById(dto.courseId);
    if (!course) throw new NotFoundException('Course not found');
  
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
  
    // Check if the student is already enrolled
    if (course.students.includes(studentObjectId))
      throw new BadRequestException('Student already enrolled');
  
    // Add the student to the course
    course.students.push(studentObjectId);
    await course.save();
  
    // Create progress for the enrolled student
    try {
      await this.createProgress(studentId,{
        courseId: dto.courseId,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create progress: ' + error.message);
    }
  
    return { message: 'Enrolled in course and progress created successfully', courseId: course.id };
  }
  

  // Create Progress
  async createProgress(studentId: string, dto: CreateProgressDto) {
    const existingProgress = await this.progressModel.findOne({
      userId: studentId,
      courseId: dto.courseId,
    });

    if (existingProgress)
      throw new BadRequestException('Progress for this course already exists');

    const userObjectId = new Types.ObjectId(studentId);
    const courseObjectId = new Types.ObjectId(dto.courseId);

    const progress = new this.progressModel({
      userId: userObjectId,
      courseId: courseObjectId,
      completionPercentage: 0,
      totalNumberOfQuizzes: 0,
      AccumilativeGrade: 0,
      AverageGrade: 0,
    });

    await progress.save();
    return { message: 'Progress created successfully', progress };
  }

  async findUserByName(name: string): Promise<any> {
    try {
      // Check if the role is Instructor, Admin (can search for any user)
      //if (role === Role.Instructor || role === Role.Admin) {
         const found = await this.userModel.findOne({ name });
         return found;
     // }
      
      // If role is Student, allow searching only for instructors
      // if (role === Role.Student) {
      //    const found= await this.userModel.findOne({
      //     where: { name},
      //   });
      //   return found;
      // }

     // throw new Error('Unauthorized role for searching users');
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async searchUsers(searchTerm: string, loggedInUser: any): Promise<User[]> {
    try {
      console.log('Search Term:', searchTerm);
      console.log('Logged In User:', loggedInUser);

      // Base query: search by name or email
      const query: any = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { role: { $regex: searchTerm, $options: 'i' } },
        ],
      };
  

      // Restrict based on the logged-in user's role
    if (loggedInUser.role === Role.Student) {
      // Exclude both admins and students for students
      query['role'] = { $nin: [Role.Student, Role.Admin] };
    } else if (loggedInUser.role === Role.Instructor) {
      // Exclude admins for instructors
      query['role'] = { $ne: Role.Admin };
    }


      // Exclude sensitive fields like passwordHash
      return await this.userModel.find(query).select('-passwordHash');
    } catch (error) {
      throw new Error('Error searching users: ' + error.message);
    }
  }
}
function uuidv4() {
  throw new Error('Function not implemented.');
}

