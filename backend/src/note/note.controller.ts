import { SetMetadata, Controller, Get, Param, Post, Req , Put, Delete, Patch, Body, BadRequestException, ConflictException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';


@UseGuards(AuthGuard, authorizationGuard)
@SetMetadata(ROLES_KEY, [Role.Student])
@Controller('note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
  ) {}

  @Get()
  async getNotes(
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.getNotes(userId);
  }

  @Get('course/:courseId')
  async getCourseNotes(
    @Param('courseId') courseId: string,
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.getCourseNotes(userId, courseId);
  }


  @Get(':noteId')
  async getNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.getNote(userId, noteId);
  }

  @Get('course/:courseId/module/:moduleId') 
  async getModuleNotes(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.getModuleNotes(userId, courseId, moduleId);
  }

  @Post()
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req,
  ) {
    const userId = req.user.userid;
    console.log(userId);
    console.log(createNoteDto.courseId);
    return this.noteService.createNote(userId, createNoteDto);
  }


  @Put(':noteId') 
  async updateNote(
    @Param('noteId') noteId: string,
    updateNoteDto: UpdateNoteDto,
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.updateNote(userId, noteId, updateNoteDto);
  }

  @Delete(':noteId')
  async deleteNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    const userId = req.user.userid;
    return this.noteService.deleteNote(userId, noteId);
  } 


  @Patch(':noteId/autosave')
  async autoSaveNote(
    @Param('noteId') noteId: string,
    @Body() body: { content: string; clientUpdatedAt: string },
    @Req() req,
  ) {
    const userId = req.user.userid; // Extract user ID from JWT or session

    try {
      const updatedNote = await this.noteService.autoSaveNote(
        noteId,
        userId,
        { content: body.content },
        new Date(body.clientUpdatedAt),
      );

      return updatedNote;
    } 
    catch (err) {
      if (err instanceof ConflictException) {
        return {
          error: 'Conflict',
          message: 'The note has been updated by another process. Please refresh your data.',
        };
      }
      throw err; 
    }
  }

}
