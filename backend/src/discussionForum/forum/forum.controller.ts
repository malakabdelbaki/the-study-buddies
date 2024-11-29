import { ForumService } from './forum.service';
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forum' })
  @ApiBody({ type: CreateForumDto })
  create(@Body() createForumDto: CreateForumDto) {
    return this.forumService.create(createForumDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all forums' })
  findAll() {
    return this.forumService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to retrieve' })
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Retrieve forums by course ID' })
  @ApiParam({ name: 'courseId', description: 'The ID of the course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.forumService.findByCourse(courseId);
  }


  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Retrieve forums by instructor ID' })
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  findByInstructor(@Param('instructorId') instructorId: string) {
    return this.forumService.findByInstructor(instructorId);
  }

  @Get('/student/:studentId')
  @ApiOperation({ summary: 'Retrieve forums by student ID' })
  @ApiParam({ name: 'studentId', description: 'The ID of the student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.forumService.findForumsOfStudent(studentId);
  }

  @Get(':id/threads')
  @ApiOperation({ summary: 'Retrieve all threads of a forum' })
  @ApiParam({ name: 'id', description: 'The ID of the forum' })
  findThreads(@Param('id') id: string) {
    return this.forumService.findThreads(id);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to update' })
  @ApiBody({ type: UpdateForumDto })
  update(@Param('id') id: string, @Body() updateForumDto: UpdateForumDto) {
    return this.forumService.update(id, updateForumDto);
  }

  @Patch('archive/:id')
  @ApiOperation({ summary: 'Archive a forum by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the forum to archive' })
  archive(@Param('id') id: string) {
    return this.forumService.archive(id);
  }

}
