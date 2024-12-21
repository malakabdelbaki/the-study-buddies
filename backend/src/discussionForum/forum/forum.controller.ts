import { ForumService } from './forum.service';
import { Controller, Get, Post, Body, Param, Patch, Delete, Req, Query } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UseGuards, SetMetadata } from '@nestjs/common';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Types } from 'mongoose';
import { IsMemberGuard } from 'src/auth/guards/IsForumMember.guard';
import { InstructorGuard } from 'src/auth/guards/instructor.guard';
import { EnrolledGuard } from 'src/auth/guards/enrolled.guard';

@Controller('forum')
@UseGuards(AuthGuard, authorizationGuard, InstructorGuard, IsMemberGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum' })
  @ApiBody({ type: CreateForumDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  async create(
    @Body() createForumDto: CreateForumDto,
    @Req() req: any) {
      return this.forumService.create(createForumDto, req.user.userid, req.user.username);
  }

  @Get('course/:course_id/search')
  @ApiOperation({ summary: 'Search forums' })
  @ApiParam({ name: 'course_id', description: 'The ID of the course', required: true })
  @ApiQuery({ name: 'query', description: 'The search query', required: false }) 
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(EnrolledGuard)
  async search(
    @Param('course_id') course_id: string,
    @Query('query') query: string,
    ) {
      const searchQuery = query?.trim() || '';
    return this.forumService.searchForums(searchQuery, course_id); 
  }

  @Get(':forum_id')
  @ApiOperation({ summary: 'Retrieve a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to retrieve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(EnrolledGuard)
  async findOne(
    @Param('forum_id') id: string,
  ){
    return this.forumService.findOne(id);
  }

  @Get('course/:course_id')
  @ApiOperation({ summary: 'Retrieve forums by course ID' })
  @ApiParam({ name: 'courseId', description: 'The ID of the course' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(EnrolledGuard)
  async findByCourse(
    @Param('course_id') courseId: Types.ObjectId,
  ){
    return this.forumService.findByCourse(courseId);
  }


  @Get('/instructor')
  @ApiOperation({ summary: 'Retrieve forums by instructor ID' })
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  findByInstructor(@Req() req: any) {
    return this.forumService.findByInstructor(req.user.userid);
  }

  @Get('/student')
  @ApiOperation({ summary: 'Retrieve forums by student ID' })
  @ApiParam({ name: 'studentId', description: 'The ID of the student' })
  @SetMetadata(ROLES_KEY, [Role.Student])
  @UseGuards(EnrolledGuard)
  findByStudent(@Req() req: any) {
    return this.forumService.findForumsOfStudent(req.user.userid);
  }

  @Get(':forum_id/threads')
  @ApiOperation({ summary: 'Retrieve all threads of a forum' })
  @ApiParam({ name: 'id', description: 'The ID of the forum' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  @UseGuards(EnrolledGuard)
 async findThreads(
    @Param('forum_id') id: string,
  ){
    return this.forumService.findThreads(id);
  }


  @Patch(':forum_id')
  @ApiOperation({ summary: 'Update a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to update' })
  @ApiBody({ type: UpdateForumDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  update(
    @Param('forum_id') id: string, 
    @Body() updateForumDto: UpdateForumDto,
  ) {
      return this.forumService.update(id, updateForumDto);
  }

  @Patch('archive/:forum_id')
  @ApiOperation({ summary: 'Archive a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to archive' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Admin])
  async archive(
    @Param('forum_id') id: string,
    @Req() req: any){
      
      const initiator = req.user.userid;
      return this.forumService.archive(id, initiator);
  }

  @Delete(':forum_id')
  @ApiOperation({ summary: 'Delete a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Admin])
 async remove(
    @Param('forum_id') forum_id: string,
 ){
    console.log(forum_id);
      return this.forumService.remove(forum_id);
  }

}
