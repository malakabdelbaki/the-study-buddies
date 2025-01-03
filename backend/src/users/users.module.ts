import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User, UserSchema } from '../Models/user.schema';
import { Course, CourseSchema } from '../Models/course.schema';
import { Progress, ProgressSchema } from '../Models/progress.schema';
import { Response, ResponseSchema } from '../Models/response.schema';
import { ModuleSchema } from 'src/Models/modules.schema';
import { authorizationGuard } from '../auth/guards/authorization.guard';
import { ExistsOnDatabase } from 'src/common/decorators/exists-on-database.decorator';
import { ExistsOnDatabaseValidator } from 'src/common/validators/exists-on-database.validator';
import { Thread } from 'src/Models/thread.schema';
import { ThreadsModule } from 'src/discussionForum/threads/threads.module';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from '../log/log.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';


@Module({
  imports :[MongooseModule.forFeature([{ name: 'Module', schema: ModuleSchema }]),
  MongooseModule.forFeature([{name:'Response',schema:ResponseSchema}]),         
  MongooseModule.forFeature([{name:'Course',schema:CourseSchema}]),
  MongooseModule.forFeature([{name:'Progress',schema:ProgressSchema}]),
  MongooseModule.forFeature([{name:'User',schema:UserSchema}]),
  forwardRef(() => AuthModule),
  LogsModule,
  MulterModule.register({
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        const filename = `${file.originalname.replace(/\s+/g, '_')}_${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }),
],
  controllers: [UserController],
  providers: [UserService, authorizationGuard, AuthGuard, ExistsOnDatabaseValidator ],
  exports: [UserService, MongooseModule.forFeature([{name:'user',schema:UserSchema}])], // Export the service if it's needed in other modules
})
export class UserModule {}

