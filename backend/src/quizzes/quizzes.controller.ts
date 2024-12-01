import { Controller } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { Post , Param } from '@nestjs/common'; 
import { QuizzesService } from './quizzes.service';

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


