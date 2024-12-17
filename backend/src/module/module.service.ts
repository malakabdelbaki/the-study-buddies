import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ModuleDocument } from 'src/models/modules.schema';
import { CourseDocument } from 'src/Models/course.schema';
import { Question, QuestionDocument } from 'src/Models/question.schema';
import { Resource, ResourceDocument } from 'src/Models/resource.schema';
import { ResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { UserDocument } from 'src/Models/user.schema';
import { Role } from 'src/enums/role.enum';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { QuizDocument } from 'src/models/quiz.schema';

@Injectable()
export class ModuleService {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor(
    @InjectModel('Module') private readonly Modulemodel: Model<ModuleDocument>,
    @InjectModel('Question') private readonly Questionmodel: Model<QuestionDocument>,
    @InjectModel('Course') private readonly coursemodel: Model<CourseDocument>,
    @InjectModel('Resource') private readonly resourcemodel: Model<ResourceDocument>,
    @InjectModel('User') private readonly usermodel: Model<UserDocument>,
    @InjectModel('Quiz') private readonly Quizmodel: Model<QuizDocument>,

  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME; // Name of the S3 bucket

  }

  async createModule(createModuleDto: CreateModuleDto) {
    try {
      const courseId = createModuleDto.course_id;
      if (!courseId) throw new NotFoundException('Course Not found');

      const course = await this.coursemodel.findById(courseId).populate('modules');
      if (!course) throw new NotFoundException('Course Not found');

      const newModule = await this.Modulemodel.create(createModuleDto);
      await newModule.save();

      course.modules.push(newModule._id as Types.ObjectId);
      await course.save();

      return newModule;
    } catch (error) {
      throw new InternalServerErrorException('Error creating module', error.message);
    }
  }

  async findOne(ModuleId: Types.ObjectId) {
    try {
      const module = await this.Modulemodel.findById(ModuleId);
      if (!module) throw new NotFoundException('Module not found');
      return module;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving module', error.message);
    }
  }



  async updateModule(Moduleid: Types.ObjectId, updateModuleDto: UpdateModuleDto) {
    try {
      const module = await this.Modulemodel.findById(Moduleid);
      if (!module) throw new NotFoundException('Module not found');

      if (updateModuleDto.quiz_length || updateModuleDto.quiz_type){
        
        //check If a studnet already took a quiz on this module   
        const quiz = await this.Quizmodel.find({module_id:Moduleid});
        if (quiz){
          throw new Error ('You can not change the type & length of the quiz as there are some students took a quiz');
        }

      }
      
      const updatedModule = await this.Modulemodel.findByIdAndUpdate(Moduleid, updateModuleDto, { new: true });
      
      return await updatedModule.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating module', error.message);
    }
  }



  async deleteModule(ModuleId: Types.ObjectId) {
    try {
      const module = await this.Modulemodel.findById(ModuleId).populate('question_bank');
      if (!module) throw new NotFoundException('Module not found');

      if (module.question_bank && module.question_bank.length > 0) {
        const questionIds = module.question_bank.map((question: any) => question._id);
        await this.Questionmodel.deleteMany({ _id: { $in: questionIds } });
      }

      await this.Modulemodel.findByIdAndDelete(ModuleId);
      return 'Deleted successfully';
    } catch (error) {
      throw new InternalServerErrorException('Error deleting module', error.message);
    }
  }


  async rateModule(studentid:Types.ObjectId,module_id:Types.ObjectId,rating:number){
    let module = await this.findOne(module_id);
    if(!module){
      throw new Error ('no Module Found with this ID');
    }
    
    if (!rating){
      throw new Error(' You must Enter a rating');
    }

    module.ratings.set(studentid,rating)
    module.save();
    return module;
}
  
  
 
  
  
  //_____________________________________________*Questions*______________________________________________//





  async addQuestion(createQuestionDto: CreateQuestionDto) {
    try {
      const moduleId = createQuestionDto.module_id;
      const module = await this.Modulemodel.findById(moduleId).populate('question_bank');
      if (!module) throw new NotFoundException('Module not found');

      const newQuestion = await this.Questionmodel.create(createQuestionDto);
      await newQuestion.save();

      module.question_bank.push(newQuestion._id as Types.ObjectId);
      await module.save();

      return newQuestion;
    } catch (error) {
      throw new InternalServerErrorException('Error adding question', error.message);
    }
  }

  async deleteQuestion(quesId: Types.ObjectId) {
    try {
      const deletedQuestion = await this.Questionmodel.findByIdAndDelete(quesId).populate('module_id');
      if (!deletedQuestion) throw new NotFoundException('Question not found');

      const module = await this.Modulemodel.findById(deletedQuestion.module_id).populate('question_bank');
      if (!module) throw new NotFoundException('Module not found');

      module.question_bank = module.question_bank.filter((question) => question.toString() !== quesId.toString());
      await module.save();

      return deletedQuestion;
    } catch (error) {
      throw new InternalServerErrorException('Error deleting question', error.message);
    }
  }

  async updateQuestion(quesId: Types.ObjectId, updateQuestionDto: UpdateQuestionDto) {
    try {
      const question = await this.Questionmodel.findById(quesId);
      if (!question) throw new NotFoundException('Question not found');

      const updatedQuestion = await this.Questionmodel.findByIdAndUpdate(quesId, updateQuestionDto, { new: true });
      return await updatedQuestion.save();
    } catch (error) {
      throw new InternalServerErrorException('Error updating question', error.message);
    }
  }
  async findQuestion(quesId: Types.ObjectId) {
    try {
      const question = await this.Questionmodel.findById(quesId);
      if (!question) throw new NotFoundException('Question not found');

      return question;
    } catch (error) {
      throw new InternalServerErrorException('Error updating question', error.message);
    }
  }

  async getQuestionBank(Moduleid: Types.ObjectId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(Moduleid)) {
        throw new NotFoundException('Invalid Module ID');
      }

      const module = await this.Modulemodel.findById(Moduleid).populate('question_bank') as unknown as {
        question_bank: Question[];
      };

      if (!module) throw new NotFoundException('Module not found');
      if (!module.question_bank) return  [];

      return module.question_bank;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching question bank', error.message);
    }
  }





  //_________________________________*RESOURCE*__________________________________________//


  async uploadResource(resourceDto: ResourceDto): Promise<Resource> {
    try{
      const newResource = await this.resourcemodel.create(resourceDto);
      newResource.save();
      const module = await this.Modulemodel.findById(resourceDto.module_id).populate('resources');
      if (!module) {
        throw new Error('Module not found'); // Handle missing module
      }
    
      module.resources.push(newResource._id as Types.ObjectId);
      await module.save();
      
    
      return newResource;
    }
    catch(error){
      throw new Error(error.message);
    }
  }


  // async PostFileAndGetUrl(file){
  //   const fileKey = `${file.filename.replace(/\s+/g, '_')}`; // Unique file key

  //   // Upload file to S3
  //   await this.s3Client.send(
  //     new PutObjectCommand({
  //       Bucket: this.bucketName,
  //       Key: fileKey,
  //       Body: file.buffer,
  //       ContentType: file.mimetype,
  //     }),
  //   );

  //   // Return the file URL
  //   return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  // }
  

  async getAllRecourses(userId:Types.ObjectId,module_id:Types.ObjectId){
    let resources = await this.resourcemodel.find({module_id:module_id});
    const user = await this.usermodel.findById(userId);
    if (!resources){
          throw new Error('No resources found for this module');
      }
    
    
    if (user.role === Role.Student)
      resources = resources.filter((resource)=> resource.isOutdated===false);

    
    return resources;
  }

  async getResource(userid:Types.ObjectId,id: Types.ObjectId): Promise<Resource> {

    const resource = await this.resourcemodel.findById(id);
    const user = await this.usermodel.findById(userid);
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    if (user.role === Role.Student && resource.isModified)
      throw new Error('Resource not available');

    
    return resource; // Return metadata including the file URL
  }

  // async getAvailableResources(userId,moduleId:Types.ObjectId) {
  //   const resources = await this.resourcemodel.find({module_id:moduleId,isUpdated:false});
  //   if (!resources)
  //     throw new Error('No resources found');
  //   return resources;
  // }
  
   // 2. Delete Resource: Mark as outdated or delete from DB
   async deleteResource(id: Types.ObjectId): Promise<{ message: string }> {
    const resource = await this.resourcemodel.findById(id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    resource.isOutdated = true; // Mark as outdated instead of deletion
    await resource.save();
    return { message: 'Resource marked as outdated' };
  }

  async updateResource(id:Types.ObjectId,updateResourceDto:UpdateResourceDto){
    try{
      const resource = await this.resourcemodel.findByIdAndUpdate(id,updateResourceDto);
      if (!resource){
        throw new Error ('REsource not found');
      }
      resource.save();
      return resource;
    }
    catch(err){
      throw new Error('Something went wrong !');
    }
  }

  
}



