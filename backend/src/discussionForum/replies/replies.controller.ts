import { RepliesService } from './replies.service';
import { Controller, Post, Get, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UseGuards, SetMetadata } from '@nestjs/common';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('replies')
@UseGuards(AuthGuard, authorizationGuard)
export class RepliesController {
  constructor(
    private readonly repliesService: RepliesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reply' })
  @ApiBody({ type: CreateReplyDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  create(@Body() createReplyDto: CreateReplyDto) {
    return this.repliesService.create(createReplyDto);
  }

  @Get('search/:threadId')
  @ApiOperation({ summary: 'Search replies of a thread' })
  @ApiQuery({ name: 'query', description: 'The search query' , required: false})
  @ApiParam({ name: 'threadId', description: 'The ID of the thread' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])


  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Retrieve all replies on a thread' })
  @ApiParam({ name: 'threadId', description: 'The ID of the thread' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  findRepliesOnThread(
    @Param('threadId') threadId: string,
    @Req() req: any) {
    const initiator = req.user.userid; 
    return this.repliesService.findRepliesOnThread(threadId, initiator);  
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a reply by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to retrieve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  findOne(
    @Param('id') id: string,
    @Req() req: any) {
    const initiator = req.user.userid;
    return this.repliesService.findOne(id, initiator);
  }

  @Get(':id/sender')
  @ApiOperation({ summary: 'Retrieve the sender of a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  findSender(@Param('id') id: string) {
    return this.repliesService.findSender(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to update' })
  @ApiBody({ type: UpdateReplyDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  update(
    @Param('id') id: string, 
    @Body() updateReplyDto: UpdateReplyDto,
    @Req() req: any) {
    const initiator = req.user.userid;
    return this.repliesService.update(id, updateReplyDto, initiator);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  remove(@Param('id') id: string, @Req() req: any) {
    const initiator = req.user.userid;
    return this.repliesService.remove(id, initiator);
  }

}
