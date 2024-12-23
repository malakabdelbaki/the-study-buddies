import { Controller, Get, Param, Res,Query,HttpException,HttpStatus, UseGuards,SetMetadata, UnauthorizedException, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PerformanceService } from './performance.service';
import { ApiTags, ApiParam, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StudentProgressDto } from './dto/student-progress.dto'; // Import DTO for student dashboard
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto'; // Import DTO for instructor analytics
import { authorizationGuard } from '../auth/guards/authorization.guard';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { Roles, ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Request } from 'express';

@ApiTags('Performance') // Group all endpoints under the "Performance" section in Swagger
@Controller('performance')
@UseGuards(AuthGuard)
//@Roles(Role.User)
// @UseGuards(authorizationGuard)
//@UseGuards(AuthGuard, authorizationGuard)

export class PerformanceController {

  constructor(private readonly performanceService: PerformanceService) {}


  //just gets averagegrade from progress
  @Get(':courseId/:userId/average-grade')
  @ApiOperation({ summary: 'Get average grade by user and course ID' })
  @ApiQuery({ name: 'userId', description: 'The ID of the user', required: true })
  @ApiQuery({ name: 'courseId', description: 'The ID of the course', required: true })
  async getAverageGrade(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<{ averageGrade: number }> {
    if (!userId || !courseId) {
      throw new BadRequestException('Both userId and courseId are required.');
    }

    const averageGrade = await this.performanceService.getAverageGradeByUserAndCourse(userId, courseId);

    if (averageGrade === null) {
      throw new NotFoundException('Progress record not found for the provided userId and courseId.');
    }

    return { averageGrade };
  }


  @Roles(Role.Student)
  @UseGuards(authorizationGuard)
  @Get('/student/:studentId')
 // @SetMetadata(ROLES_KEY, [ Role.Student])
  @ApiOperation({ summary: 'Get student dashboard' })
  @ApiParam({ name: 'studentId', description: 'The ID of the student' })
  @ApiResponse({
    status: 200,
    description: 'Student dashboard data',
    type: [StudentProgressDto], // Use the DTO for documenting the response
  })
  
  async getStudentDashboard(
    @Param('studentId') studentId: string, // Request object for JWT user data
  ): Promise<StudentProgressDto[]> {
    
    console.log(`API hit for student performance: ${studentId}`);
    return this.performanceService.getStudentDashboard(studentId);
    
  }



  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('/instructor/:instructorId')
  @ApiOperation({ summary: 'Get instructor analytics' })
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  @ApiResponse({
    status: 200,
    description: 'Instructor analytics data',
    type: [InstructorAnalyticsDto], // Use the DTO for documenting the response
  })
  async getInstructorAnalytics(
    @Param('instructorId') instructorId: string,
  ): Promise<InstructorAnalyticsDto[]> {
    console.log(`API hit for instructor analysis: ${instructorId}`);
    return this.performanceService.getInstructorAnalytics(instructorId);
  }


  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('quiz-results/:instructorId')
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  async getQuizResultsReport(@Param('instructorId') instructorId: string) {
    return this.performanceService.getQuizResultsReport(instructorId);
  }

  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('content-effectiveness/:instructorId')
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  async getContentEffectivenessReport(
    @Param('instructorId') instructorId: string,
  ) {
    return await this.performanceService.getContentEffectivenessReport(instructorId);
  }


  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('download-analytics/:instructorId')
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  async downloadAnalytics(
    @Param('instructorId') instructorId: string,
    //@Query('format: csv or json') format: 'csv' | 'json' = 'json',
    @Query('format') format: 'csv' | 'json' = 'json',
    @Res() res: Response,
  ) {
    console.log(`API hit for instructor download: ${instructorId}`);
    try {
      const { filePath, fileName } =
        await this.performanceService.generateDownloadableAnalytics(
          instructorId,
          format,
        );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.sendFile(filePath);
    } catch (error) {
      throw new HttpException(
        'Error generating analytics file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('download-quiz-results/:instructorId')
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  async downloadQuizResults(
    @Param('instructorId') instructorId: string,
    //@Query('format: csv or json') format: 'csv' | 'json' = 'json',
    @Query('format') format: 'csv' | 'json' = 'json',

    @Res() res: Response,
  ) {
    try {
      const { filePath, fileName } =
        await this.performanceService.generateDownloadableQuizResults(
          instructorId,
          format,
        );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.sendFile(filePath);
    } catch (error) {
      throw new HttpException(
        'Error generating quiz results file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(Role.Instructor)
  @UseGuards(authorizationGuard)
  @Get('download-content-effectiveness/:instructorId')
  //@SetMetadata(ROLES_KEY, [ Role.Instructor])
  async downloadContentEffectivenessReport(
    @Param('instructorId') instructorId: string,
    //@Query('format: csv or json') format: 'csv' | 'json' = 'json',
    @Query('format') format: 'csv' | 'json' = 'json',
    @Res() res: Response,
  ) {
    try {
      const { filePath, fileName } =
        await this.performanceService.generateDownloadableContentEffectivenessReport(
          instructorId,
          format,
        );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.sendFile(filePath);
    } catch (error) {
      throw new HttpException(
        'Error generating content effectiveness report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



}

