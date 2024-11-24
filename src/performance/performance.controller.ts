import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

 
  // Endpoint for instructors to get analytics
  @Get('/instructor/:instructorId')
  async getInstructorAnalytics(@Param('instructorId') instructorId: string) {
    return this.performanceService.getInstructorAnalytics(instructorId);
  }


}
