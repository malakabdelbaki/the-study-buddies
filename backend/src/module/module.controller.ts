import { Req, Controller, Get, Post, Query, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Difficulty } from 'src/enums/difficulty.enum';
import { Types } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from 'src/courses/courses.service';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ResourceDto } from './dto/create-resource.dto';
import { Response } from 'express';
import * as fs from 'fs';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UsePipes } from '@nestjs/common';
import { InstructorGuard } from 'src/auth/guards/instructor.guard';
@Controller('modules')
@UseGuards(AuthGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService, private readonly courseService: CoursesService) {}

  @ApiOperation({ summary: 'create a new module' })
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Post() //ok
  async create(@Req() request,@Body() createModuleDto: CreateModuleDto) {
    try {
      console.log('enterered');
      const instructorId = request.user.userid;
      console.log(request.user);
      return await this.moduleService.createModule({
        ...createModuleDto,
        instructor_id:new Types.ObjectId(instructorId) ,
        course_id:new Types.ObjectId(createModuleDto.course_id)});
    } catch (error) {
      throw new HttpException('Failed to create module: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'get a specific module by id' })
  @Get(':ModuleId') //ok
  @UseGuards(authorizationGuard)
  async getModule(@Param('ModuleId') ModuleId: string) {
    try {
      let ID = new Types.ObjectId(ModuleId);
      const module = await this.moduleService.findOne(ID);
      if (!module) {
        throw new HttpException('Module not found', HttpStatus.NOT_FOUND);
      }
      return module;
    } catch (error) {
      throw new HttpException('Failed to get module: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
     
  // Update a module's general info
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @ApiOperation({ summary: 'update general info of a specific module' })
  @Patch(':module_id')
  async update(
    @Param('module_id') module_id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    try {
      console.log('entered',module_id,updateModuleDto);
      let ID = new Types.ObjectId(module_id);
      const updatedModule = await this.moduleService.updateModule(ID, updateModuleDto);
      if (!updatedModule) {
        throw new HttpException('Module update failed', HttpStatus.BAD_REQUEST);
      }
      return updatedModule;
    } catch (error) {
      throw new HttpException('Failed to update module: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @ApiOperation({ summary: 'Rate Module' })
  @ApiParam({ name: 'id', description: 'Module ID', type: String })
  @ApiBody({
    description: 'Rate A module',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'number', description: 'rating ' },
      },
    },
  })
  @Roles(Role.Student)
  @UseGuards(authorizationGuard)
  @Post(':id/rate')
  async RateModule(@Req() request,@Param('id') id: string ,@Body() ratingbody:{rating:number}) {
    try {
      const {rating} = ratingbody;
      const moduleid = new Types.ObjectId(id);
      const studentid = request.user?.userid; // Extract instructorId
      if(!studentid || !request.user){
        throw new HttpException('Error not found a student', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return await this.moduleService.rateModule(studentid,moduleid,rating);
    } catch (err) {
      console.log(err.message);
      throw new HttpException('Error Rating a Module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }






  //_________________________________________**QUESTIONS**______________________________________________________//

  // Add a question to a module's question bank
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Post('question-bank')
  async addQuestion(@Req() request,@Body() createQuestionDto: CreateQuestionDto) {
    try {
      console.log('entered ques')
      let inst = request.user.userid;
      if (!inst || !request.user) {
        throw new HttpException('not loged in instructor',HttpStatus.UNAUTHORIZED);
      }
      const newQuestion = await this.moduleService.addQuestion({
        ...createQuestionDto,
        module_id:new Types.ObjectId(createQuestionDto.module_id),
        instructor_id :new Types.ObjectId(inst)
      }
      );
      if (!newQuestion) {
        throw new HttpException('Failed to add question to the module', HttpStatus.BAD_REQUEST);
      }
      return newQuestion;
    } catch (error) {
      throw new HttpException('Failed to add question: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update a question in the module's question bank
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Patch('question-bank/:quesId')
  async updateQuestion(
    @Param('quesId') quesId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    try {
      console.log('duuuuuu');
      let ID = new Types.ObjectId(quesId);
      const updatedQuestion = await this.moduleService.updateQuestion(ID, updateQuestionDto);
      if (!updatedQuestion) {
        throw new HttpException('Failed to update question', HttpStatus.BAD_REQUEST);
      }
      return updatedQuestion;
    } catch (error) {
      console.log('myerror',error)
      throw new HttpException('Failed to update question: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a question from the module's question bank
  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Delete('question-bank/:quesId')
  async deleteQuestion(@Param('quesId') quesId: string) {
    try {
      let ID = new Types.ObjectId(quesId);
      const deletedQuestion = await this.moduleService.deleteQuestion(ID);
      if (!deletedQuestion) {
        throw new HttpException('Failed to delete question', HttpStatus.BAD_REQUEST);
      }
      return deletedQuestion;
     
    } catch (error) {
      throw new HttpException('Failed to delete question: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Get(':module_id/question-bank')
  async getQuestionBank(@Param('module_id') module_id: string) {
    try {
      let ID = new Types.ObjectId(module_id);
      const questionBank = await this.moduleService.getQuestionBank(ID);
      if (!questionBank) {
        throw new HttpException('No questions found for this module', HttpStatus.NOT_FOUND);
      }
      return questionBank;
    } catch (error) {
      throw new HttpException('Failed to get question bank: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard, InstructorGuard)
  @Get('question-bank/:questionId')
  async getOneQuestion(@Param('questionId') questionId: string) {
    try {
      let ID = new Types.ObjectId(questionId);
      const question = await this.moduleService.getOneQuestion(ID);
      if (!question) {
        throw new HttpException('No questions found for this module', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      throw new HttpException('Failed to get question bank: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  
  
  //______________________________________________*RESOURCE*___________________________________________//

 
 
 
 
@Roles(Role.Instructor)
@UseGuards(authorizationGuard, InstructorGuard)// -> gives me error
@Post(':module_id/resource')
@ApiOperation({ summary: 'Upload a resource file' })
@ApiConsumes('multipart/form-data') // Indicates the endpoint accepts multipart/form-data
@ApiBody({
  description: 'Upload a resource with a comment and outletId',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'title ' },
      file: {
        type: 'string',
        format: 'binary',
        description: 'File to be uploaded',
      },
    },
  },
})
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          if (!file) {
            callback(new BadRequestException('No file provided'), null);
            return;
          }
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          const filename = `${file.originalname.replace(/\s+/g, '_')}_${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadResource(
    @Param('module_id') module_id: string,
    @Body() body: { title: string,description?:string,type?:string }, // Other body data
    @UploadedFile() file: Express.Multer.File, // Uploaded file
  ) {
    if (!file) {
      throw new BadRequestException('File upload failed');
    }

    console.log('File:', file);
    console.log('Body:', body);

    const moduleObjectId = module_id; // Replace this with your actual validation logic

    const url = `http://localhost:3000/resources/${file.filename}`;
    return await this.moduleService.uploadResource({
      module_id: new Types.ObjectId(moduleObjectId),
      title: body.title,
      url,
      description:body.description,
      type:body.type
    });
  }



@ApiOperation({ summary: 'Delete a resource by its ID ' })
@Roles(Role.Instructor)
@UseGuards(authorizationGuard, InstructorGuard)
@Delete('resources/:id')
async deleteResource(@Param('id') id: string) {
  try{
  let ID = new Types.ObjectId(id);
  return this.moduleService.deleteResource(ID);
}
catch(err){
  throw new HttpException('Some thing went wrong',HttpStatus.INTERNAL_SERVER_ERROR);
}
}



@ApiOperation({ summary: 'Get all resources for a specific module' })
@UseGuards(authorizationGuard, InstructorGuard)
@Get(':Module_id/resources')
async getAllRecourses(@Req() request,@Param('Module_id') module_id: string) {
  try{
  let userId = new Types.ObjectId(request.user.userid);
  let ID = new Types.ObjectId(module_id);
  return await this.moduleService.getAllRecourses(userId,ID);
}
catch(err){
  throw new HttpException('Some thing went wrong',HttpStatus.INTERNAL_SERVER_ERROR);
}
}



@ApiOperation({ summary: 'Get resource metadata by its ID' })
@Get('resources/:id')
async getOneResource(@Req() request,@Param('id') id: string) {
  try{
  let userid = new Types.ObjectId(request.user.userid);  
  let ID = new Types.ObjectId(id);
  console.log('wow!',userid,ID);
  return this.moduleService.getResource(userid,ID);
  }
  catch(err){
    throw new HttpException('Some thing went wrong',HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@ApiOperation({ summary: 'Download a resource by filename' })
@Get('download/:filename')
async downloadResource(@Param('filename') filename: string, @Res() res: Response) {
  try{
  const filePath = path.resolve(__dirname, '../../uploads', filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Determine the MIME type of the file
  const mimeType = this.getMimeType(filePath);

  // Set Content-Type header for the file
  res.setHeader('Content-Type', mimeType);

  // Send the file
  return res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error downloading file');
    }
  });
}
catch(err){
  throw new HttpException('you can not download this file',HttpStatus.INTERNAL_SERVER_ERROR);
}
}

@ApiOperation({ summary: 'Update a resource' })
@Roles(Role.Instructor)
@UseGuards(authorizationGuard, InstructorGuard)
@ApiBody({
  description: 'update a resource (title/description)',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'title' },
      description: { type: 'string', description: 'description' }
    },
  },
})
@Patch('resources/:id')
async UpdateResource(@Param('id') id: string,@Body() updateResourceDto: UpdateResourceDto){
  try{
    let ID = new Types.ObjectId(id);
    return this.moduleService.updateResource(ID,updateResourceDto);
  }
  catch(err){
    throw new HttpException('Some thing went wrong while updating!',HttpStatus.INTERNAL_SERVER_ERROR);
  }

}





///HELPER MEHTOD to get the type of the downloaded file

 getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.zip': 'application/zip',
  };

  return mimeTypes[extension] || 'application/octet-stream'; // Default to binary stream
}
}



