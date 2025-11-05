import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as cloudinary from 'cloudinary';
import { isBefore } from "date-fns";
import { createReadStream, ReadStream } from 'fs';
import { Payment } from 'shared/interfaces/payment.interface';
import { UserPayload } from 'src/interfaces/user-payload.interface';
import { UserObject } from 'src/users/schemas/user.schema';
import { downloadFile } from 'src/utils/files';
import { NeedyType } from '../../shared/enums/needy-type.enum';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';
import { UserRole } from '../../shared/enums/user-role.enum';
import { SupportRecommendation } from '../../shared/interfaces/support-recommendation.interface';
import { isUpdatingRecommendationAllowed } from '../../shared/logic/recommendation.helpers';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateNeedyDto } from './dto/create-needy.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateSupportRecommendationDto } from './dto/create-support-recommendation.dto';
import { GetAvrechRequestStatusDto } from './dto/get-avrech-request-status.dto';
import { UpdateNeedyDto } from './dto/update-needy.dto';
import { CouponCardObject } from './schemas/coupon-card.schema';
import { DocumentObject } from './schemas/document.schema';
import { NeedyObject } from './schemas/needy.schema';
import { PaymentObject } from './schemas/payment.schema';
import { StudentChildObject } from './schemas/student-child.schema';
import { StudentObject } from './schemas/student.schema';
import { SupportRecommendationObject } from './schemas/support-recommendation.schema';
import { UpdateEmailRequestDto } from './dto/update-email-request.dto';
import { validateSSN } from 'shared/logic/ssn.validator';
import { Op } from 'sequelize';
import { UpdateBankDetailsRequestDto } from './dto/update-bank-details-request.dto';

@Injectable()
export class NeedyService {

  constructor(
    @InjectModel(NeedyObject)
    private needyRepository: typeof NeedyObject,
    @InjectModel(SupportRecommendationObject)
    private supportRecommendationRepository: typeof SupportRecommendationObject,
    @InjectModel(PaymentObject)
    private paymentRepository: typeof PaymentObject,
    @InjectModel(DocumentObject)
    private documentRepository: typeof DocumentObject,
    @InjectModel(StudentObject)
    private studentRepository: typeof StudentObject,
    @InjectModel(StudentChildObject)
    private studentChildRepository: typeof StudentChildObject,
    @InjectModel(CouponCardObject)
    private couponCardRepository: typeof CouponCardObject,
    @InjectModel(UserObject)
    private userRepository: typeof UserObject,
  ) { }

  async create(createNeedyDto: CreateNeedyDto, user: UserPayload) {
    const _user = await this.userRepository.findByPk(user.id);

    if (_user.projectId != user.projectId) {
      throw new ForbiddenException(null, "אין ליוזר הרשאה לפרוייקט");
    }

    if (!_user.canCreate) {
      throw new ForbiddenException(null, "אין הרשאה להוסיף נתמכים, פנה למנהל המערכת");
    }

    if (createNeedyDto.type == NeedyType.Student) {
      createNeedyDto.recommendations = [{ sum: +process.env.STUDENT_BASE_SUPPORT } as SupportRecommendation]
    }

    if (createNeedyDto.type == NeedyType.Young) {
      createNeedyDto.recommendations = [{ sum: +process.env.YOUNG_BASE_SUPPORT } as SupportRecommendation]
    }

    createNeedyDto.newDocs = 0;
    createNeedyDto.recommendations = createNeedyDto.recommendations.map(r => ({
      recommendDate: new Date(),
      recommenderId: _user.id,
      recommenderType: _user.role,
      sum: r.sum,
      projectId: _user.projectId,
    }));

    const lastYearNeedy = await this.needyRepository.findOne({
      where: { ssn: createNeedyDto.ssn, projectId: +process.env.LAST_YEAR_PROJECT_ID },
      include: [{ model: SupportRecommendationObject, as: "recommendations", where: { recommenderType: UserRole.manager } }]
    });

    let lastYearStatus = 0;

    if (lastYearNeedy) {
      if (lastYearNeedy.recommendations.length && lastYearNeedy.recommendations.sort((a, b) => a.recommendDate > b.recommendDate ? -1 : 1)[0].sum > 0) {
        lastYearStatus = 1;
      } else {
        lastYearStatus = -1;
      }
    }

    return await this.needyRepository.create({ ...createNeedyDto, lastYearStatus }, {
      include: [
        { model: SupportRecommendationObject, as: "recommendations" },
        { model: DocumentObject, as: "documents" },
        { model: StudentObject, as: "student", include: [{ model: StudentChildObject, as: "studentChildren" }] },
      ],
    });
  }

  async update(id: number, updateDedicationDto: UpdateNeedyDto, user: UserPayload) {
    await this.validateNeedyUpdating(id, user);
    return await this.needyRepository.update(updateDedicationDto, { where: { id } });
  }

