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
import { IsMemberGuard } from 'src/auth/guards/IsForumMember.guard';
import {  isStudentCreator } from 'src/auth/guards/isStudentCreator.guard';
import { IsInstructorCreator } from 'src/auth/guards/IsInstructorCreator.guard';
import { IsIn } from 'class-validator';
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
  @UseGuards(IsMemberGuard)
  create(
    @Body() createReplyDto: CreateReplyDto,
    @Req() req: any) {
      return this.repliesService.create(createReplyDto, req.user.userid, req.user.username);
  }

  

  @Get(':reply_id')
  @ApiOperation({ summary: 'Retrieve a reply by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to retrieve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  findOne(@Param('reply_id') id: string) {
    return this.repliesService.findOne(id);
  }

  @Get(':reply_id/sender')
  @ApiOperation({ summary: 'Retrieve the sender of a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard)
  findSender(@Param('reply_id') id: string) {
    return this.repliesService.findSender(id);
  }

  @Patch(':reply_id')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to update' })
  @ApiBody({ type: UpdateReplyDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(isStudentCreator, IsInstructorCreator)
  update(
    @Param('reply_id') id: string, 
    @Body() updateReplyDto: UpdateReplyDto,
    ) {
    return this.repliesService.update(id, updateReplyDto);
  }

  @Delete(':reply_id')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiParam({ name: 'id', description: 'The ID of the reply to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(IsMemberGuard, IsInstructorCreator)
  remove(@Param('reply_id') id: string) {
    return this.repliesService.remove(id);
  }

}
