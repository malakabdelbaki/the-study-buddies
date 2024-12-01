import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Thread, ThreadDocument } from '../../Models/thread.schema';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ForumService } from '../forum/forum.service';
import { UserService } from 'src/users/users.service';
import { Role } from 'src/enums/role.enum';
import { CoursesService } from 'src/courses/courses.service';
@Injectable()
export class ThreadsService {
  constructor(
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    private readonly userService: UserService,
    private readonly forumService: ForumService,
    private readonly courseService: CoursesService
  ){}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    const forumId = createThreadDto.forumId;
    const forum = await this.forumService.findOne(forumId.toString(), createThreadDto.createdBy);
    
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    if (!forum.is_active) {
      throw new NotFoundException(`Forum #${forumId} is archived`);
    }
    const user = await this.userService.findUserById(createThreadDto.createdBy.toString());
    if(user.role === 'student') {
      const studentForums = await this.forumService.findForumsOfStudent(createThreadDto.createdBy.toString());
      if (!studentForums.some(forum => forum._id.equals(forum._id))) {
        throw new NotFoundException(`Student is not enrolled in the course`);
      }
    }
    if(user.role === 'instructor') {
      const instructorForums = await this.forumService.findByInstructor(createThreadDto.createdBy.toString());
      if (!instructorForums.some(forum => forum._id.equals(forum._id))) {
        throw new NotFoundException(`Student is not enrolled in the course`);
      }
    }
    const createdThread = new this.threadModel(createThreadDto);
    forum.threads.push(createdThread._id as Types.ObjectId);
    await forum.save();
    return createdThread.save();
  }


  async findOne(id: string, initiator: Types.ObjectId): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    const forum = await this.forumService.findOne(thread.forumId.toString(), initiator);
    if(!this.forumService.validateInitiator(forum.course_id, initiator)) {
      throw new NotFoundException('User not authorized to view thread');
    }

    return thread;
  }


  async update(id: string, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    const thread = await this.threadModel.findByIdAndUpdate
    (id, updateThreadDto, { new: true }).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    return thread;
  }

  async resolve(id: string, initiator: Types.ObjectId): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    const user = await this.userService.findUserById(initiator.toString());
    if(!thread.createdBy.equals(initiator)) {
      throw new NotFoundException('User not authorized to resolve thread');
    }
    thread.isResolved = true;
    await thread.save();
    return thread;
  }

  async searchThreads(query: string, forumId: Types.ObjectId, initiator: Types.ObjectId): Promise<Thread[]> {
    const forum = await this.forumService.findOne(forumId.toString(), initiator);
    if(!this.forumService.validateInitiator(forum.course_id, initiator)) {
      throw new NotFoundException('User not authorized to view threads');
    }

  return await this.threadModel
    .find({
      $or: [
        { title: { $regex: query, $options: 'i' } }, // Case-insensitive regex
        { content: { $regex: query, $options: 'i' } },
      ],
    });
  }

  async remove(id: string, initiator: Types.ObjectId): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }

    const user = await this.userService.findUserById(initiator.toString());
    if(user.role == Role.Student
      && !thread.createdBy.equals(initiator)) {
      throw new NotFoundException('User not authorized to delete thread');
    }
    const forum = await this.forumService.findOne(thread.forumId.toString(), initiator);
    
    const deletedThread = await this.threadModel.findByIdAndDelete(id).exec();
    return deletedThread;
  }

}