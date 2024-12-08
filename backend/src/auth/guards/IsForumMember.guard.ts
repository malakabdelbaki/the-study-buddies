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
export class IsMemberGuard implements CanActivate {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly forumService: ForumService,
    private readonly repliesService: RepliesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("IsMemberGuard");
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userid; // Get logged-in user ID
     if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
    console.log("hii");
   
  const thread_id = request.params.thread_id || request.body.thread_id;
  const forum_id = request.params.forum_id || request.body.forum_id;
  const reply_id = request.params.reply_id || request.body.reply_id;

  console.log("thread_id", thread_id);
  console.log("forum_id", forum_id);
  console.log("reply_id", reply_id);
  console.log("userId", userId);

    if(reply_id) {
      const thread = await this.repliesService.getThreadOfReply(reply_id);
      if (!thread) {
        throw new HttpException(
          'Thread does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }
      const forum = await this.threadsService.getForumOfThread((thread as any)._id);
      if (!forum) {
        throw new HttpException(
          'Forum does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.forumService.isMember((forum as any)._id, userId);
  }

    if(thread_id) {
      const forum = await this.threadsService.getForumOfThread(thread_id);
      if (!forum) {
        throw new HttpException(
          'Forum does not exist.',
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.forumService.isMember((forum as any)._id, userId);    }

    if(forum_id) {
      console.log("forum_id", forum_id);
      return await this.forumService.isMember(forum_id, userId);    
    
    }
    
  console.log("isMemeber true");
  return true; // Allow the request to proceed
  }
}
