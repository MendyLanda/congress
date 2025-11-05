import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from "ng-recaptcha";


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { NeediesPageComponent } from './components/needies-page/needies-page.component';
import { NeediesTableComponent } from './components/needies-table/needies-table.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


import { AddNeedyFormComponent } from './components/dialogs/add-needy-form/add-needy-form.component';
import { PaginatorDescHe } from './components/needies-table/paginator-desc-he';
import { SupportRecommendationComponent } from './components/dialogs/support-recommendation/support-recommendation.component';
import { FullNeedyDetailsComponent } from './components/full-needy-details/full-needy-details.component';
import { ElementRefDirective } from './directives/element-ref.directive';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { AddPaymentFormComponent } from './components/dialogs/add-payment-form/add-payment-form.component';
import { DownloadDirective } from './directives/download.directive';
import { ClickStopPropagation } from './directives/click-stop-propagation.directive';
import { UpdateStudentDetailsComponent } from './components/dialogs/update-student-details/update-student-details.component';
import { AddUserFromComponent } from './components/dialogs/add-user-from/add-user-from.component';
import { UsersPageComponent } from './components/users-page/users-page.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { ToastrModule } from 'ngx-toastr';
import { Interceptor } from './services/interceptor';
import { LoaderComponent } from './components/loader/loader.component';
import { AddFileComponent } from './components/dialogs/add-file/add-file.component';
import { environment } from 'src/environments/environment';
import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
import { PaymentsPageComponent } from './components/payments-page/payments-page.component';
import { DatePipe } from '@angular/common';
import { ProjectSelectorComponent } from './components/project-selector/project-selector.component';
import { StudentFormPageComponent } from './components/student-form-page/student-form-page.component';
import { CheckNeedyStatusRequestFormComponent } from './components/dialogs/check-needy-request-status/check-needy-request-status.component';
import { UploadFilesStudentComponent } from './components/dialogs/upload-files-student/upload-files-student.component';
import { UpdateEmailComponent } from './components/dialogs/update-email/update-email.component';
import { UpdateBankDetailsComponent } from './components/dialogs/update-bank-details/update-bank-details.component';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NeediesPageComponent,
    NeediesTableComponent,
    AddNeedyFormComponent,
    SupportRecommendationComponent,
    FullNeedyDetailsComponent,
    ElementRefDirective,
    DownloadDirective,
    ClickStopPropagation,
    LoginComponent,
    AddPaymentFormComponent,
    UpdateStudentDetailsComponent,
    AddUserFromComponent,
    UsersPageComponent,
    UsersTableComponent,
    LoaderComponent,
    AddFileComponent,
    PaymentsTableComponent,
    PaymentsPageComponent,
    ProjectSelectorComponent,
    StudentFormPageComponent,
    CheckNeedyStatusRequestFormComponent,
    UploadFilesStudentComponent,
    UpdateEmailComponent,
    UpdateBankDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialFileInputModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    RecaptchaV3Module,

    MatDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: MatPaginatorIntl, useClass: PaginatorDescHe },
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
    CookieService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
