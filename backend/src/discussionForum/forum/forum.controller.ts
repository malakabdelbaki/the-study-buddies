import { ForumService } from './forum.service';
import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UseGuards, SetMetadata } from '@nestjs/common';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Types } from 'mongoose';

@Controller('forum')
@UseGuards(AuthGuard, authorizationGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum' })
  @ApiBody({ type: CreateForumDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async create(@Body() createForumDto: CreateForumDto){
      return this.forumService.create(createForumDto);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to retrieve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async findOne(
    @Param('id') id: string,
    @Req() req: any){
      const initiator = req.user.userid;
    return this.forumService.findOne(id, initiator);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Retrieve forums by course ID' })
  @ApiParam({ name: 'courseId', description: 'The ID of the course' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  async findByCourse(
    @Param('courseId') courseId: Types.ObjectId,
    @Req() req: any){
      const initiator = req.user.userid;
    return this.forumService.findByCourse(courseId, initiator);
  }


  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Retrieve forums by instructor ID' })
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  @SetMetadata(ROLES_KEY, [Role.Instructor])

  findByInstructor(@Param('instructorId') instructorId: string) {
    return this.forumService.findByInstructor(instructorId);
  }

  @Get('/student/:studentId')
  @ApiOperation({ summary: 'Retrieve forums by student ID' })
  @ApiParam({ name: 'studentId', description: 'The ID of the student' })
  @SetMetadata(ROLES_KEY, [Role.Student])
  findByStudent(@Param('studentId') studentId: string) {
    return this.forumService.findForumsOfStudent(studentId);
  }

  @Get(':id/threads')
  @ApiOperation({ summary: 'Retrieve all threads of a forum' })
  @ApiParam({ name: 'id', description: 'The ID of the forum' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
 async findThreads(
    @Param('id') id: string,
    @Req() req: any){
      const initiator = req.user.userid;
    return this.forumService.findThreads(id, initiator);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to update' })
  @ApiBody({ type: UpdateForumDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  update(@Param('id') id: string, @Body() updateForumDto: UpdateForumDto) {
    return this.forumService.update(id, updateForumDto);
  }

  @Patch('archive/:id')
  @ApiOperation({ summary: 'Archive a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to archive' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async archive(
    @Param('id') id: string,
    @Req() req: any){
      const initiator = req.use.useridr;
    return this.forumService.archive(id, initiator);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor])
 async remove(
    @Param('id') id: string,
    @Req() req: any){
    
      const initiator = req.user.userid;
    return this.forumService.remove(id, initiator);
  }

}
