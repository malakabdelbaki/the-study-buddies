import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { ModuleSchema } from 'src/Models/modules.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema } from 'src/Models/question.schema';
import { CoursesService } from 'src/courses/courses.service';
import { CoursesModule } from 'src/courses/courses.module';
import { CoursesController } from 'src/courses/courses.controller';
import { CourseSchema } from 'src/Models/course.schema';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ResourceSchema } from 'src/Models/resource.schema';

@Module({
  imports :[MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }]),
            MongooseModule.forFeature([{name:'Question',schema:QuestionSchema}]),         
            MongooseModule.forFeature([{name:'Course',schema:CourseSchema}]),
            MongooseModule.forFeature([{name:'Resource',schema:ResourceSchema}]),
            MulterModule.register({ dest: './uploads' }),
            ServeStaticModule.forRoot({
              rootPath: './uploads', // Path to the uploads folder
              serveRoot: '/resources', // URL where files will be served from
            }),],
  controllers: [ModuleController,CoursesController],
  providers: [ModuleService,CoursesService],
  exports: [ModuleService,MongooseModule]
})
export class ModuleModule {} 
