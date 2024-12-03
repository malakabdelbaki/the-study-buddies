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

  async validateInitiator(initiator: Types.ObjectId, courseId: Types.ObjectId): Promise<Boolean> {
    const user = await this.userService.findUserById(initiator.toString());
    const course = await this.courseService.findOne(new Types.ObjectId(courseId));
    if (user.role === Role.Student
      && !course.students.some(student => student.equals((user as any)._id))
    ) {
      throw new NotFoundException('Student is not enrolled in the course');
    }

    if (user.role === Role.Instructor
      && !course.instructor_id.equals((user as any)._id)
    ) {
      throw new NotFoundException('Instructor is not teaching the course');
    }
    return true;
  }

  async create(createForumDto: CreateForumDto) {
    const {course_id, created_by} = createForumDto;
    const user = await this.userService.findUserById(created_by.toString());
    const course = await this.courseService.findOne(course_id);
    if (!course || !user) {
      throw new NotFoundException(`Course #${course_id} or user not found`);
    }
    if(!this.validateInitiator(new Types.ObjectId(created_by), course_id)) {
      throw new NotFoundException('User not authorized to create forum');
    }

    const createdForum = new this.forumModel(createForumDto);
    return createdForum.save();
  }

  
  async findByCourse(courseId: Types.ObjectId , initiator: Types.ObjectId) {
    const course = await this.courseService.findOne(new Types.ObjectId(courseId));
    if (!course) {
      throw new NotFoundException(`Course #${courseId} not found`);
    }

    if(!this.validateInitiator(new Types.ObjectId(initiator), courseId)) {
      throw new NotFoundException('User not authorized to create forum');
    }

    const forums = await this.forumModel.find({ course_id: courseId }).exec();
    console.log(forums);
    return forums;
  }

  async findByInstructor(instructorId: string) {
    const instructorObjectId = new Types.ObjectId(instructorId);
    const courses = await this.courseModel.find({ instructor_id: instructorObjectId }).exec();
    const forums = [];
    for (const course of courses) {
      const courseForums = await await this.forumModel.find({ course_id: course._id }).exec();
      forums.push(...courseForums); // Use spread to flatten results into the forums array
    }
    return forums;
  }

  async findForumsOfStudent(studentId: string) {
    const enrolledCourses = await this.userService.getEnrolledCoursesOfStudent(studentId);
    const forums = [];
    for (const course of enrolledCourses) {
      const courseForums =  await this.forumModel.find({ course_id: (course as any)._id }).exec();
      forums.push(...courseForums); // Use spread to flatten results into the forums array
    }
    return forums;  
  }

  async findThreads(forumId: string, initiator: Types.ObjectId) {
    const forum = await this.forumModel.findById(forumId).exec();
    const course = await this.courseService.findOne(forum.course_id);
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    if(!this.validateInitiator(new Types.ObjectId(initiator), (course as any)._id)) { 
      throw new NotFoundException('User not authorized to create forum');
    }

    const threadIds = forum.threads.map(thread => (thread as any)._id);
    const threads = await this.threadModel.find({ _id: { $in: threadIds } }).exec();
    return threads;
  }

  async findOne(id: string, initiator: Types.ObjectId) {
    const forum = await this.forumModel.findById(id).exec();
    if (!forum) {
      throw new NotFoundException(`Forum #${id} not found`);
    }

    if(!this.validateInitiator(new Types.ObjectId(initiator), forum.course_id)) {
      throw new NotFoundException('User not authorized to create forum');
    }

    return forum;
  }

  async update(id: string, updateForumDto: UpdateForumDto): Promise<Forum> {
    const {created_by} = updateForumDto;
    const user = await this.userService.findUserById(created_by.toString());
    const forum = await this.forumModel.findById(id).exec();
    
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    if(!created_by.equals(forum.created_by)) {
      throw new NotFoundException('User not authorized to update forum');
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
      && !(initiator).equals(forum.created_by)) {
      throw new NotFoundException('User not authorized to update forum');
    }

    forum.is_active = false;
    const threads = await this.findThreads(id, initiator);
    for (const thread of threads) {
      thread.isResolved = true;
      await thread.save();
    }
    await forum.save();
    
  }

  async remove(id: string, initiator:Types.ObjectId ): Promise<void> {
    const user = await this.userService.findUserById(initiator.toString());
    if(user.role == Role.Student) {
      throw new NotFoundException('User not authorized to delete forum');
    }

    const forum = await this.forumModel.findByIdAndUpdate(id).exec();
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
  }

}
