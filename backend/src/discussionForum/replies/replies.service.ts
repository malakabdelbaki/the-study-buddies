import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reply, ReplyDocument } from '../../Models/reply.schema';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Thread, ThreadDocument } from '../../Models/thread.schema';
import { UserService } from 'src/users/users.service';
import { ForumService } from '../forum/forum.service';
import { Role } from '../../enums/role.enum';
import mongoose from 'mongoose';
import { ThreadsService } from '../threads/threads.service';
import { NotificationsService } from 'src/WebSockets/notification/notification.service';
import { NotificationType } from 'src/enums/notification-type.enum';
@Injectable()
export class RepliesService {
  constructor(
    @InjectModel(Reply.name) private readonly replyModel: Model<ReplyDocument>,
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    private readonly userService: UserService,
    private readonly forumService: ForumService,
    private readonly threadService: ThreadsService,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(createReplyDto: CreateReplyDto, user:Types.ObjectId, creator_name:string ): Promise<Reply> {
    const { thread_id } = createReplyDto;
    const thread = await this.threadModel.findById(thread_id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${thread_id} not found`);
    }
    if (thread.isResolved) {
      throw new NotFoundException(`Thread #${thread_id} is resolved`);
    }
   
    const createdReply = new this.replyModel({ ...createReplyDto, createdBy: user, creator_name: creator_name });
    thread.replies.push(createdReply._id as Types.ObjectId);

    await thread.save();
    await createdReply.save();

    this.notificationService.createNotification(
      thread.createdBy.toString(), 
      `New reply on thread: ${thread.title}`, 
      NotificationType.REPLY, 
      createdReply._id as Types.ObjectId);
      
    return createdReply;
  }

  async findRepliesOnThread(threadId: string): Promise<Reply[]> {
    const thread = await this.threadService.findOne(threadId);
    if (!thread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }

    const replies = await this.replyModel.find({ _id: { $in: thread.replies } }).exec();
    return replies;
  }

  async findOne(reply_id: string): Promise<Reply> {
    const reply = await this.replyModel.findById(reply_id);
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    return reply;
  }

  async update(reply_id: string, updateReplyDto: UpdateReplyDto): Promise<Reply> {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }

    const updatedReply = await this.replyModel.findByIdAndUpdate(reply_id, updateReplyDto, { new: true }).exec();
    return updatedReply;
  }

  async findSender(reply_id: string) {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    const user = this.userService.findUserById(reply.user_id.toString());
    return user;
  }


  async searchReplies(query: string, threadId: string): Promise<Reply[]> {
    if (!query) {
      return [];
    }
    const thread = await this.threadModel.findById(threadId).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }
    return this.replyModel.find({
      thread_id: threadId,
      content: { $regex: query, $options: 'i' },
    }).exec();
  }

  async remove(reply_id: string): Promise<Reply> {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    const deletedReply = await this.replyModel.findByIdAndDelete(reply_id).exec();
    return deletedReply;
  }

  async isCreator(reply_id: string, userId: Types.ObjectId): Promise<boolean> {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    if(reply.user_id.toString()===userId.toString()) {
      return true;
    }
    return false;
  }

  async getThreadOfReply(reply_id: string): Promise<Thread> {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    const thread = await this.threadModel.findById(reply.thread_id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${reply.thread_id} not found`);
    }
    return thread;
  }

}