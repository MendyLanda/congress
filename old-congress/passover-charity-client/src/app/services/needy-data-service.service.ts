import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NeedyType } from '../../../../shared/enums/needy-type.enum';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { Needy } from '../../../../shared/interfaces/needy.interface';
import { Payment } from '../../../../shared/interfaces/payment.interface';
import { SupportRecommendation } from '../../../../shared/interfaces/support-recommendation.interface';
import { RequestStatus } from '../enums/request-status.enum';
import { TableFilterType } from '../enums/table-filter-type.enum';
import { NeedyElement } from '../interfaces/needy-element.interface';
import { NeedyForm } from '../interfaces/needy-form.interface';
import { TableColumnHeader } from '../interfaces/table-column-header.interface';
import { fileToBase64 } from '../utils/file-to-base64';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ExcelService } from './excel.service';
import { ProjectService } from './project.service';
import { UserInfoService } from './user-info.service';
import { LastYearStatus } from '../enums/last-year-status.enum';

@Injectable({
  providedIn: 'root'
})
export class NeedyDataServiceService {
  _tableData$: BehaviorSubject<{ columns: TableColumnHeader<NeedyElement>[], data: NeedyElement[] }> = new BehaviorSubject({ columns: [] as any[], data: [] as any[] });
  _tableFilters$: BehaviorSubject<Record<string, string>> = new BehaviorSubject({});
  projectId: number | undefined;

  get tableFilters$() {
    return this._tableFilters$.asObservable();
  }

  get tableData$() {
    return this._tableData$.asObservable();
  }

  constructor(
    private apiService: ApiService,
    private userInfoService: UserInfoService,
    private excelService: ExcelService,
    private projectService: ProjectService,
    private authService: AuthService,
  ) {
    this.projectService.$project.subscribe(projectId => {
      this.projectId = projectId;
      if (authService.isLoginSync) {
        this.updateTableData();
      }
    });
  }

  updateTableData = (): void => {
    this.apiService.findAllWithLastStatuses(this.projectId!).pipe(map(needies => {
      const elements: NeedyElement[] = needies.map(n => ({
        id: n.id,
        ssn: n.ssn,
        firstName: n.firstName,
        lastName: n.lastName,
        ssnWife: n.student?.ssnWife || "",
        phone: n.phone,
        mobilePhone: n.mobilePhone,
        email: n.email,
        maritalStatus: n.maritalStatus,
        numberOfPersons: n.numberOfPersons,
        address: n.address,
        city: n.city,
        needyType: n.type,
        supportAmount: n.recommendations[0].sum,
        lastRecommender: n.recommendations[0].recommenderType,
        creatorString: `${n.creator?.firstName} ${n.creator?.lastName} | ${n.creator?.id}`,
        payments: n.payments,
        action: null,
        projectId: n.projectId,
        newDocs: n.newDocs || 0,
        requestStatus: this.getRequestStatus(n),
        lastYearStatus: this.getLastYearStatus(n.lastYearStatus),
        bankNo: n.bankNo,
        bankBranchNo: n.bankBranchNo,
        bankAccountNo: n.bankAccountNo,
        isBankAccountExist: n.bankAccountNo && n.bankBranchNo && n.bankNo ? "כן" : "לא",
      }));

      return elements;

    })).subscribe(elements => this._tableData$.next({ columns: COLUMNS, data: elements }))
  }

