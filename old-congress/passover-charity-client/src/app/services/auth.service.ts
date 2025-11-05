import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, map, Observable, share } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _$isLogin: BehaviorSubject<boolean>;

  get $checkIfLogin(): Observable<boolean> {
    return this._checkIsLogin();
  }
  
  get $isLogin(): Observable<boolean> {   
    return this._$isLogin.asObservable();
  }

  get isLoginSync() {
    return this._$isLogin.value;
  }

  constructor(
    private apiService: ApiService,
    private cookieService: CookieService,
    private router: Router,
    private userInfoService: UserInfoService
  ) {
    this._$isLogin = new BehaviorSubject<boolean>(false);
  }

  login(username: string, password: string) {
    this.apiService.login(username, password).subscribe((res: any) => {
      this.cookieService.set(environment.cookies.authToken.title, res.access_token);
      this.updateUserInfo(res);
      this._$isLogin.next(true);
      this.router.navigate(['']);
    }, (err: any) => {
      this._$isLogin.next(false);
      if (err.status == 401) {
        alert('שם משתמש או סיסמה שגויים');
      } else {
        alert('בעיית שרת, נא לנסות שוב');
      }
      this.router.navigate(['login']);
    })
  }

  logout() {
    this.cookieService.delete(environment.cookies.authToken.title);
    location.reload();
  }

  private _checkIsLogin() {
    const obs = this.apiService.checkLogin().pipe(share());
    obs.subscribe(id => {
      this._$isLogin.next(true);
      this.apiService.getUserById(id).subscribe(this.updateUserInfo)
    }, err => {
      this._$isLogin.next(false);
      this.router.navigate(['login']);
    })

    return obs.pipe(map(res => res ? true : false));
  }

  updateUserInfo = (res: any) => {
    this.userInfoService.updateUserInfo({
      userId: res.id,
      username: res.username,
      firstName: res.firstName,
      lastName: res.lastName,
      phone: res.phone,
      role: res.role,
      coordinator: res.coordinator,
      canCreate: res.canCreate,
      projectId: res.projectId
    })
  }
}
