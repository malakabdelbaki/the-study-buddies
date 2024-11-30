import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ApiTags , ApiParam, ApiBody} from '@nestjs/swagger';

@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService
  ) {}

  @Get('course/:courseId')
  @ApiParam({name: 'courseId'})
  async getAnnouncementsForCourse(@Param('courseId') courseId: string) {
    return this.announcementService.findByCourse(courseId);
  }

  @Get('instructor/:instructorId')
  @ApiParam({name: 'instructorId'})
  async getAnnouncementsForInstructor(@Param('instructorId') instructorId: string) {
    return this.announcementService.findByInstructor(instructorId);
  }

  @Get('student/:studentId')
  @ApiParam({name: 'studentId'})
  async getAnnouncementsForStudent(@Param('studentId') studentId: string) {
    return this.announcementService.findAnnouncementsOfStudent(studentId);
  }

  @Get(':announcementId')
  @ApiParam({name: 'announcementId'})
  async getAnnouncement(@Param('announcementId') announcementId: string) {
    return this.announcementService.findOne(announcementId);
  }

  @Post()
  @ApiBody({type: CreateAnnouncementDto})
  async createAnnouncement(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(createAnnouncementDto);
  }
  
  @Patch(':announcementId')
  @ApiParam({name: 'announcementId', type: String})
  async updateAnnouncement(@Param('announcementId') announcementId: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementService.update(updateAnnouncementDto, announcementId);
  }

  // @Delete(':announcementId')
  // @ApiParam({name: 'announcementId', type: String})
  // async deleteAnnouncement(@Param('announcementId') announcementId: string) {
  //   return this.announcementService.remove(announcementId);
  // }

}
