import { Body, Controller, Delete, Get, Param, Post, Put, Res,  } from '@nestjs/common';
import { Response } from 'express';
import { PerformanceService } from './performance.service';
//import { StudentDashboardDto } from './dto/student-dashboard.dto';
//import { InstructorAnalyticsDto } from './dto/instructor-analytics.dto';


@Controller('performance')
export class PerformanceController {
    //readonly ensures that the data remains immutable, preventing unintended changes
    constructor(private readonly performanceService: PerformanceService) {}

    @Get('/student/:studentId')
  async getStudentDashboard(@Param('studentId') studentId: string) {
    return this.performanceService.getStudentDashboard(studentId);
  }
  
   
  // Get instructor analytics
  @Get('/instructor/:instructorId')
  async getInstructorAnalytics(@Param('instructorId') instructorId: string) {
    return this.performanceService.getInstructorAnalytics(instructorId);
  }
    
      // Download analytics report as a CSV file
      @Get('/instructor/:instructorId/download')
      async downloadAnalyticsReport(
        @Param('instructorId') instructorId: string,
        @Res() res: Response, // Explicitly define the response type as Express Response
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
