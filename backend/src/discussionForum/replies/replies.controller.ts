import { RepliesService } from './replies.service';
import { Controller, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('replies')
export class RepliesController {
  constructor(
    private readonly repliesService: RepliesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reply' })
  @ApiBody({ type: CreateReplyDto })
  create(@Body() createReplyDto: CreateReplyDto) {
    return this.repliesService.create(createReplyDto);
  }

  @Get('search/:threadId')
  @ApiOperation({ summary: 'Search replies of a thread' })
  @ApiQuery({ name: 'query', description: 'The search query' , required: false})
  @ApiParam({ name: 'threadId', description: 'The ID of the thread' })
  search(@Param('threadId') threadId: string ,@Query('query') query?: string) {
    return this.repliesService.searchReplies(query, threadId);
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Retrieve all replies on a thread' })
  @ApiParam({ name: 'threadId', description: 'The ID of the thread' })
  findRepliesOnThread(@Param('threadId') threadId: string) {
    return this.repliesService.findRepliesOnThread(threadId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a reply by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to retrieve' })
  findOne(@Param('id') id: string) {
    return this.repliesService.findOne(id);
  }

  @Get(':id/sender')
  @ApiOperation({ summary: 'Retrieve the sender of a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply' })
  findSender(@Param('id') id: string) {
    return this.repliesService.findSender(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to update' })
  @ApiBody({ type: UpdateReplyDto })
  update(@Param('id') id: string, @Body() updateReplyDto: UpdateReplyDto) {
    return this.repliesService.update(id, updateReplyDto);
  }

  

}
