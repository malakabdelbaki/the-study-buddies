import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from 'src/courses/courses.module';
import { ModuleModule } from 'src/module/module.module';
import { NoteSchema } from 'src/Models/notes.schema';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/log/log.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }]),
    CoursesModule,
    ModuleModule,
    AuthModule,
    LogsModule,
  ],
  providers: [NoteService],
  controllers: [NoteController],
  exports: [NoteService],
})
export class NoteModule {}
