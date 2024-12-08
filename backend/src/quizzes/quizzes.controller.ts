import { Controller, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { Post , Param } from '@nestjs/common'; 
import { QuizzesService } from './quizzes.service';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { EnrolledGuard } from 'src/auth/guards/enrolled.guard';

@UseGuards(AuthGuard, authorizationGuard, EnrolledGuard)
@SetMetadata(ROLES_KEY, Role.Student)
@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Post()
    create(@Body() createQuizDto: CreateQuizDto) {
         return this.quizzesService.createQuiz(createQuizDto.user_id , createQuizDto.module_id);
    
    }

    @Post(':quiz_id/submit')
    submit(
      @Param('quiz_id') quiz_id: string, // Extract quiz_id from the route
      @Body() createResponseDto: CreateResponseDto // Properly name the DTO instance
    ) {
      return this.quizzesService.createResponse(
        quiz_id, 
        createResponseDto.user_id, 
        createResponseDto.user_answers
      );
    }
    

  
}


