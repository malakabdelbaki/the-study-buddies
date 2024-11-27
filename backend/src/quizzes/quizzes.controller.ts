import { Controller } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Post } from '@nestjs/common'; 
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Post()
    create(@Body() createQuizDto: CreateQuizDto) {
         return this.quizzesService.createQuiz(createQuizDto.user_id , createQuizDto.module_id);
    }
  
}


