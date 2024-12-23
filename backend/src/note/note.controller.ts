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

@UseGuards(AuthGuard, authorizationGuard)
@Controller('note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
  ) {}

  @Get()
  @SetMetadata(ROLES_KEY, [Role.Student])
  async getNotes(
    @Req() req,
  ) {
    return this.noteService.getNotes(req.user.userid);
  }

  @Get('course/:courseId/canDisableNotes')
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  async canDisableNotes(
    @Param('courseId') courseId: string,
  ) {
    console.log("in controller **********",courseId);
    return this.noteService.canDisableNotes(courseId);
  }

  @Get('course/:courseId/module/:moduleId')
  @SetMetadata(ROLES_KEY, [Role.Student]) 
  async getModuleNotes(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Req() req,
  ) {
    return this.noteService.getModuleNotes(req.user.userid, courseId, moduleId);
  }
  
  @Get('course/:courseId')
  @SetMetadata(ROLES_KEY, [Role.Student])
  async getCourseNotes(
    @Param('courseId') courseId: string,
    @Req() req,
  ) {
    return this.noteService.getCourseNotes( req.user.userid, courseId);
  }


  @Get(':noteId')
  @SetMetadata(ROLES_KEY, [Role.Student])
  async getNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    return this.noteService.getNote(req.user.userid, noteId);
  }

  

  @Post()
  @SetMetadata(ROLES_KEY, [Role.Student])
  async createNote(
    @Body() createNoteDto: CreateNoteDto,
    @Req() req,
  ) {
    return this.noteService.createNote(req.user.userid, createNoteDto);
  }


  @Patch(':noteId') 
  @SetMetadata(ROLES_KEY, [Role.Student])
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() req,
  ) {
    return this.noteService.updateNote(req.user.userid, noteId, updateNoteDto);
  }

  @Delete(':noteId')
  @SetMetadata(ROLES_KEY, [Role.Student])
  async deleteNote(
    @Param('noteId') noteId: string,
    @Req() req,
  ) {
    return this.noteService.deleteNote(req.user.userid, noteId);
  } 


  @Patch(':noteId/autosave')
  @SetMetadata(ROLES_KEY, [Role.Student])
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
