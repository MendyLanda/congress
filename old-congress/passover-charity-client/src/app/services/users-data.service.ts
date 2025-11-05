import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { Coordinator } from '../../../../shared/interfaces/coordinator.interface';
import { User } from '../../../../shared/interfaces/user.interface';
import { TableFilterType } from '../enums/table-filter-type.enum';
import { TableColumnHeader } from '../interfaces/table-column-header.interface';
import { UserElement } from '../interfaces/user-element.interface';
import { ApiService } from './api.service';
import { ExcelService } from './excel.service';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class UsersDataService {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
  ) { }

  getUserTableData = (projectId: number): Observable<{ columns: UserTableColumn[], data: UserElement[] }> => {
    return this.apiService.getUsers(projectId).pipe(map(users => {
      const elements: UserElement[] = users.map(u => ({
        id: u.id,
        ssn: u.coordinator?.ssn,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        address: u.coordinator?.address,
        city: u.coordinator?.city,
        type: u.role,
        username: u.username,
        committeePersons: u.coordinator?.committeePersons?.map(cp => `${cp.name} - ${cp.phone}`).join(', ') || null,
        organizationName: u.coordinator?.organization?.name || null,
        organizationAddress: u.coordinator?.organization?.address || null,
        organizationCity: u.coordinator?.organization?.city || null,
        organizationType: u.coordinator?.organization?.type || null,
        organizationNo: u.coordinator?.organization?.organizationNo || null,
        isActive: u.isActive,
        canCreate: u.canCreate || 0,
      }));

      return { columns: COLUMNS, data: elements }
    }))
  }

  createUser = (userForm: any): Partial<User> => {
    const newUser: Partial<User> = {
      username: userForm.username,
      password: userForm.password,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      phone: userForm.phone,
      role: userForm.type,
      projectId: userForm.projectId,
    }

    if (newUser.role == UserRole.coordinator) {
      newUser.coordinator = {
        ssn: userForm.ssn,
        address: userForm.address,
        city: userForm.city,
        projectId: userForm.projectId,
        committeePersons: userForm.committeePersons,
        organization: {
          name: userForm.organizationName,
          address: userForm.organizationAddress,
          city: userForm.organizationCity,
          type: userForm.organizationType,
          organizationNo: userForm.organizationNo,
          projectId: userForm.projectId,
        }
      } as Coordinator
    }

    return newUser;
  }

  exportData = (data: UserElement[]) => {
    const toJson: any[] = data.reduce((json, element) => {
      json.push({
        "מזהה": element.id,
        "שם משתמש": element.username,
        "סוג משתמש": element.type,
        "שם משפחה": element.lastName,
        "שם פרטי": element.firstName,
        "טלפון": element.phone,
        "כתובת": element.address,
        "עיר": element.city,
        "מספר זהות": element.ssn,
        "שם ארגון": element.organizationName,
        "כתובת הארגון": element.organizationAddress,
        "עיר הארגון": element.organizationCity,
        "סוג ארגון": element.organizationType,
        "מספר ארגון": element.organizationNo,
        "חברי ועדה מקומית": element.committeePersons,
      })
      return json;
    }, [] as any[])

    this.excelService.exportAsExcelFile(toJson, 'רשימת רכזים');
  }
}

export type UserTableColumn = TableColumnHeader<UserElement> & { forActives: boolean }

const COLUMNS: UserTableColumn[] = [
  { displayName: "מזהה", key: 'id', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "שם משתמש", key: 'username', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "סוג משתמש", key: 'type', filterType: TableFilterType.options, forActives: true },
  { displayName: "שם משפחה", key: 'lastName', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "שם פרטי", key: 'firstName', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "טלפון", key: 'phone', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "כתובת", key: 'address', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "עיר", key: 'city', filterType: TableFilterType.options, forActives: true },
  { displayName: "מספר זהות", key: 'ssn', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "חברי ועדה מקומית", key: 'committeePersons', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "שם ארגון", key: 'organizationName', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "כתובת הארגון", key: 'organizationAddress', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "עיר הארגון", key: 'organizationCity', filterType: TableFilterType.options, forActives: true },
  { displayName: "סוג ארגון", key: 'organizationType', filterType: TableFilterType.options, forActives: true },
  { displayName: "מספר ארגון", key: 'organizationNo', filterType: TableFilterType.freeText, forActives: true },
  { displayName: "הוספת רשומות", key: 'canCreate', filterType: TableFilterType.options, forActives: true },
];