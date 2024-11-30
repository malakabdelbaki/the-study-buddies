import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement, AnnouncementDocument } from '../Models/announcement.schema';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CoursesService } from '../courses/courses.service';
import { Types } from 'mongoose';
import { UserService } from '../users/users.service';
import { NotificationsService } from '../notification/notification.service';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationsGateway } from '../notification/notification.gateway';

@Injectable()
export class AnnouncementService {

  constructor(
    @InjectModel(Announcement.name) private readonly announcementModel: Model<AnnouncementDocument>,
    private readonly courseService: CoursesService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ){}

  async create(createAnnouncementDto: CreateAnnouncementDto): Promise<Announcement> {
    const {course_id, instructor_id} = createAnnouncementDto;
    const course = await this.courseService.findOne(new Types.ObjectId(course_id));
    if (!course) {
      throw new NotFoundException(`Course #${course_id} not found`);
    }
    const instructor = await this.userService.findUserById(instructor_id);
    if (!instructor) {
      throw new NotFoundException(`User #${instructor_id} not found`);
    }
    if(course.instructor_id.toString() !== instructor_id) {
      throw new NotFoundException(`User #${instructor_id} is not the instructor of course #${course_id}`);
    }

    const createdAnnouncement = new this.announcementModel(createAnnouncementDto);
    const savedAnnouncement = await createdAnnouncement.save();

    const enrolledStudents = await this.userService.getAllStudentsInCourse(course_id);
   
    for (const student of enrolledStudents) {
      await this.notificationsService.createNotification(
        (student as any)._id.toString(),
        `New announcement: ${createAnnouncementDto.content}`,
        NotificationType.ANNOUNCEMENT,
        (savedAnnouncement as any)._id.toString(),
      );
  }

  return savedAnnouncement;
  }

  //remove
  async findAll(): Promise<Announcement[]> {
    return this.announcementModel.find().exec();
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel.findById(id).exec(); 
    if (!announcement) {
      throw new NotFoundException(`Announcement #${id} not found`);
    }
    return announcement;
  }

  async findByCourse(courseId: string): Promise<Announcement[]> {
    const courseObjectId = new Types.ObjectId(courseId);
    console.log(courseObjectId);
    const announcements = await this.announcementModel.find({ course_id: courseId }).exec();
    console.log(announcements);
    return announcements;
  }

  async findByInstructor(instructorId: string): Promise<Announcement[]> {
    const instructorObjectId = new Types.ObjectId(instructorId);
    return this.announcementModel.find({ instructor_id: instructorId }).exec();
  }

  async findAnnouncementsOfStudent(studentId: string): Promise<Announcement[]> {
    const enrolledCourses = await this.userService.getEnrolledCoursesOfStudent(studentId);
    const announcements = [];
    for (const course of enrolledCourses) {
      const courseAnnouncements = await this.findByCourse((course as any)._id.toString());
      announcements.push(...courseAnnouncements); // Use spread to flatten results into the announcements array
    }
    return announcements;  
  }



  async update(updateAnnouncementDto: UpdateAnnouncementDto,  announcement_id: string): Promise<Announcement> {
    console.log(updateAnnouncementDto);
    console.log(announcement_id);
    const announcement = await this.announcementModel.findOne({_id: announcement_id}).exec();
    console.log(announcement);
    if (!announcement) {
      throw new NotFoundException(`Announcement #${announcement_id} not found`);
    }
    const instructor = await this.userService.findUserById(updateAnnouncementDto.instructor_id);
    if (!instructor) {
      throw new NotFoundException(`User #${updateAnnouncementDto.instructor_id} not found`);
    }
    if(announcement.instructor_id.toString() !== updateAnnouncementDto.instructor_id) {
      throw new NotFoundException(`User #${updateAnnouncementDto.instructor_id} is not the instructor of course #${announcement.course_id}`);
    }

    const { content } = updateAnnouncementDto;
    announcement.content = content;
    const updatedAnnouncement = await announcement.save();

    // Notify all enrolled students
    const enrolledStudents = await this.userService.getAllStudentsInCourse(updatedAnnouncement.course_id.toString());
    for (const student of enrolledStudents) {
      await this.notificationsService.createNotification(
        (student as any)._id.toString(),
        `Announcement updated: ${updateAnnouncementDto.content}`,
        NotificationType.ANNOUNCEMENT,
        (updatedAnnouncement as any)._id.toString(),
      );
    }

    return updatedAnnouncement;  
  }  

  // async remove(id: string): Promise<Announcement> {
  //   const announcementObjectId = new Types.ObjectId(id);
  //   console.log(announcementObjectId);
  //   const announcement = await this.announcementModel.findByIdAndDelete(announcementObjectId).exec();
  //   if (!announcement) {
  //     throw new NotFoundException(`Announcement #${id} not found`);
  //   }
  //   return announcement;
  // }
}
