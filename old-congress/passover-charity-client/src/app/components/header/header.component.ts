import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/interfaces/user-info.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  userInfo: UserInfo | undefined;

  constructor(
    public authService: AuthService,
    public userInfoService: UserInfoService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.userInfoService.$userInfo.subscribe(user => this.userInfo = user))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getUserTitle = () => `${this.userInfo?.firstName} ${this.userInfo?.lastName}  |  ${this.userInfo?.role}`
}
