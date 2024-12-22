import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement, AnnouncementDocument } from '../Models/announcement.schema';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CoursesService } from '../courses/courses.service';
import { Types } from 'mongoose';
import { UserService } from '../users/users.service';
import { NotificationsService } from '../WebSockets/notification/notification.service';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationsGateway } from '../WebSockets/notification/notification.gateway';
import { User } from '../Models/user.schema';

@Injectable()
export class AnnouncementService {

  constructor(
    @InjectModel(Announcement.name) private readonly announcementModel: Model<AnnouncementDocument>,
    private readonly courseService: CoursesService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
  ){}

  async create(createAnnouncementDto: CreateAnnouncementDto, instructor_id:string, creator_name:string ): Promise<Announcement> {
    const {course_id } = createAnnouncementDto;
    
    const createdAnnouncement = new this.announcementModel({
      ...createAnnouncementDto,
      instructor_id,
      creator_name
    });
    const savedAnnouncement = await createdAnnouncement.save();

    const enrolledStudents = await this.userService.getAllStudentsInCourse(course_id);
   
    const course = await this.courseService.findOne(new Types.ObjectId(course_id));
    for (const student of enrolledStudents) {
      await this.notificationsService.createNotificationForAnnouncement(
        (student as any)._id.toString(),
        createAnnouncementDto.content,
        (savedAnnouncement as any)._id.toString(),
        course.title
      );
  }

  return savedAnnouncement;
  }

  async findOne(id: string, initiator : Types.ObjectId): Promise<Announcement> {
    const announcement = await this.announcementModel.findById(id).exec(); 
    if (!announcement) {
      throw new NotFoundException(`Announcement #${id} not found`);
    }
    return announcement;
  }

  async findByCourse(courseId: string, initiator: Types.ObjectId): Promise<Announcement[]> {
    const announcements = await this.announcementModel.find({ course_id: courseId }).exec();
    return announcements;
  }

  async findByInstructor(instructorId: string): Promise<Announcement[]> {
    const announcements = await this.announcementModel.find({ instructor_id: instructorId }).exec();
    if (!announcements) {
      throw new NotFoundException(`Instructor #${instructorId} has no announcements`);
    }
    return this.announcementModel.find({ instructor_id: instructorId }).exec();
  }

  async findAnnouncementsOfStudent(studentId: string, ): Promise<Announcement[]> {
    const enrolledCourses = await this.userService.getEnrolledCoursesOfStudent(studentId);
    const announcements = [];
    for (const course of enrolledCourses) {
      const courseAnnouncements = await this.announcementModel.find({ course_id: (course as any)._id }).exec();
      announcements.push(...courseAnnouncements); // Use spread to flatten results into the announcements array
    }
    return announcements;  
  }



  async update(updateAnnouncementDto: UpdateAnnouncementDto,  announcement_id: string): Promise<Announcement> {
   
    const announcement = await this.announcementModel.findOne({_id: announcement_id}).exec();
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

}
