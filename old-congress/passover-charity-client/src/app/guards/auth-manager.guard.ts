import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { AuthService } from '../services/auth.service';
import { UserInfoService } from '../services/user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AuthManagerGuard implements CanActivate {
  
  constructor(
    private userInfoService: UserInfoService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userInfoService.$userInfo.pipe(map(userInfo => {
      return userInfo?.role == UserRole.manager;
    }));
  }
  
}
