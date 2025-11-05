import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileValidator } from 'ngx-material-file-input';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { fileExtensionValidator } from 'src/app/utils/file-extension.validator';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { GetAvrechRequestStatus } from '../../../../../../shared/interfaces/get-avrech-request-status.interface';

@Component({
  selector: 'app-upload-files-student',
  templateUrl: './upload-files-student.component.html',
  styleUrls: ['./upload-files-student.component.scss']
})
export class UploadFilesStudentComponent implements OnInit, OnDestroy {
  public requestBody: GetAvrechRequestStatus | undefined;
  public ssn: string = "";
  public needyId: number = 0;
  public uploadFileFrom: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<UploadFilesStudentComponent>,
    public apiService: ApiService,
    public userInfoService: UserInfoService,
    @Inject(MAT_DIALOG_DATA) public data: { withFiles: boolean },
  ) { 
    this.uploadFileFrom = new FormGroup({
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "needyId": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "document": new FormControl('', [Validators.required, FileValidator.maxContentSize(521549 * 4), fileExtensionValidator]),
      "statement1": new FormControl(false, [Validators.requiredTrue]),
      "statement2": new FormControl(false, [Validators.requiredTrue]),
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSubmit() {
    if (this.uploadFileFrom.valid) {
      this.dialogRef.close(this.uploadFileFrom.value);
    }
  }
  
  get CSsn(): AbstractControl {
    return this.uploadFileFrom.controls["ssn"];
  }

  get CNeedyId(): AbstractControl {
    return this.uploadFileFrom.controls["needyId"];
  }

  get CDocument(): AbstractControl {
    return this.uploadFileFrom.controls["document"];
  }

  get CStatement1(): AbstractControl {
    return this.uploadFileFrom.controls["statement1"];
  }

  get CStatement2(): AbstractControl {
    return this.uploadFileFrom.controls["statement2"];
  }
}
