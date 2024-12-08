import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { NoteService } from 'src/note/note.service';

@Injectable()
export abstract class IsNoteCreatorGuard implements CanActivate {
  constructor(
    protected readonly noteService: NoteService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userid; // Get logged-in user ID
    if (!userId) {
      throw new HttpException(
        'Invalid request. Missing user ID.',
        HttpStatus.FORBIDDEN,
      );
    }
    
    const note_id = request.params.note_id || request.body.note_id;
    if (note_id) {
      return this.noteService.isCreator(note_id, userId);
    }

    return true; 
  }

  protected abstract allowAccessForRole(role: Role): boolean;
}
