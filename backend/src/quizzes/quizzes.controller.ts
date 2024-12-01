import { Controller } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { Post } from '@nestjs/common'; 
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Post()
    create(@Body() createQuizDto: CreateQuizDto) {
         return this.quizzesService.createQuiz(createQuizDto.user_id , createQuizDto.module_id);
    
    }

    // @Post(/:quiz_id/submit) 
    // submit(@Body() CreateResponseDto: CreateResponseDto) {
    //     return this.quizzesService.CreateResponse(CreateResponseDto.quiz_id, CreateResponseDto.user_id, CreateResponseDto.user_answers);
    // }

  
}


