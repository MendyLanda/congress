import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NeedyTableActionType } from 'src/app/enums/needy-table-action-type.enum';
import { NeedyElement } from 'src/app/interfaces/needy-element.interface';
import { ApiService } from 'src/app/services/api.service';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { UserRole } from '../../../../../../shared/enums/user-role.enum';
import { GetAvrechRequestStatus } from '../../../../../../shared/interfaces/get-avrech-request-status.interface';

@Component({
  selector: 'app-check-needy-request-status',
  templateUrl: './check-needy-request-status.component.html',
  styleUrls: ['./check-needy-request-status.component.scss']
})
export class CheckNeedyStatusRequestFormComponent implements OnInit, OnDestroy {
  public requestBody: GetAvrechRequestStatus | undefined;
  public ssn: string = "";
  public needyId: number = 0;
  public checkStatusFrom: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<CheckNeedyStatusRequestFormComponent>,
    public apiService: ApiService,
    public userInfoService: UserInfoService,
    @Inject(MAT_DIALOG_DATA) public data: { withFiles: boolean },
  ) { 
    this.checkStatusFrom = new FormGroup({
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "needyId": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)])
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSubmit() {
    if (this.checkStatusFrom.valid) {
      this.dialogRef.close(this.checkStatusFrom.value);
    }
  }
  
  get CSsn(): AbstractControl {
    return this.checkStatusFrom.controls["ssn"];
  }

  get CNeedyId(): AbstractControl {
    return this.checkStatusFrom.controls["needyId"];
  }
}
