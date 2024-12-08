import { SetMetadata, Controller, Get, Param, Post, Req , Put, Delete, Patch, Body, BadRequestException, ConflictException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { IsNoteCreatorGuard } from 'src/auth/guards/IsNoteCreator.guard';

@UseGuards(AuthGuard, authorizationGuard, IsNoteCreatorGuard)
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
    return this.noteService.getNotes(req.user.userid);
  }

  @Get('course/:courseId')
  async getCourseNotes(
    @Param('courseId') courseId: string,
    @Req() req,
  ) {
    return this.noteService.getCourseNotes( req.user.userid, courseId);
  }


  @Get(':noteId')
  async getNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    return this.noteService.getNote(req.user.userid, noteId);
  }

  @Get('course/:courseId/module/:moduleId') 
  async getModuleNotes(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Req() req,
  ) {
    return this.noteService.getModuleNotes(req.user.userid, courseId, moduleId);
  }

  @Post()
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req,
  ) {
    return this.noteService.createNote(req.user.userid, createNoteDto);
  }


  @Put(':noteId') 
  async updateNote(
    @Param('noteId') noteId: string,
    updateNoteDto: UpdateNoteDto,
    @Req() req,
  ) {
    return this.noteService.updateNote(req.user.userid, noteId, updateNoteDto);
  }

  @Delete(':noteId')
  async deleteNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    return this.noteService.deleteNote(req.user.userid, noteId);
  } 


  @Patch(':noteId/autosave')
  async autoSaveNote(
    @Param('noteId') noteId: string,
    @Body() body: { content: string; clientUpdatedAt: string },
    @Req() req,
  ) {
    try {
      const updatedNote = await this.noteService.autoSaveNote(
        noteId,
        req.user.userid,
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
