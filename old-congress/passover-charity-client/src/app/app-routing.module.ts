import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NeediesPageComponent } from './components/needies-page/needies-page.component';
import { PaymentsPageComponent } from './components/payments-page/payments-page.component';
import { StudentFormPageComponent } from './components/student-form-page/student-form-page.component';
import { UsersPageComponent } from './components/users-page/users-page.component';
import { AuthManagerGuard } from './guards/auth-manager.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'needies-page',
    component: NeediesPageComponent, pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: 'users-page',
    component: UsersPageComponent, pathMatch: 'full',
    canActivate: [AuthGuard, AuthManagerGuard]
  },
  {
    path: 'payment-page',
    component: PaymentsPageComponent, pathMatch: 'full',
    canActivate: [AuthGuard, AuthManagerGuard]
  },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'new-request', component: StudentFormPageComponent, pathMatch: 'full' },
  { path: '**', redirectTo: 'needies-page' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
