import { Req, Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UseGuards, SetMetadata } from '@nestjs/common';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Types } from 'mongoose';
import { isStudentCreator } from 'src/auth/guards/isStudentCreator.guard';
import { IsMemberGuard } from 'src/auth/guards/IsForumMember.guard';
@Controller('threads')
@UseGuards(AuthGuard, authorizationGuard)
export class ThreadsController {
  constructor(private readonly threadService: ThreadsService) {}

  @Post(':forum_id')
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiBody({ type: CreateThreadDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  create(
    @Param('forum_id') threadId: string,
    @Body() createThreadDto: CreateThreadDto,
    @Req() req: any) {
      return this.threadService.create(createThreadDto, req.user.userid);
  }

  @Get('search/:forum_id')
  @ApiOperation({ summary: 'Search threads' })
  @ApiQuery({ name: 'query', description: 'The search query', required: false }) 
  @ApiParam({ name: 'forum_id', description: 'The ID of the forumId' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  async search(
    @Param('forum_id') forumId: Types.ObjectId,
    @Query('query') query: string,
    ) {
      const searchQuery = query?.trim() || '';
    return this.threadService.searchThreads(searchQuery, forumId); 
  }

  @Get(':thread_id')
  @ApiOperation({ summary: 'Retrieve a thread by its ID' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  findOne(
    @Param('thread_id') id: string,
  ) {
    return this.threadService.findOne(id);
  }

  @Get(':thread_id/replies')
  @ApiOperation({ summary: 'Retrieve all replies on a thread' })
  @ApiParam({ name: 'threadId', description: 'The ID of the thread' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  findRepliesOnThread(@Param('thread_id') threadId: string) {
    return this.threadService.findRepliesOnThread(threadId);  
  }


  @Patch(':thread_id')
  @ApiOperation({ summary: 'Update a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to update' })
  @ApiBody({ type: UpdateThreadDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(isStudentCreator)
  update(@Param('thread_id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadService.update(id, updateThreadDto);
  }

  @Patch('resolve/:thread_id')
  @ApiOperation({ summary: 'Resolve a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to resolve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(isStudentCreator)
  resolve(
    @Param('thread_id') id: string,
  ) {
    return this.threadService.resolve(id);
  }

  @Delete(':thread_id')
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  @UseGuards(IsMemberGuard, isStudentCreator)
  remove(
    @Param('thread_id') id: string,
   ) {
    return this.threadService.remove(id);
  }


}