  async findAllWithLastStatuses(projectId: number, user: UserPayload) {
    const whereClause: any = { projectId };

    if (user.role[0] != UserRole.manager && user.projectId != projectId) {
      throw new ForbiddenException(null, "אין ליוזר הרשאה לפרוייקט");
    }

    if (user.role[0] == UserRole.coordinator) {
      whereClause.creatorId = user.id;
    }

    const needies = await this.needyRepository.findAll({
      where: whereClause,
      include: [
        { model: UserObject, as: "creator", attributes: ["id", "firstName", "lastName"] },
        { model: StudentObject, as: "student", attributes: ["ssnWife"] }
      ]
    });

    const srs = await this.supportRecommendationRepository.findAll({ where: { needyId: needies.map(n => n.id) } })

    const srsGrouped: Record<string, SupportRecommendation[]> = srs.reduce((d, sr) => {
      if (d[sr.needyId]) {
        d[sr.needyId].push(sr);
      } else {
        d[sr.needyId] = [sr];
      }

      return d;
    }, {});


    const payments = await this.paymentRepository.findAll({
      where: { needyId: needies.map(n => n.id) },
      include: [{ model: CouponCardObject, as: "card" }]
    })

    const paymentsGrouped: Record<string, Payment[]> = payments.reduce((d, sr) => {
      if (d[sr.needyId]) {
        d[sr.needyId].push(sr);
      } else {
        d[sr.needyId] = [sr];
      }

      return d;
    }, {});

    const result = needies.map(n => {
      const lastRec = srsGrouped[n.id] ? srsGrouped[n.id].sort((a, b) => isBefore(new Date(a.recommendDate), new Date(b.recommendDate)) ? 1 : -1)[0] : [];

      return {
        ...n["dataValues"],
        recommendations: [lastRec],
        payments: paymentsGrouped[n.id]
      }
    })

    return result;
  }

  async findOne(id: number, user: UserPayload) {
    await this.validateNeedyUpdating(id, user);
    const includeClause: any[] = [{ model: StudentObject, as: "student", include: [{ model: StudentChildObject, as: "studentChildren" }] }];

    if (user.role.includes(UserRole.manager)) {
      includeClause.push(
        { model: DocumentObject, as: "documents", attributes: ["id", "fileName", "createdAt"] },
        {
          model: PaymentObject, as: "payments", include: [
            { model: UserObject, as: "userEnter", attributes: ["id", "firstName", "lastName"] },
            { model: CouponCardObject, as: "card" },
          ]
        },
        {
          model: SupportRecommendationObject, as: "recommendations", include: [
            { model: UserObject, as: "recommender", attributes: ["id", "firstName", "lastName"] }
          ]
        }
      )
    }

    return await this.needyRepository.findByPk(id, { include: includeClause });
  }

  async getAvrechRequestStatus(getAvrechRequestStatus: GetAvrechRequestStatusDto) {
    const needy = await this.needyRepository.findOne({
      where: { id: getAvrechRequestStatus.needyId },
      include: [
        {
          model: SupportRecommendationObject, as: "recommendations"
        },
        { model: PaymentObject, as: "payments" }
      ]
    });

    if (!needy || needy.ssn != getAvrechRequestStatus.ssn) {
      throw new BadRequestException(null, "מספר זהות לא תואם");
    }

    const managerRecommendations = needy.recommendations
      .filter(r => r.recommenderType == UserRole.manager)
      .sort((a, b) => isBefore(new Date(a.recommendDate), new Date(b.recommendDate)) ? 1 : -1);

    let response: string;

    // temp for 2024 issue
    if (needy.type == NeedyType.Young && !needy.email) {
      response = "יש להשלים כתובת אימייל בתיבת 'השלמת כתובת אימייל לבחורי ישיבות'";
    } else
      if (needy.newDocs > 0 && needy.messages) {
        needy.messages = needy.messages + ". [התקבלו " + needy.newDocs + " מסמכים הממתינים לאישור]";
      }
    // -------------------
    if (needy.payments.length) {
      response = "הבקשה אושרה והתשלום הועבר";
    } else if (!managerRecommendations.length) {
      if (needy.messages) {
        response = needy.messages;
      } else {
        response = "הבקשה נקלטה וממתינה לאישור";
      }
    } else if (managerRecommendations[0].sum == 0) {
      response = "הבקשה נדחתה";
    } else if (needy.messages) {
      response = needy.messages;
    } else {
      response = "הבקשה אושרה וממתינה לתשלום";
    }

    return { response };
  }

