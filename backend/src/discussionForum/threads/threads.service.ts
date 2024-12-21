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
import { Forum } from 'src/Models/forum.schema';
import { Reply, ReplyDocument } from 'src/Models/reply.schema';
@Injectable()
export class ThreadsService {
  constructor(
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Reply.name) private readonly replyModel: Model<ReplyDocument>,
    private readonly userService: UserService,
    private readonly forumService: ForumService,
    private readonly courseService: CoursesService
  ){}

  async create(createThreadDto: CreateThreadDto, user:Types.ObjectId, creator_name:string): Promise<Thread> {
    const forumId = createThreadDto.forumId;
    const forum = await this.forumService.findOne(forumId.toString());
    
    if (!forum) {
      throw new NotFoundException(`Forum #${forumId} not found`);
    }
    if (!forum.is_active) {
      throw new NotFoundException(`Forum #${forumId} is archived`);
    }

    const createdThread = new this.threadModel({ ...createThreadDto, createdBy: user, creator_name: creator_name });
    forum.threads.push(createdThread._id as Types.ObjectId);
    await forum.save();
    return createdThread.save();
  }


  async findOne(id: string): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    const forum = await this.forumService.findOne(thread.forumId.toString());
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

  async resolve(id: string): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    thread.isResolved = true;
    await thread.save();
    return thread;
  }

  async searchThreads(query: string, forumId:string): Promise<Thread[]> {
    const forum = await this.forumService.findOne(forumId.toString());
    return await this.threadModel
      .find({
        forumId,
        $or: [
          { title: { $regex: query, $options: 'i' } }, // Case-insensitive regex
          { content: { $regex: query, $options: 'i' } },
        ],
      });
    }

  async remove(id: string): Promise<Thread> {
    const thread = await this.threadModel.findById(id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }
    const forum = await this.forumService.findOne(thread.forumId.toString());
    if (!forum) {
      throw new NotFoundException(`Forum #${thread.forumId} not found`);
    }
    forum.threads = forum.threads.filter((threadId) => threadId.toString()!==id);
    const deletedThread = await this.threadModel.findByIdAndDelete(id).exec();
    return deletedThread;
  }

  async isCreator(threadId: string, userId: Types.ObjectId): Promise<boolean> {
    const thread = await this.threadModel.findById(threadId).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }

    return thread.createdBy.toString()===userId.toString();
  }

  async getForumOfThread(threadId: string): Promise<Forum> {
    const thread = await this.threadModel.findById(threadId).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }
    const forum = await this.forumService.findOne(thread.forumId.toString());
    return forum;
  }

  async findRepliesOnThread(threadId: string): Promise<Reply[]> {
       const replies = await this.replyModel.find({ thread_id:threadId }).exec();
        return replies;
  }

}

