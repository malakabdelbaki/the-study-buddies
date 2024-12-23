import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Forum, ForumDocument } from '../../Models/forum.schema';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { Types } from 'mongoose';
import { CoursesService } from '../../courses/courses.service';
import { User } from 'src/Models/user.schema';
import { UserService } from 'src/users/users.service';
import { Thread, ThreadDocument } from '../../Models/thread.schema';
import { Course } from 'src/Models/course.schema';
import { Role } from '../../enums/role.enum';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel(Forum.name) private readonly forumModel: Model<ForumDocument>,
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly courseService: CoursesService,
    private readonly userService: UserService
  ) {}

  async create(createForumDto: CreateForumDto, user: Types.ObjectId, creator_name:string): Promise<Forum> {
    const { title, description, course_id, created_by } = createForumDto;
    const courseObjId = new Types.ObjectId(course_id);
    const createdForum = new this.forumModel({ title: title, description : description, course_id : courseObjId, created_by: user, creator_name: creator_name });
    return createdForum.save();
  }

  
  async findByCourse(courseId: Types.ObjectId) {
    const course = await this.courseService.findOne(new Types.ObjectId(courseId));
    if (!course) {
      throw new NotFoundException(`Course #${courseId} not found`);
    }
    const forums = await this.forumModel.find({ course_id: new Types.ObjectId(courseId) }).exec();
    return forums;
  }

  async findByInstructor(instructorId: string) {
    const courses = await this.courseModel.find({ instructor_id: new Types.ObjectId(instructorId) }).exec();
    const forums = [];
    for (const course of courses) {
      const courseForums = await this.forumModel.find({      
        course_id: new Types.ObjectId(course._id) 
      }).exec();
      forums.push(...courseForums); 
    }
    return forums;
  }

  async findForumsOfStudent(studentId: string) {
    const enrolledCourses = await this.userService.getEnrolledCoursesOfStudent(studentId);
    const forums = [];
    for (const course of enrolledCourses) {
      const courseForums =  await this.forumModel.find({ course_id: (course as any)._id }).exec();
      forums.push(...courseForums); 
    }
    return forums;  
  }

  async findThreads(forumId: string) {
    const forum = await this.forumModel.findById(forumId).exec();
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    const threadIds = forum.threads.map(thread => (thread as any)._id);
    const threads = await this.threadModel.find({ _id: { $in: threadIds } }).exec();
    return threads;
  }

  async findOne(id: string) {
    const forum = await this.forumModel.findById(id).exec();
    if (!forum) {
      throw new NotFoundException(`Forum #${id} not found`);
    }
    return forum;
  }

  async update(id: string, updateForumDto: UpdateForumDto): Promise<Forum> {

    const forum = await this.forumModel.findById(id).exec();
    
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
   
    const Updatedforum = await this.forumModel.findByIdAndUpdate(id, updateForumDto, { new: true }).exec();
    return Updatedforum.save();
  }

  async archive(id: string, initiator: Types.ObjectId): Promise<void> {
   const forum = await this.forumModel.findById(id).exec();
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }  

    const user = await this.userService.findUserById(initiator.toString()); 
    if(user.role == Role.Student 
      && initiator.toString()!==forum.created_by.toString()) {
      throw new NotFoundException('User not authorized to update forum');
    }

    forum.is_active = false;
    const threads = await this.findThreads(id);
    for (const thread of threads) {
      thread.isResolved = true;
      await thread.save();
    }
    await forum.save();
    
  }

  async remove(id: string ): Promise<Forum> {
    const deletedForum = await this.forumModel.findByIdAndDelete(new Types.ObjectId(id)).exec();
   
    if (!deletedForum) {
      throw new NotFoundException('Forum not found');
    }
    return deletedForum;
  }

  async isCreator(forumId: string, userId: string): Promise<boolean> {
    const forum = await this.forumModel.findById(forumId).exec();
    
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    console.log(forum);
    console.log(userId);
    return forum.created_by.toString() === userId;
  }

  async isMember(forumId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    console.log("ISMEMBER");
    const forum = await this.forumModel.findById(forumId).exec();
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    
    const course = await this.courseService.findOne(forum.course_id);
    console.log(course);
    console.log(userId);
    console.log(forum);
    if (course.instructor_id._id.toString()===userId.toString()) {
      return true;
    }
    const enrolledStudents = await this.userService.getAllStudentsInCourse(course._id.toString());
    return enrolledStudents.some(student => (student as any)._id.toString()===userId.toString());
  }

  async searchForums(query: string, course_id: string): Promise<Thread[]> {
    return await this.forumModel
      .find({
        course_id: new Types.ObjectId(course_id),
        $or: [
          { title: { $regex: query, $options: 'i' } }, // Case-insensitive regex
          { description: { $regex: query, $options: 'i' } },
        ],
      });
    }
}
