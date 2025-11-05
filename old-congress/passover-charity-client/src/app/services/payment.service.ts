import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { TableFilterType } from '../enums/table-filter-type.enum';
import { PaymentElement } from '../interfaces/payment-element.interface';
import { TableColumnHeader } from '../interfaces/table-column-header.interface';
import { ApiService } from './api.service';
import { ExcelService } from './excel.service';
import { ProjectService } from './project.service';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  _tableData$: BehaviorSubject<{ columns: TableColumnHeader<PaymentElement>[], data: PaymentElement[] }> = new BehaviorSubject({ columns: [] as any[], data: [] as any[] });
  projectId: number | undefined;

  get tableData$() {
    return this._tableData$.asObservable();
  }
  constructor(
    private apiService: ApiService,
    private projectService: ProjectService,
    private excelService: ExcelService,
    private datePipe: DatePipe
  ) {
    this.projectService.$project.subscribe(projectId => {
      this.projectId = projectId;
      this.updateTableData();
    });
  }

  updateTableData = (): void => {
    this.apiService.allPayments(this.projectId!).pipe(map(payments => {
      const elements: PaymentElement[] = payments.map(p => ({
        id: p.id!,
        type: p.type,
        amount: p.amount,
        cardId: p.card?.id || 0,
        cardSerialNumber: p.card?.serialNumber || "",
        needyLastName: p.needy?.lastName || "",
        needyFirstName: p.needy?.firstName || "",
        needySsn: p.needy?.ssn || "",
        needyCity: p.needy?.city || "",
        coordinatorName: `${p.userEnter?.firstName || ""} ${p.userEnter?.lastName || ""} | ${p.userEnter?.id || ""}`,
        date: this.datePipe.transform(p.date, "dd/MM/yyyy") || "",
      }));

      return elements;

    })).subscribe(elements => this._tableData$.next({ columns: COLUMNS, data: elements }))
  }

  exportData = (data: PaymentElement[]) => {
    const toJson: any[] = data.reduce((json, element) => {
      json.push({
        "סוג תשלום": element.type,
        "סכום": element.amount,
        "מספר כרטיס רץ": element.cardId,
        "מספר כרטיס": element.cardSerialNumber,
        "שם משפחה": element.needyLastName,
        "שם פרטי": element.needyFirstName,
        "מספר זהות": element.needySsn,
        "עיר": element.needyCity,
        "מזין בקשה": element.coordinatorName,
        "תאריך": element.date,
      })
      return json;
    }, [] as any[])
    
    this.excelService.exportAsExcelFile(toJson, 'רשימת תשלומים');
  }
}

const COLUMNS: TableColumnHeader<PaymentElement>[] = [
  { displayName: "סוג תשלום", key: 'type', filterType: TableFilterType.options },
  { displayName: "סכום", key: 'amount', filterType: TableFilterType.options },
  { displayName: "מספר כרטיס רץ", key: 'cardId', filterType: TableFilterType.freeText },
  { displayName: "מספר כרטיס", key: 'cardSerialNumber', filterType: TableFilterType.freeText },
  { displayName: "שם משפחה", key: 'needyLastName', filterType: TableFilterType.freeText },
  { displayName: "שם פרטי", key: 'needyFirstName', filterType: TableFilterType.freeText },
  { displayName: "מספר זהות", key: 'needySsn', filterType: TableFilterType.freeText },
  { displayName: "עיר", key: 'needyCity', filterType: TableFilterType.freeText },
  { displayName: "מזין בקשה", key: 'coordinatorName', filterType: TableFilterType.freeText },
  { displayName: "תאריך", key: 'date', filterType: TableFilterType.freeText },
];
