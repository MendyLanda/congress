import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { Needy } from '../../../../shared/interfaces/needy.interface';
import { NeedyElement } from '../interfaces/needy-element.interface';
import { UserInfo } from '../interfaces/user-info.interface';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private _$userInfo: BehaviorSubject<UserInfo | undefined> = new BehaviorSubject<UserInfo | undefined>(undefined);
  
  get $userInfo(): Observable<UserInfo | undefined> {
    return this._$userInfo.asObservable();
  }

  get userInfo(): UserInfo | undefined {
    return this._$userInfo.value;
  }

  constructor(
    private projectService: ProjectService,
  ) { }

  updateUserInfo(userInfo: UserInfo) {
    this._$userInfo.next(userInfo);
    if (userInfo.role !== UserRole.manager) {
      this.projectService.updateProject(userInfo.projectId);
    }
  }
}
