import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserInfo } from './interfaces/user-info.interface';
import { AuthService } from './services/auth.service';
import { UserInfoService } from './services/user-info.service';

interface Link {
  displayName: string;
  endpoint: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'passover-charity-client';

  links: Link[]  = [
    {
      displayName: "נתמכים",
      endpoint: "needies-page",
    },
    {
      displayName: "משתמשים",
      endpoint: "users-page",
    },
    {
      displayName: "תשלומים (בטא)",
      endpoint: "payment-page",
    }
  ];

  activeLink: Link = this.links[0];
  subscriptions: Subscription[] = [];
  userInfo: UserInfo | undefined;

  get isManager(){
    return this.userInfo?.role === UserRole.manager;
  } 

  constructor(
    private router: Router,
    public authService: AuthService,
    public userInfoService: UserInfoService,
  ) { }
 
  ngOnInit(): void {
    this.subscriptions.push(this.userInfoService.$userInfo.subscribe(u => this.userInfo = u))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goTo = (link: Link) => {
    this.activeLink = link;
    this.router.navigate([link.endpoint]);
  }


}