  async createNeedyForm(needyElement: NeedyForm, isAvrech: boolean = false): Promise<Needy> {
    const recommendationSum = needyElement.localCommunityRecommendationSum || needyElement.welfareDepartmentRecommendationSum || environment.studentSupportAmount;

    const type = needyElement.needyType;
    const newNeedy: Needy = {
      type,
      ssn: this.fixSSN(needyElement.ssn),
      address: needyElement.address,
      city: needyElement.city,
      firstName: needyElement.firstName,
      lastName: needyElement.lastName,
      phone: needyElement.phone,
      creatorId: isAvrech ? 1 : this.userInfoService.userInfo!.userId,
      organizationId: isAvrech ? undefined : this.userInfoService.userInfo?.coordinator?.organizationId,
      description: needyElement.description,
      numberOfPersons: +needyElement.numberOfPersons!,
      maritalStatus: needyElement.maritalStatus,
      mobilePhone: needyElement.mobilePhone,
      email: needyElement.email,
      projectId: isAvrech ? 3 : needyElement.projectId,
      recommendations: [
        {
          recommendDate: new Date(),
          sum: +recommendationSum,
          projectId: isAvrech ? 3 : needyElement.projectId,
        } as SupportRecommendation
      ],
      documents: []
    }

    if (type == NeedyType.Student || type == NeedyType.Rabbi || type == NeedyType.Young || type == NeedyType.Needy || type == NeedyType.Welfare) {
      newNeedy.student = {
        firstNameWife: needyElement.firstNameWife!,
        lastNameWife: needyElement.lastNameWife!,
        ssnWife: this.fixSSN(needyElement.ssnWife!),
        studentChildren: needyElement.studentChildren?.map(sc => ({
          ...sc,
          ssn: this.fixSSN(sc.ssn),
          projectId: isAvrech ? 3 : needyElement.projectId,
        })),
        kollelName: needyElement.kollelName!,
        headOfTheKollelName: needyElement.headOfTheKollelName!,
        headOfTheKollelPhone: needyElement.headOfTheKollelPhone!,
        kollelType: needyElement.kollelType!,
        projectId: isAvrech ? 3 : needyElement.projectId,
      }
    }

    return newNeedy;
  }

  getFileName = (type: NeedyType) => {
    const dict = {
      [NeedyType.Needy]: "אישור וועדת רווחה ",
      [NeedyType.Welfare]: "אישור וועדת רווחה ",
      [NeedyType.BereavedFamily]: "אישור וועדת רווחה ",
      [NeedyType.Evacuee]: "אישור וועדת רווחה ",
      [NeedyType.Student]: "אישור לימודים בכולל",
      [NeedyType.Young]: "אישור לימודים בישיבה",
      [NeedyType.Rabbi]: "אישור רבנות מבית הכנסת",
      [NeedyType.Gabbai]: ""
    }

    return dict[type];
  }

  exportData = (data: NeedyElement[]) => {
    this.apiService.getPaymentsByNeedyIds(data.filter(d => d.id).map(d => d.id!))
      .subscribe(payments => {
        const paymentDictByNeedyId: Record<number, Payment[]> = payments
          .reduce((dict: Record<number, Payment[]>, payment) => {
            if (dict[payment.needyId]) {
              dict[payment.needyId].push(payment)
            } else {
              dict[payment.needyId] = [payment];
            }

            return dict;
          }, {});

        const toJson: any[] = data.reduce((json, element) => {
          json.push({
            "מזהה טופס": element.id,
            "מספר זהות": element.ssn,
            "שם משפחה": element.lastName,
            "שם פרטי": element.firstName,
            "טלפון": element.phone,
            "טלפון נוסף": element.mobilePhone,
            "אימייל": element.email,
            "כתובת": element.address,
            "עיר": element.city,
            "מספר נפשות": element.numberOfPersons,
            "מצב אישי": element.maritalStatus,
            "סוג תמיכה": element.needyType,
            "סכום תמיכה": element.supportAmount,
            "מזין הבקשה": element.creatorString,
            "מאשר אחרון": element.lastRecommender,
            "מספר בנק": element.bankNo,
            "סניף": element.bankBranchNo,
            "מספר חשבון": element.bankAccountNo,
            "מספר שובר / שיק": paymentDictByNeedyId[element.id!] ?
              paymentDictByNeedyId[element.id!].map(p => p.serialNumber).join(",") : "",
            "מספרי כרטיסים": paymentDictByNeedyId[element.id!] ?
              paymentDictByNeedyId[element.id!].map(p => p.card?.id).join(",") : "",
            "מספרים סידוריים של הכרטיסים": paymentDictByNeedyId[element.id!] ?
              paymentDictByNeedyId[element.id!].map(p => p.card?.serialNumber).join(",") : "",
          })
          return json;
        }, [] as any[])

        this.excelService.exportAsExcelFile(toJson, 'רשימת נתמכים');
      })
  }

  filterTable = (key: string, filterBy: string) => {
    this._tableFilters$.next({
      ...this._tableFilters$.value,
      [key]: filterBy
    })
  }

  resetFilters = () => {
    this._tableFilters$.next({});
  }

  fixSSN = (ssn: string) => {
    if (!ssn) return ssn;
    return ssn.padStart(9, '0');
  }