  async avrechUpdateEmail(updateEmailRequestDto: UpdateEmailRequestDto) {
    const needy = await this.needyRepository.findOne({
      where: { id: updateEmailRequestDto.needyId, ssn: updateEmailRequestDto.ssn },
    });

    if (!needy) {
      throw new BadRequestException(null, "מספר זהות או מספר טופס לא תואם");
    }

    if (needy.email) {
      throw new BadRequestException(null, "מייל כבר קיים במערכת");
    }

    await needy.update({ email: updateEmailRequestDto.email });

    return { status: "success" };
  }

  async avrechUpdateBankDetails(updateBankDetailsRequestDto: UpdateBankDetailsRequestDto) {
    const needy = await this.needyRepository.findOne({
      where: { id: updateBankDetailsRequestDto.needyId, ssn: updateBankDetailsRequestDto.ssn },
    });

    if (!needy) {
      throw new BadRequestException(null, "מספר זהות או מספר טופס לא תואם");
    }

    if (needy.bankNo) {
      throw new BadRequestException(null, "פרטי בנק כבר קיימים במערכת");
    }

    await needy.update({
      bankNo: updateBankDetailsRequestDto.bankNo,
      bankBranchNo: updateBankDetailsRequestDto.bankBranchNo,
      bankAccountNo: updateBankDetailsRequestDto.bankAccountNo,
    });

    return { status: "success" };
  }

  // TODO: update student children is not working
  async updateStudent(id: number, updateStudentDto: CreateStudentDto, user: UserPayload) {
    const student = await this.studentRepository.findByPk(id);
    await this.validateNeedyUpdating(student.needyId, user);
    const updatedStudent = await this.studentRepository.update(updateStudentDto, { where: { id } });

    if (updateStudentDto.studentChildren) {
      await this.studentChildRepository.destroy({ where: { studentId: id } });
      await this.studentChildRepository.bulkCreate(updateStudentDto.studentChildren.map(c => ({ studentId: id, ...c })));
    }

    return this.studentRepository.findByPk(id, { include: [{ model: StudentChildObject, as: "studentChildren" }] });
  }

  async remove(id: number, user: UserPayload) {
    await this.validateNeedyUpdating(id, user);

    return await this.needyRepository.destroy({ where: { id } });
  }

  async isDuplicateSSN(query: { ssn: string, projectId: number }) {
    if (!query.ssn || !validateSSN(query.ssn, true)) {
      throw new BadRequestException(null, "מספר זהות לא תקין");
    }

    if (typeof (query.projectId) != "number") {
      throw new BadRequestException();
    }

    const studentChildren = await this.studentChildRepository.findAll({ where: query, attributes: ["studentId"] });
    const needies = await this.needyRepository.findAll({ where: query, attributes: ["id"] });
    const students = await this.studentRepository.findAll({
      where: {
        [Op.or]: [
          {
            projectId: query.projectId,
            ssnWife: query.ssn
          },
          {
            projectId: query.projectId,
            id: { [Op.in]: studentChildren.map(s => s.studentId) }
          }
        ]

      },
      attributes: ["needyId"]
    });

    const res = [...needies.map(n => n.id), ...students.map(s => s.needyId)];
    return [...new Set(res.filter(r => !!r))];
  }

  //--- SupportRecommendation ---//
  async addSupportRecommendation(createSupportRecommendationDto: CreateSupportRecommendationDto, user: UserPayload) {
    if (!createSupportRecommendationDto.needyId) {
      throw new BadRequestException();
    }

    await this.validateNeedyUpdating(createSupportRecommendationDto.needyId, user);

    const newRecommendation: SupportRecommendation = {
      recommendDate: new Date(),
      recommenderId: user.id,
      recommenderType: user.role[0],
      sum: createSupportRecommendationDto.sum,
      needyId: createSupportRecommendationDto.needyId,
      projectId: user.projectId,
    }

    return await this.supportRecommendationRepository.create(newRecommendation);
  }

  async updateSupportRecommendation(id: number, updateSupportRecommendationDto: CreateSupportRecommendationDto, user: UserPayload) {
    if (!updateSupportRecommendationDto.needyId) {
      throw new BadRequestException();
    }

    await this.validateNeedyUpdating(updateSupportRecommendationDto.needyId, user);

    const supportRecommendation = await this.supportRecommendationRepository.findByPk(id);

    if (user.id != supportRecommendation.recommenderId) {
      throw new ForbiddenException();
    }

    return await supportRecommendation.update({ sum: updateSupportRecommendationDto.sum, recommendDate: new Date() });
  }

  // only manager - not needed project validation
  async deleteSupportRecommendation(id: number, user: UserPayload) {
    return await this.supportRecommendationRepository.destroy({ where: { id } });
  }

