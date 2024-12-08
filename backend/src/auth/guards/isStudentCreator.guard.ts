import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThreadsService } from 'src/discussionForum/threads/threads.service';
import { ForumService } from 'src/discussionForum/forum/forum.service';
import { RepliesService } from 'src/discussionForum/replies/replies.service';
import { Types } from 'mongoose';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class isStudentCreator implements CanActivate {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly forumService: ForumService,
    private readonly repliesService: RepliesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("isStudentCreator");
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userid; // Get logged-in user ID
     if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
    const role = request.user.role;
    if(role === Role.Instructor || role === Role.Admin) {
      return true;
    }
  
  const thread_id = request.params.thread_id || request.body.thread_id;
  const forum_id = request.params.forum_id || request.body.forum_id;
  const reply_id = request.params.reply_id || request.body.reply_id;

    if(reply_id) {
      return await this.repliesService.isCreator(reply_id, userId);
  }

    if(thread_id) {
      return await this.threadsService.isCreator(thread_id, userId);
    }

    if(forum_id) {
      console.log("forum_id", forum_id);
      return await this.forumService.isCreator(forum_id, userId);
    }
    
  return true; // Allow the request to proceed
  }
}
