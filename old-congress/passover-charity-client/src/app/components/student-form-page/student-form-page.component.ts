import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { ApiService } from 'src/app/services/api.service';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { AddNeedyFormComponent } from '../dialogs/add-needy-form/add-needy-form.component';
import { GetAvrechRequestStatus } from '../../../../../shared/interfaces/get-avrech-request-status.interface';
import { UpdateEmailRequest } from '../../../../../shared/interfaces/update-email-request.interface';
import { UpdateBankDetailsRequest } from '../../../../../shared/interfaces/update-bank-details-request.interface';
import { UploadFilesStudent } from '../../../../../shared/interfaces/upload-file-student.interface';
import { CheckNeedyStatusRequestFormComponent } from '../dialogs/check-needy-request-status/check-needy-request-status.component';
import { UploadFilesStudentComponent } from '../dialogs/upload-files-student/upload-files-student.component';
import { FormSpecialTypes } from 'src/app/enums/form-special-types.enum';
import { UpdateEmailComponent } from '../dialogs/update-email/update-email.component';
import { UpdateBankDetailsComponent } from '../dialogs/update-bank-details/update-bank-details.component';

@Component({
  selector: 'app-student-form-page',
  templateUrl: './student-form-page.component.html',
  styleUrls: ['./student-form-page.component.scss']
})
export class StudentFormPageComponent implements OnInit {
  projectId: number | undefined;
  isRegistryOpenToRabbi: boolean = false;
  isRegistryOpenToAvrech: boolean = false;
  isRegistryOpenToYoung: boolean = false;
  isCompleteDocsOpen: boolean = true;
  readonly FormSpecialTypes = FormSpecialTypes;

