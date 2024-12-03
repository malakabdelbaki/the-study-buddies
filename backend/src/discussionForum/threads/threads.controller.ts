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
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadService: ThreadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiBody({ type: CreateThreadDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  create(@Body() createThreadDto: CreateThreadDto) { 
    return this.threadService.create(createThreadDto);
  }

  @Get('search')
@ApiOperation({ summary: 'Search threads' })
@ApiQuery({ name: 'query', description: 'The search query', required: false }) 
@ApiParam({ name: 'forumId', description: 'The ID of the forumId' })
@SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

async search(
  @Param('forumId') forumId: Types.ObjectId,
  @Query('query') query: string,
  @Req () req: any) {
  const initiator = req.user; 
  return this.threadService.searchThreads(query, forumId, initiator); 
}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a thread by its ID' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  findOne(
    @Param('id') id: string,
    @Req() req: any) {
    const initiator = req.user;
    return this.threadService.findOne(id,initiator);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to update' })
  @ApiBody({ type: UpdateThreadDto })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadService.update(id, updateThreadDto);
  }

  @Patch('resolve/:id')
  @ApiOperation({ summary: 'Resolve a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to resolve' })
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])

  resolve(
    @Param('id') id: string,
    @Req() req: any) {
    const initiator = req.user;
    return this.threadService.resolve(id, initiator);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to delete' })
  @SetMetadata(ROLES_KEY, [Role.Instructor])

  remove(
    @Param('id') id: string,
    @Req() req: any) {
    const initiator = req.user;
    return this.threadService.remove(id, initiator);
  }


}
