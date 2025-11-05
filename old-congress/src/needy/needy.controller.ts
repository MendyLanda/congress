import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RecaptchaGuard } from 'src/auth/recaptcha/recaptcha.guard';
import { UserPayload } from 'src/interfaces/user-payload.interface';
import { UserRole } from '../../shared/enums/user-role.enum';
import { User } from '../../shared/interfaces/user.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetAvrechRequestStatusDto } from './dto/get-avrech-request-status.dto';
import { CreateNeedyDto } from './dto/create-needy.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateSupportRecommendationDto } from './dto/create-support-recommendation.dto';
import { UpdateNeedyDto } from './dto/update-needy.dto';
import { NeedyService } from './needy.service';
import { UpdateEmailRequestDto } from './dto/update-email-request.dto';
import { UpdateBankDetailsRequestDto } from './dto/update-bank-details-request.dto';

@Controller('needy')
export class NeedyController {
  constructor(private readonly needyService: NeedyService) { }

  @Post()
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  create(@Body() createNeedyDto: CreateNeedyDto, @Req() req) {
    return this.needyService.create(createNeedyDto, req.user);
  }


  @Public()
  @UseGuards(RecaptchaGuard)
  @Post("avrech")
  createAvrech(@Body() createNeedyDto: CreateNeedyDto) {
    const user: UserPayload = {
      id: +process.env.AVRECH_USER_ID,
      projectId: +process.env.AVRECH_PROJECT_ID,
      role: undefined,
      username: undefined,
    };

    createNeedyDto.creatorId = user.id;
    createNeedyDto.organizationId = +process.env.AVRECH_ORGANIZATION_ID;
    createNeedyDto.projectId = user.projectId;

    if (createNeedyDto.student) {
      createNeedyDto.student.projectId = user.projectId;
      createNeedyDto.student.studentChildren = createNeedyDto.student.studentChildren.map(sc => ({ ...sc, projectId: user.projectId }));
    }
    return this.needyService.create(createNeedyDto, user);
  }

  @Public()
  @UseGuards(RecaptchaGuard)
  @Post("avrech/status")
  getAvrechRequestStatus(@Body() getAvrechRequestStatusDto: GetAvrechRequestStatusDto) {
    return this.needyService.getAvrechRequestStatus(getAvrechRequestStatusDto);
  }

  @Public()
  @UseGuards(RecaptchaGuard)
  @Patch("avrech/update-email")
  avrechUpdateEmail(@Body() updateEmailRequestDto: UpdateEmailRequestDto) {
    return this.needyService.avrechUpdateEmail(updateEmailRequestDto);
  }

  @Public()
  @UseGuards(RecaptchaGuard)
  @Patch("avrech/update-bank-details")
  avrechUpdateBankDetails(@Body() updateBankDetailsRequestDto: UpdateBankDetailsRequestDto) {
    return this.needyService.avrechUpdateBankDetails(updateBankDetailsRequestDto);
  }

  @Patch(':id')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  update(@Param('id') id: string, @Body() updateNeedyDto: UpdateNeedyDto, @Req() req) {
    return this.needyService.update(+id, updateNeedyDto, req.user);
  }

  @Patch('student/:id')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  updateStudent(@Param('id') id: string, @Body() updateNeedyDto: CreateStudentDto, @Req() req) {
    return this.needyService.updateStudent(+id, updateNeedyDto, req.user);
  }

  @Get("all/:projectId")
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  findAllWithLastStatuses(@Param('projectId') projectId: string, @Req() req) {
    return this.needyService.findAllWithLastStatuses(+projectId, req.user);
  }

  @Post('is-duplicate-ssn')
  @Roles(UserRole.manager, UserRole.welfareCommittee, UserRole.welfareDepartment)
  isDuplicateSSN(@Body() body: { ssn: string, projectId: number }) {
    return this.needyService.isDuplicateSSN(body);
  }

  @Get(':id')
  @Roles(UserRole.manager)
  findOne(@Param('id') id: string, @Req() req) {
    return this.needyService.findOne(+id, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  remove(@Param('id') id: string, @Req() req) {
    return this.needyService.remove(+id, req.user);
  }

  //--- SupportRecommendation ---//
  @Post('recommendation')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  addSupportRecommendation(@Body() createSupportRecommendationDto: CreateSupportRecommendationDto, @Req() req) {
    return this.needyService.addSupportRecommendation(createSupportRecommendationDto, req.user);
  }

  @Patch('recommendation/:id')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  updateSupportRecommendation(@Param('id') id: string, @Body() updateSupportRecommendationDto: CreateSupportRecommendationDto, @Req() req) {
    return this.needyService.updateSupportRecommendation(+id, updateSupportRecommendationDto, req.user);
  }

  @Delete('recommendation/:id')
  @Roles(UserRole.manager)
  deleteSupportRecommendation(@Param('id') id: string, @Req() req) {
    return this.needyService.deleteSupportRecommendation(+id, req.user);
  }

  //--- Payment ---//

  @Post('payment')
  @Roles(UserRole.manager)
  addPayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.needyService.addPayment(createPaymentDto, req.user);
  }

  @Post('get-payment-by-needies')
  @Roles(UserRole.manager)
  async getPaymentsByNeedyIds(@Body() ids) {
    return this.needyService.getPaymentsByNeedyIds(ids);
  }

  @Delete('payment/:id')
  @Roles(UserRole.manager)
  deletePayment(@Param('id') id: string) {
    return this.needyService.deletePayment(+id);
  }

  //--- Document ---//
  @Post('document')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  @UseInterceptors(FileInterceptor('doc', { dest: 'uploads/' }))
  addDocument(@Body() createDocumentDto: CreateDocumentDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.needyService.addDocument(createDocumentDto, file, req.user);
  }

  @Public()
  @UseGuards(RecaptchaGuard)
  @Post("avrech/document")
  @UseInterceptors(FileInterceptor('doc', { dest: 'uploads/' }))
  addDocumentAvrech(@Body() createDocumentDto: CreateDocumentDto, @UploadedFile() file: Express.Multer.File) {
    const user: UserPayload = {
      id: +process.env.AVRECH_USER_ID,
      projectId: +process.env.AVRECH_PROJECT_ID,
      role: undefined,
      username: undefined,
    };

    createDocumentDto.projectId = user.projectId;

    return this.needyService.addDocument(createDocumentDto, file, user, true);
  }

  @Get('document/name/:id')
  @Roles(UserRole.manager)
  getDocumentName(@Param('id') id: string) {
    return this.needyService.getDocumentName(+id);
  }

  @Get('document/:id')
  @Roles(UserRole.manager)
  async getDocument(@Res() res: any, @Param('id') id: string) {
    const file = await this.needyService.getDocument(+id);
    file.pipe(res);
  }

  @Delete('document/:id')
  @Roles(UserRole.manager)
  deleteDocument(@Param('id') id: string) {
    return this.needyService.deleteDocument(+id);
  }
}
