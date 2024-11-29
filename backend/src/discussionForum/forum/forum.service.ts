import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Forum, ForumDocument } from '../../Models/forum.schema';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { Types } from 'mongoose';
import { CoursesService } from '../../courses/courses.service';
import { User } from 'src/models/user.schema';
import { UserService } from 'src/users/users.service';
import { Thread, ThreadDocument } from '../../Models/thread.schema';
import { Course } from 'src/Models/course.schema';

@Injectable()
export class ForumService {
  constructor(
    @InjectModel(Forum.name) private readonly forumModel: Model<ForumDocument>,
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    private readonly courseService: CoursesService,
    private readonly userService: UserService
  ) {}

  async create(createForumDto: CreateForumDto) {
    const createdForum = new this.forumModel(createForumDto);
    return createdForum.save();
  }

  async findAll() {
    return this.forumModel.find().exec();
  }

  async findByCourse(courseId: string) {
    const forums = await this.forumModel.find({ course_id: courseId }).exec();
    console.log(forums);
    return forums;
  }

  async findByInstructor(instructorId: string) {
    const instructorObjectId = new Types.ObjectId(instructorId);
    const courses = await this.courseModel.find({ instructor_id: instructorObjectId }).exec();
    const forums = [];
    for (const course of courses) {
      const courseForums = await this.findByCourse(course._id.toString());
      forums.push(...courseForums); // Use spread to flatten results into the forums array
    }
    return forums;
  }

  async findForumsOfStudent(studentId: string) {
    const enrolledCourses = await this.userService.getEnrolledCoursesOfStudent(studentId);
    const forums = [];
    for (const course of enrolledCourses) {
      const courseForums = await this.findByCourse((course as any)._id.toString());
      forums.push(...courseForums); // Use spread to flatten results into the forums array
    }
    return forums;  
  }

  async findThreads(forumId: string) {
    const forum = await this.forumModel.findById(forumId).exec();
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
    const forum = await this.forumModel.findByIdAndUpdate(id, updateForumDto, { new: true }).exec();
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    return forum.save();
  }

  async archive(id: string): Promise<void> {
   const forum = await this.forumModel.findById(id).exec();
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    forum.is_active = false;
    const threads = await this.findThreads(id);
    for (const thread of threads) {
      thread.isResolved = true;
      await thread.save();
    }
    await forum.save();
    
  }

}
