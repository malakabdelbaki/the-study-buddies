import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from '../Models/notes.schema';
import { CoursesService } from '../courses/courses.service';
import { Types } from 'mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ModuleService } from 'src/module/module.service';


@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
    private readonly coursesService: CoursesService,
    private readonly moduleService: ModuleService
  ) {}

  async getNotes(userId: string): Promise<Note[]> {
    const user = new Types.ObjectId(userId);
    return this.noteModel.find({ userId : user }).exec();
  }

  async getCourseNotes(userId: string, courseId: string): Promise<Note[]> {
    const course_id = new Types.ObjectId(courseId);
    const user = new Types.ObjectId(userId);
    const course = await this.coursesService.findOne(course_id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if(!course.students.some((student) => student.toString() === userId)){
      throw new UnauthorizedException('Unauthorized');
    }

    return this.noteModel.find({ userId : user, courseId : course_id }).exec();
  }

  async getNote(userId: string, noteId: string): Promise<Note> {
    const user = new Types.ObjectId(userId);
    const note = new Types.ObjectId(noteId);
    return this.noteModel.findOne({ userId : user, _id : note }).exec();
  }

  async getModuleNotes(userId: string, courseId: string, moduleId: string): Promise<Note[]> {
    const course_id = new Types.ObjectId(courseId);
    const module_id = new Types.ObjectId(moduleId);
    const user = new Types.ObjectId(userId);
    const course = await this.coursesService.findOne(course_id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if(!course.students.some((student) => student.toString() === userId)){
      throw new UnauthorizedException('Unauthorized');
    }

    return this.noteModel.find({ userId : user, courseId : course_id, moduleId : module_id }).exec();
  }

  async createNote(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const user = new Types.ObjectId(userId);
    const course_id = new Types.ObjectId(createNoteDto.courseId);
    const course = await this.coursesService.findOne(course_id);
    const module = await this.moduleService.GetModule(createNoteDto.moduleId);

    if(!course || !module){
      throw new NotFoundException('Course or Module not found');
    }

    if(module.get('course_id').toString() !== course_id.toString()){
      throw new UnauthorizedException('Module does not belong to the course');
    }

    if(!course.students.some((student) => student.toString() === userId)){
      throw new UnauthorizedException('Unauthorized');
    }

    const note = new this.noteModel({
      userId : user,
      courseId : course,
      moduleId : module,
      title: createNoteDto.title,
      content: createNoteDto.content,
    });
    return note.save();
  }

  async updateNote(
    userId: string,
    noteId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    const user = new Types.ObjectId(userId);
    const note_id = new Types.ObjectId(noteId);
    const note = await this.noteModel.findOne({ _id : note_id }).exec();
    if(note.userId.toString() !== userId){
      throw new UnauthorizedException('Unauthorized');
    }
    const updatedNote = this.noteModel.findOneAndUpdate({ userId : user, _id : note }, updateNoteDto, { new: true });
    if (!updatedNote) {
      throw new NotFoundException('Note not found');
    }
    return updatedNote;
  }

  async deleteNote(
    userId: string,
    noteId: string,
  ): Promise<Note> {
    const user = new Types.ObjectId(userId);
    const note_id = new Types.ObjectId(noteId);
    const note = await this.noteModel.findOne({ _id : note_id }).exec();
    if(note.userId.toString() !== userId){
      throw new UnauthorizedException('Unauthorized');
    }
    const deletedNote = await this.noteModel.findByIdAndDelete(note_id);
    if (!deletedNote) {
      throw new NotFoundException('Note not found');
    }
    return deletedNote;
  }

  async autoSaveNote(noteId: string, userId: string, updates: Partial<Note>, clientUpdatedAt: Date): Promise<Note> {
    const note = await this.noteModel.findOne({ _id: noteId, userId });
  
    if (new Date(note.updatedAt) > new Date(clientUpdatedAt)) {
      throw new ConflictException('The note has been updated by another process.');
    }
  
    return this.noteModel.findOneAndUpdate(
      { _id: noteId, userId },
      { ...updates, updatedAt: new Date() },
      { new: true },
    );
  }
  
}
