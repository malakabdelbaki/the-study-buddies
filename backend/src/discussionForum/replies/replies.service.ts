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
@Injectable()
export class RepliesService {
  constructor(
    @InjectModel(Reply.name) private readonly replyModel: Model<ReplyDocument>,
    @InjectModel(Thread.name) private readonly threadModel: Model<ThreadDocument>,
    private readonly userService: UserService,
    private readonly forumService: ForumService,
    private readonly threadService: ThreadsService,
  ) {}

  async create(createReplyDto: CreateReplyDto): Promise<Reply> {
    const { thread_id } = createReplyDto;
    const thread = await this.threadModel.findById(thread_id).exec();
    if (!thread) {
      throw new NotFoundException(`Thread #${thread_id} not found`);
    }
    if (thread.isResolved) {
      throw new NotFoundException(`Thread #${thread_id} is resolved`);
    }
    const user = await this.userService.findUserById(createReplyDto.user_id);
    const threadForum = await this.forumService.findOne(thread.forumId.toString(), new Types.ObjectId(createReplyDto.user_id));

    if (user.role === 'student') {
      const studentForums = await this.forumService.findForumsOfStudent(createReplyDto.user_id.toString());

      if (!studentForums.some(forum => forum._id.equals(threadForum._id))) {
        throw new NotFoundException(`Student is not enrolled in the course`);
      }
    }
    if (user.role === 'instructor') {
      const instructorForums = await this.forumService.findByInstructor(createReplyDto.user_id.toString());
      if (!instructorForums.some(forum => forum._id.equals(threadForum._id))) {
        throw new NotFoundException(`Instructor is not teaching the course`);
      }
    }
    const createdReply = new this.replyModel(createReplyDto);
    thread.replies.push(createdReply._id as Types.ObjectId);
    await thread.save();
    await createdReply.save();
    return createdReply;
  }

  async findRepliesOnThread(threadId: string, initiator: Types.ObjectId): Promise<Reply[]> {
    const thread = await this.threadService.findOne(threadId , initiator);
    console.log(thread);
    if (!thread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }
    const replies = await this.replyModel.find({ _id: { $in: thread.replies } }).exec();
    return replies;
  }

  async findOne(reply_id: string, initiator: Types.ObjectId): Promise<Reply> {
    const user = await this.userService.findUserById(initiator.toString());
    const reply = await this.replyModel.findById(reply_id);
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    const thread = await this.threadService.findOne(reply.thread_id.toString(), initiator);
    return reply;
  }

  async update(reply_id: string, updateReplyDto: UpdateReplyDto, initiator:Types.ObjectId): Promise<Reply> {
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }
    if(!reply.user_id.equals(initiator)) {
      throw new NotFoundException('User not authorized to update reply');
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

  async remove(reply_id: string, initiator: Types.ObjectId): Promise<Reply> {
    const user = await this.userService.findUserById(initiator.toString());
    const reply = await this.replyModel.findById(reply_id).exec();
    if (!reply) {
      throw new NotFoundException(`Reply #${reply_id} not found`);
    }

    if(user.role === Role.Student && !reply.user_id.equals(initiator)) {
      throw new NotFoundException('User not authorized to delete reply');
    }
    const thread = await this.threadService.findOne(reply.thread_id.toString(), initiator);
    const forum = await this.forumService.findOne(thread.forumId.toString(), initiator);

    if(user.role === Role.Instructor) {
      if(!this.forumService.validateInitiator(initiator, forum.course_id)) {
        throw new NotFoundException('User not authorized to delete reply');
    }
  }
    const deletedReply = await this.replyModel.findByIdAndDelete(reply_id).exec();
    
    return reply;
  }
}