  constructor(
    public dialog: MatDialog,
    private needyDataService: NeedyDataServiceService,
    private apiService: ApiService,
    private toastyService: ToastyService,
    public projectService: ProjectService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { }

  ngOnInit(): void {
  }

  addForm = (registrationMode: FormSpecialTypes) => {
    const dialogRef = this.dialog.open(AddNeedyFormComponent, {
      data: { special: registrationMode },
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async needyElement => {
      if (!needyElement) {
        return;
      }

      this.useReCaptchaV3("newAvrech", this.createAvrech, [needyElement]);
    });
  }

  createAvrech = async (recaptchaToken: string, needyElement: any) => {
    const newNeedy = await this.needyDataService.createNeedyForm(needyElement, true);
    this.toastyService.warning("נא להשאיר את הדף פתוח עד לקבלת אישור");

    this.apiService.createAvrech(newNeedy, recaptchaToken).subscribe(res => {
      this.toastyService.success("הרשומה נוספה בהצלחה");

      //TODO: auth for uplaod documents
      if (needyElement.confirmationDocument?._files?.[0]) {
        this.useReCaptchaV3("confirmationDocument", this.uploadConfirmationDocument, [needyElement, res.id, newNeedy.projectId]);
      }

      if (needyElement.ssnDocument?._files?.[0]) {
        this.useReCaptchaV3("ssnDocument", this.uploadSsnDocument, [needyElement, res.id, newNeedy.projectId]);
      }

      if (needyElement.exceptionsCommittee?._files?.[0]) {
        this.useReCaptchaV3("exceptionsCommittee", this.uploadExceptionsCommittee, [needyElement, res.id, newNeedy.projectId]);
      }

      alert(`${res.id} הוא מספר הבקשה שלך, יש לשמור אותו כדי לבדוק את הסטטוס בעתיד`)
    })
  }

  uploadConfirmationDocument = (recaptchaToken: string, needyElement: any, needyId: number, projectId: number) => {
    this.apiService.addDocumentAvrech(recaptchaToken, needyElement.confirmationDocument._files[0], needyId, projectId).subscribe({
      next: () => {
        this.toastyService.success("אישור נוסף בהצלחה");
      },
      error: () => {
        this.toastyService.error("לא הצלחנו לשמור את האישור, יש לשלוח אותו בנפרד");
      }
    })
  }

  uploadExceptionsCommittee = (recaptchaToken: string, needyElement: any, needyId: number, projectId: number) => {
    this.apiService.addDocumentAvrech(recaptchaToken, needyElement.exceptionsCommittee._files[0], needyId, projectId).subscribe({
      next: () => {
        this.toastyService.success("אישור ועדת חריגים נוסף בהצלחה");
      },
      error: () => {
        this.toastyService.error("לא הצלחנו לשמור את אישור ועדת חריגים, יש לשלוח אותו בנפרד");
      }
    })
  }

  uploadSsnDocument = (recaptchaToken: string, needyElement: any, needyId: number, projectId: number) => {
    this.apiService.addDocumentAvrech(recaptchaToken, needyElement.ssnDocument._files[0], needyId, projectId).subscribe({
      next: () => {
        this.toastyService.success("ספח תעודת זהות נוסף בהצלחה");
      },
      error: () => {
        this.toastyService.error("לא הצלחנו לשמור את ספח תעודת הזהות, יש לשלוח אותו בנפרד'");
      }
    })
  }


  useReCaptchaV3 = (recaptchaKey: string, callback: Function, callbackArgs: any[]) => {
    this.recaptchaV3Service.execute(recaptchaKey).subscribe({
      next: async (token: string) => {
        await callback(token, ...callbackArgs);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  checkStatus() {
    const dialogRef = this.dialog.open(CheckNeedyStatusRequestFormComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async getStatusElement => {
      if (!getStatusElement) {
        return;
      }

      this.useReCaptchaV3("checkStatus", this._checkStatus, [getStatusElement]);
    });
  }

  _checkStatus = (recaptchaToken: string, getStatusElement: GetAvrechRequestStatus) => {
    this.apiService.checkNeedyStatusRequest(recaptchaToken, { needyId: +getStatusElement.needyId, ssn: getStatusElement.ssn }).subscribe({
      next: (res) => {
        this.toastyService.success(res.response);
        alert(res.response);
      },
      error: () => {
        this.toastyService.error("תקלה בעת בדיקת הסטטוס, יש לנסות שוב מאוחר יותר");
      }
    })
  }

  uploadFiles() {
    const dialogRef = this.dialog.open(UploadFilesStudentComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async getStatusElement => {
      if (!getStatusElement) {
        return;
      }

      this.useReCaptchaV3("uploadFileStudent", this.uploadFileStudent, [getStatusElement]);
    });
  }

  uploadFileStudent = (recaptchaToken: string, getStatusElement: UploadFilesStudent) => {
    this.apiService.addDocumentAvrech(recaptchaToken, getStatusElement.document._files[0], getStatusElement.needyId, 26, undefined, getStatusElement.ssn, getStatusElement.fileName).subscribe({
      next: (res) => {
        this.toastyService.success("המסמך נשלח ומחכה לאישור");
      },
      error: () => {
        this.toastyService.error("תקלה בעת העלאת המסמך, יש לנסות שוב מאוחר יותר");
      }
    })
  }

  updateEmail() {
    const dialogRef = this.dialog.open(UpdateEmailComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async updateEmailForm => {
      if (!updateEmailForm) {
        return;
      }

      this.useReCaptchaV3("updateEmail", this.updateEmailRequest, [updateEmailForm]);
    });
  }

  updateEmailRequest = (recaptchaToken: string, updateEmailForm: UpdateEmailRequest) => {
    this.apiService.updateEmail(recaptchaToken, { ...updateEmailForm, needyId: +updateEmailForm.needyId }).subscribe({
      next: () => {
        this.toastyService.success("כתובת האימייל עודכנה בהצלחה");
      },
      error: () => {
        this.toastyService.error("תקלה בעת העדכון, יש לנסות שוב מאוחר יותר");
      }
    })
  }


  updateBankDetails() {
    const dialogRef = this.dialog.open(UpdateBankDetailsComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async updateBankDetailsForm => {
      if (!updateBankDetailsForm) {
        return;
      }

      const bankFileForm: UploadFilesStudent = {
        needyId: +updateBankDetailsForm.needyId,
        ssn: updateBankDetailsForm.ssn,
        document: updateBankDetailsForm.document,
        fileName: "אישור ניהול חשבון בנק"
      }

      this.useReCaptchaV3("uploadFileStudent", this.uploadFileStudent, [bankFileForm]);
      this.useReCaptchaV3("updateEmail", this.updateBankDetailsRequest, [updateBankDetailsForm]);
      setTimeout(() => alert("נא להמתין מספר שניות עד לקבלת הודעה שהפרטים נקלטו שהצלחה"), 300)
    });
  }

  updateBankDetailsRequest = (recaptchaToken: string, updateBankDetailsRequest: UpdateBankDetailsRequest) => {
    this.apiService.updateBankDetails(recaptchaToken, { ...updateBankDetailsRequest, needyId: +updateBankDetailsRequest.needyId }).subscribe({
      next: () => {
        this.toastyService.success("פרטי חשבון הבנק עודכנו בהצלחה");
      },
      error: () => {
        this.toastyService.error("תקלה בעת העדכון, יש לנסות שוב מאוחר יותר");
      }
    })
  }

  getCloseTypes() {
    const closeTypes = [];
    const typesAmount = 3;

    if (!this.isRegistryOpenToAvrech) {
      closeTypes.push("אברכים");
    }

    if (!this.isRegistryOpenToRabbi) {
      closeTypes.push("גבאים ורבני קהילות");
    }

    if (!this.isRegistryOpenToYoung) {
      closeTypes.push("בחורי ישיבה");
    }

    if (closeTypes.length === typesAmount) {
      return "";
    } else {
      return `ל${closeTypes.join(", ")}`;
    }

  }

}
