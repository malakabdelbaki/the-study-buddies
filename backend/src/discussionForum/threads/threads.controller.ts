import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadService: ThreadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiBody({ type: CreateThreadDto })
  create(  @Body() createThreadDto: CreateThreadDto) { 
    return this.threadService.create(createThreadDto);
  }

  @Get('search')
@ApiOperation({ summary: 'Search threads' })
@ApiQuery({ name: 'query', description: 'The search query', required: false }) // Use ApiQuery to document query parameters
async search(@Query('query') query?: string) {
  if (!query) {
    return []; 
  }
  return this.threadService.searchThreads(query); 
}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a thread by its ID' })
  findOne(@Param('id') id: string) {
    return this.threadService.findOne(id);
  }


  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Retrieve threads by module ID' })
  @ApiParam({ name: 'moduleId', description: 'The ID of the module' })
  findByModule(@Param('moduleId') moduleId: string) {
    return this.threadService.findByModule(moduleId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to update' })
  @ApiBody({ type: UpdateThreadDto })
  update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadService.update(id, updateThreadDto);
  }

  @Patch('resolve/:id')
  @ApiOperation({ summary: 'Resolve a thread' })
  @ApiParam({ name: 'id', description: 'The ID of the thread to resolve' })
  resolve(@Param('id') id: string) {
    return this.threadService.resolve(id);
  }



}