  addPaymentToNeedy = (payment: Payment) => {
    const elements = this._tableData$.value.data;

    const e = elements.find(e => e.id == payment.needyId);

    if (e) {
      e.payments ? e.payments.push(payment) : e.payments = [payment];

      this._tableData$.next({ columns: COLUMNS, data: elements });
    }
  }

  updateSupportRecommendation = (sr: SupportRecommendation, messages = "") => {
    const elements = this._tableData$.value.data;

    const e = elements.find(e => e.id == sr.needyId);

    if (e) {
      e.supportAmount = sr.sum;
      e.lastRecommender = sr.recommenderType;

      const mockNeedy: Needy = {
        recommendations: [{ recommenderType: sr.recommenderType, sum: sr.sum } as SupportRecommendation],
        payments: e.payments,
        messages: messages,
      } as Needy;

      e.requestStatus = this.getRequestStatus(mockNeedy);

      this._tableData$.next({ columns: COLUMNS, data: elements });
    }
  }

  resetNewDocs = (id: number) => {
    const elements = this._tableData$.value.data;

    const e = elements.find(e => e.id == id);

    if (e) {
      e.newDocs = 0;
      this._tableData$.next({ columns: COLUMNS, data: elements });
    }
  }


  getRequestStatus = (needy: Needy): RequestStatus => {
    const lastRecommender = needy.recommendations?.[0]?.recommenderType;
    let status: RequestStatus;


    if (lastRecommender != UserRole.manager) {
      status = RequestStatus.ToManager;
    } else if (!!needy.payments?.length) {
      if (needy.type == NeedyType.Student) {
        status = RequestStatus.Card;
      } else if (needy.type == NeedyType.Young) {
        status = RequestStatus.Coupon;
      } else {
        status = RequestStatus.Paid;
      }
    } else if (needy.recommendations?.[0]?.sum === 0) {
      status = RequestStatus.Rejected;
    } else if (needy.messages) {
      status = RequestStatus.Pending;
    } else {
      status = RequestStatus.Approved;
    }

    // temp for 2024 issue
    if (needy.type == NeedyType.Young && !needy.email) {
      status = RequestStatus.EmailMissing;
    }
    // -------------------

    return status;
  }

  getLastYearStatus = (status?: number): LastYearStatus => {
    switch (status) {
      case 0:
        return LastYearStatus.NotAvailable;
      case 1:
        return LastYearStatus.Approved;
      case -1:
        return LastYearStatus.Rejected;
      default:
        return LastYearStatus.NotAvailable;
    }
  }
}

const COLUMNS: TableColumnHeader<NeedyElement>[] = [
  { displayName: "מס'", key: 'id', filterType: TableFilterType.freeText },
  { displayName: "סטטוס שנה שעברה", key: 'lastYearStatus', filterType: TableFilterType.options },
  { displayName: "מספר זהות", key: 'ssn', filterType: TableFilterType.freeText },
  { displayName: "שם משפחה", key: 'lastName', filterType: TableFilterType.freeText },
  { displayName: "שם פרטי", key: 'firstName', filterType: TableFilterType.freeText },
  { displayName: "תז אישה", key: 'ssnWife', filterType: TableFilterType.freeText },
  { displayName: "טלפון", key: 'phone', filterType: TableFilterType.freeText },
  { displayName: "טלפון נוסף", key: 'mobilePhone', filterType: TableFilterType.freeText },
  { displayName: "כתובת", key: 'address', filterType: TableFilterType.freeText },
  { displayName: "עיר", key: 'city', filterType: TableFilterType.options },
  { displayName: "מספר נפשות", key: 'numberOfPersons', filterType: TableFilterType.options },
  { displayName: "מצב אישי", key: 'maritalStatus', filterType: TableFilterType.options },
  { displayName: "סוג תמיכה", key: 'needyType', filterType: TableFilterType.options },
  { displayName: "סכום תמיכה", key: 'supportAmount', filterType: TableFilterType.options },
  { displayName: "מזין הבקשה", key: 'creatorString', filterType: TableFilterType.options },
  { displayName: "מאשר אחרון", key: 'lastRecommender', filterType: TableFilterType.options },
  { displayName: "סטטוס בקשה", key: 'requestStatus', filterType: TableFilterType.options },
  { displayName: "מסמכים שהושלמו", key: 'newDocs', filterType: TableFilterType.options },
  { displayName: "חשבון בנק קיים", key: 'isBankAccountExist', filterType: TableFilterType.options }, // temp for 2025
  { displayName: "פעולות", key: 'action', filterType: null },
];