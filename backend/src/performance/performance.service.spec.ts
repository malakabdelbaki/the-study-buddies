// import { Test, TestingModule } from '@nestjs/testing';
// import { PerformanceService } from './performance.service';

// describe('PerformanceService', () => {
//   let service: PerformanceService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [PerformanceService],
//     }).compile();

//     service = module.get<PerformanceService>(PerformanceService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

// import { Test, TestingModule } from '@nestjs/testing';
// import { PerformanceController } from './performance.controller';
// import { PerformanceService } from './performance.service';

// describe('PerformanceController', () => {
//   let controller: PerformanceController;
//   let service: jest.Mocked<PerformanceService>;

//   beforeEach(async () => {
//     const mockService = {
//       getStudentDashboard: jest.fn(),
//       getInstructorAnalytics: jest.fn(),
//       generateAnalyticsReport: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [PerformanceController],
//       providers: [{ provide: PerformanceService, useValue: mockService }],
//     }).compile();

//     controller = module.get<PerformanceController>(PerformanceController);
//     service = module.get(PerformanceService) as jest.Mocked<PerformanceService>;
//   });

//   it('should return student dashboard', async () => {
//     const dashboard = [
//       {
//         courseId: 'course1',
//         courseName: 'Course 1',
//         completionPercentage: 75,
//         lastAccessed: new Date('2024-11-18T12:34:56.789Z'), // Use a Date object here
//       },
//     ];
//     service.getStudentDashboard.mockResolvedValue(dashboard);
  
//     const result = await controller.getStudentDashboard('student1');
//     expect(result).toEqual(dashboard);
//     expect(service.getStudentDashboard).toHaveBeenCalledWith('student1');
//   });
// });

// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { PerformanceService } from './performance.service';
// import { Progress } from '../Models/progress.schema';
// import { Course } from '../Models/course.schema';

// describe('PerformanceService', () => {
//   let service: PerformanceService;
//   let progressModel: jest.Mocked<any>;
//   let courseModel: jest.Mocked<any>;

//   beforeEach(async () => {
//     const mockProgressModel = {
//       find: jest.fn().mockReturnThis(),
//       populate: jest.fn().mockReturnThis(),
//       exec: jest.fn(),
//     };

//     const mockCourseModel = { find: jest.fn() };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         PerformanceService,
//         { provide: getModelToken(Progress.name), useValue: mockProgressModel },
//         { provide: getModelToken(Course.name), useValue: mockCourseModel },
//       ],
//     }).compile();

//     service = module.get<PerformanceService>(PerformanceService);
//     progressModel = module.get(getModelToken(Progress.name));
//     courseModel = module.get(getModelToken(Course.name));
//   });

//   it('should return student dashboard', async () => {
//     const progressData = [
//       {
//         userId: 'student1',
//         courseId: { _id: 'course1', title: 'Course 1' },
//         completionPercentage: 75,
//         lastAccessed: new Date('2024-11-18T12:34:56.789Z'),
//       },
//     ];
//     progressModel.exec.mockResolvedValue(progressData);

//     const result = await service.getStudentDashboard('student1');

//     expect(result).toEqual([
//       {
//         courseId: 'course1',
//         courseName: 'Course 1',
//         completionPercentage: 75,
//         lastAccessed: new Date('2024-11-18T12:34:56.789Z'),
//       },
//     ]);
//   });

//   it('should generate a CSV report', async () => {
//     const analytics = [
//       {
//         courseId: 'course1',
//         courseTitle: 'Course 1',
//         totalStudents: 2,
//         averageCompletion: 75,
//         lowPerformingStudents: [
//           { studentName: 'Student 1', email: 'student1@example.com' },
//         ],
//       },
//     ];

//     jest.spyOn(service, 'getInstructorAnalytics').mockResolvedValue(analytics);

//     const csv = await service.generateAnalyticsReport('instructor1');

//     expect(csv).toBe(
//       `Course ID,Course Title,Total Students,Average Completion (%),Low-Performing Students\n` +
//         `course1,Course 1,2,75,Student 1 (student1@example.com)`,
//     );
//   });
// });


