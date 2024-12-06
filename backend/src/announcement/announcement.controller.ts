import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ApiTags , ApiParam, ApiBody} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/authentication.guard';
import { UseGuards, SetMetadata } from '@nestjs/common';
import { authorizationGuard } from 'src/auth/guards/authorization.guard';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

@UseGuards(AuthGuard, authorizationGuard)
@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
  ) {}

  @Get('course/:courseId')
  @ApiParam({name: 'courseId'})
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async getAnnouncementsForCourse(
    @Param('courseId') courseId: string,
    @Req() req: any){
      const initiator = req.user.userid;
      return this.announcementService.findByCourse(courseId, initiator);
  }

  @Get('instructor/:instructorId')
  @ApiParam({name: 'instructorId'})
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  async getAnnouncementsForInstructor(
    @Param('instructorId') instructorId: string){
    return this.announcementService.findByInstructor(instructorId);
  }

  @Get('student/:studentId')
  @ApiParam({name: 'studentId'})
  @SetMetadata(ROLES_KEY, [Role.Student])
  async getAnnouncementsForStudent(
    @Param('studentId') studentId: string){
    return this.announcementService.findAnnouncementsOfStudent(studentId);
  }

  @Get(':announcementId')
  @ApiParam({name: 'announcementId'})
  @SetMetadata(ROLES_KEY, [Role.Instructor, Role.Student])
  async getAnnouncement(
    @Param('announcementId') announcementId: string,
    @Req() req: any){
      const initiator = req.user.userid;
    return this.announcementService.findOne(announcementId, initiator);
  }

  @Post()
  @ApiBody({type: CreateAnnouncementDto})
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  async createAnnouncement(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(createAnnouncementDto);
  }
  
  @Patch(':announcementId')
  @ApiParam({name: 'announcementId', type: String})
  @SetMetadata(ROLES_KEY, [Role.Instructor])
  async updateAnnouncement(@Param('announcementId') announcementId: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementService.update(updateAnnouncementDto, announcementId);
  }


}
