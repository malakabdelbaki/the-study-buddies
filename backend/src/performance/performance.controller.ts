import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PerformanceService } from './performance.service';
import { ApiTags, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentProgressDto } from './dto/student-progress.dto'; // Import DTO for student dashboard
import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto'; // Import DTO for instructor analytics

@ApiTags('Performance') // Group all endpoints under the "Performance" section in Swagger
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('/student/:studentId')
  @ApiOperation({ summary: 'Get student dashboard' })
  @ApiParam({ name: 'studentId', description: 'The ID of the student' })
  @ApiResponse({
    status: 200,
    description: 'Student dashboard data',
    type: [StudentProgressDto], // Use the DTO for documenting the response
  })
  async getStudentDashboard(
    @Param('studentId') studentId: string,
  ): Promise<StudentProgressDto[]> {
    return this.performanceService.getStudentDashboard(studentId);
  }

  @Get('/instructor/:instructorId')
  @ApiOperation({ summary: 'Get instructor analytics' })
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  @ApiResponse({
    status: 200,
    description: 'Instructor analytics data',
    type: [InstructorAnalyticsDto], // Use the DTO for documenting the response
  })
  async getInstructorAnalytics(
    @Param('instructorId') instructorId: string,
  ): Promise<InstructorAnalyticsDto[]> {
    return this.performanceService.getInstructorAnalytics(instructorId);
  }

  @Get('quiz-results/:instructorId')
  async getQuizResultsReport(@Param('instructorId') instructorId: string) {
    return this.performanceService.getQuizResultsReport(instructorId);
  }

  @Get('content-effectiveness/:instructorId')
  async getContentEffectivenessReport(
    @Param('instructorId') instructorId: string,
  ) {
    return await this.performanceService.getContentEffectivenessReport(instructorId);
  }


  @Get('/instructor/:instructorId/download')
  @ApiOperation({ summary: 'Download instructor analytics as a CSV file' })
  @ApiParam({ name: 'instructorId', description: 'The ID of the instructor' })
  @ApiResponse({
    status: 200,
    description: 'CSV file containing analytics report',
    content: { 'text/csv': {} },
  })
  async downloadAnalyticsReport(
    @Param('instructorId') instructorId: string,
    @Res() res: Response,
  ) {
    const csv = await this.performanceService.generateAnalyticsReport(instructorId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analytics_${instructorId}.csv"`,
    );
    res.send(csv);
  }
}