  //--- Payment ---//
  // only manager - not needed project validation
  async addPayment(createPaymentDto: CreatePaymentDto, user: UserPayload) {
    const allRecommendations = await this.supportRecommendationRepository.findAll({
      where: { needyId: createPaymentDto.needyId }
    })

    if (!allRecommendations.find(r => r.recommenderType == UserRole.manager)) {
      throw new ForbiddenException(null, "לא ניתן להוסיף תשלום לפני אישור מנהל");
    }

    let card;

    if (createPaymentDto.type == PaymentMethod.Card) {
      card = await this.couponCardRepository.findOne({
        where: {
          cardId: createPaymentDto.cardId,
          projectId: createPaymentDto.projectId
        }
      });

      if (!card) {
        throw new ForbiddenException(null, "כרטיס לא מזוהה במערכת");
      }

      if (card.paymentId) {
        throw new ForbiddenException(null, "הכרטיס כבר היה בשימוש");
      }
    }

    const payment = await this.paymentRepository.create({ ...createPaymentDto, userEnterId: user.id });

    if (createPaymentDto.type == PaymentMethod.Card) {
      await card.update({ paymentId: payment.id })
    }

    return payment;
  }

  // only manager - not needed project validation
  async deletePayment(id: number) {
    const payment = await this.paymentRepository.findByPk(id, {
      include: [
        { model: CouponCardObject, as: "card" },
      ]
    })

    if (!payment) {
      throw new NotFoundException()
    }

    if (payment.card) {
      await payment.card.update({ paymentId: null })
    }

    return await payment.destroy();
  }

  // only manager - not needed project validation
  async getPaymentsByNeedyIds(needyIds: number[] | string[]) {
    return await this.paymentRepository.findAll({
      where: { needyId: needyIds },
      include: [
        { model: CouponCardObject, as: "card" },
      ]
    });
  }

  //--- Document ---//
  async addDocument(createDocumentDto: CreateDocumentDto, file: Express.Multer.File, user: UserPayload, isAvrech: boolean = false) {
    const _user = await this.userRepository.findByPk(user.id);

    if (!_user.canCreate) {
      throw new ForbiddenException(null, "אין הרשאה להוסיף קבצים, פנה למנהל המערכת");
    }

    if (!isAvrech) {
      await this.validateNeedyUpdating(createDocumentDto.needyId, user);
    } else if (createDocumentDto.ssn) {
      const needy = await this.needyRepository.findOne({ where: { id: +createDocumentDto.needyId } });

      if (!needy || needy.ssn != createDocumentDto.ssn) {
        throw new BadRequestException("פרטים לא נמצאו");
      }
    }

    const result = await cloudinary.v2.uploader.upload(file.path, { folder: process.env.NODE_ENV, access_mode: "authenticated", type: "private", sign_url: true });

    const doc = await this.documentRepository.create({
      needyId: +createDocumentDto.needyId,
      projectId: +createDocumentDto.projectId,
      fileName: createDocumentDto.fileName,
      doc: result.secure_url
    });

    if (createDocumentDto.paymentId) {
      this.paymentRepository.update({ receiverSignatureDocId: doc.id }, { where: { id: +createDocumentDto.paymentId } })
    }

    this.needyRepository.increment({ newDocs: 1 }, { where: { id: +createDocumentDto.needyId } })
    return true;
  }

  // only manager - not needed project validation
  async getDocument(id: number): Promise<ReadStream> {
    const file = await this.documentRepository.findByPk(id);
    const fileSuffix = file.doc.split(".").pop();
    file.fileName = file.fileName.slice(0, 10) + "." + fileSuffix;
    const filePath = "./uploads/" + file.fileName;

    try {
      await downloadFile(file.doc, filePath);
    } catch (err) {
      throw new NotFoundException();
    }

    return createReadStream(filePath);
  }

  // only manager - not needed project validation
  async getDocumentName(id: number): Promise<DocumentObject> {
    return await this.documentRepository.findByPk(id, { attributes: ["id", "fileName"] });
  }

  // only manager - not needed project validation
  async deleteDocument(id: number) {
    return await this.documentRepository.destroy({ where: { id } });
  }

  //--- Helpers ---/
  private validateNeedyUpdating = async (needyId: number, user: UserPayload) => {
    if (user.role[0] != UserRole.manager) {
      const needy = await this.needyRepository.findByPk(needyId);

      if (user.projectId != needy.projectId) {
        throw new ForbiddenException(null, "ליוזר אין הרשאה לפרוייקט זה");
      }

      if (user.role[0] == UserRole.coordinator && user.id != needy.creatorId) {
        throw new ForbiddenException(null, "ליוזר אין הרשאה לעדכן נתמך זה");
      }

      const allRecommendations = await this.supportRecommendationRepository.findAll({
        where: { needyId }
      })

      if (!isUpdatingRecommendationAllowed(allRecommendations, user.role[0])) {
        throw new ForbiddenException(null, "לא ניתן לעדכן תשלום לפני אישור מנהל או אחרי אישור תשלום");
      }
    }
  }
}
