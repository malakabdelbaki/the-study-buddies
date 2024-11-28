import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  mongoose,{ Model } from 'mongoose';
import { User, UserDocument } from '../Models/user.schema';
import { Course, CourseDocument } from '../Models/course.schema';
import { Progress, ProgressDocument } from '../Models/progress.schema';
import { Response, ResponseDocument } from '../Models/response.schema';
import { CreateUserDto } from './dtos/create-user.dto';  // Importing DTOs
import { UpdateUserInfoDto } from './dtos/update-user-info.dto'; // Importing DTOs
import { Role } from '../enums/role.enum';
import { Types } from 'mongoose';
import { ChangePasswordDto } from './dtos/change-password-dto';
import bcrypt from 'bcrypt';



@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    @InjectModel(Response.name) private responseModel: Model<ResponseDocument>,
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
      const course = await this.courseModel.findById(courseId).populate('students');
      if (!course) throw new NotFoundException('Course not found.');

      const students = course.students as unknown as User[]; // Resolves TypeScript warning
      if (!students.length) throw new NotFoundException('No students found in this course.');
      return students;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching students in course', error.message);
    }
  }

  

  //creates a user account, but instructor only creates user accounts
  async createUser(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
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
  }
  

  // Assign students to a course
  async assignStudentsToCourse(courseId: string, studentIds: string[]): Promise<Course> {
    try {
      const course = await this.courseModel.findById(courseId);
      if (!course) throw new NotFoundException('Course not found.');

      // Convert studentIds to ObjectIds
      const objectIds =  studentIds.map(id => new Types.ObjectId(id));

      course.students.push(...objectIds);
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
  

  /** --------- PUBLIC FUNCTIONALITIES ----------- */

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
  async updateUserInfo(
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

  // View enrolled courses of a student
  async getEnrolledCoursesOfStudent(userId: string): Promise<Course[]> {
    try {

      const studentObjectId = new mongoose.Types.ObjectId(userId);

      const courses = await this.courseModel.find({ students: studentObjectId });

      if (!courses.length) throw new NotFoundException('No courses found for this user.');

      return courses; // No need for select() or populate() if just titles and descriptions are needed
    } catch (error) {
        throw new InternalServerErrorException('Error fetching enrolled courses', error.message);
      }
  }

  // Track completed courses of a student
  async getCompletedCoursesOfStudent(userId: string): Promise<any> {
    try {

     const studentObjectId = new mongoose.Types.ObjectId(userId);

      const completed = await this.progressModel
        .find({ userId: studentObjectId , completionPercentage: 100 }); // Fetching only fully completed courses

      if (!completed.length) throw new NotFoundException('No completed courses found.');

      return completed;

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
      // Find progress record for the specified course and student
      const progress = await this.progressModel.findOne({ courseId: courseObjectId, userId: studentObjectId});
  
      if (!progress) {
        throw new NotFoundException('No progress record found for this student in the specified course.');
      }
  
      return progress;
    } catch (error) {
        throw new InternalServerErrorException('Error retrieving student progress', error.message);
      }
  }
  
  // get all courses taught by a certain instructor
  async getCoursesByInstructor(instructorId: string): Promise<string[]> {
    try {
      // Ensure the instructor ID is a valid ObjectId
      const instructorObjectId = new Types.ObjectId(instructorId);

      // Fetch all courses taught by the instructor
      const courses = await this.courseModel.find({ instructor_id: instructorObjectId }).select('title -_id');

      if (!courses.length) {
        throw new NotFoundException(`No courses found for the instructor with ID: ${instructorId}`);
      }

      // Extract and return the titles
      return courses.map(course => course.title);
    } catch (error) {
      throw new NotFoundException('Error fetching courses', error.message);
    }
  }
  
}
