import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NeedyTableActionType } from 'src/app/enums/needy-table-action-type.enum';
import { NeedyElement } from 'src/app/interfaces/needy-element.interface';
import { ApiService } from 'src/app/services/api.service';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UserRole } from '../../../../../../shared/enums/user-role.enum';

@Component({
  selector: 'app-support-recommendation',
  templateUrl: './support-recommendation.component.html',
  styleUrls: ['./support-recommendation.component.scss']
})
export class SupportRecommendationComponent implements OnInit, OnDestroy {
  public supportAmount: number = 0;
  public headerTitle: string = "";
  public ssn: string = "";
  public duplicateSSN: number[] = [];
  public isManager: boolean = true;

  private subscriptions: Subscription[] = [];

  public messagesList: string[] = [
    "חסר תז כולל ספח",
    "חסר דוח תים",
    "חסר אישור שמעיד שאתם בוכרים",
    "חסר אישור מהישיבה עדכני שמעיד שאתה תלמיד יום שלם",
    "חסר צילום תז, במידה ואין נא לצרף ספח של אחד ההורים"
  ];

  private selectedMessages: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<SupportRecommendationComponent>,
    public apiService: ApiService,
    public userInfoService: UserInfoService,
    private needyDataServiceService: NeedyDataServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, needy: NeedyElement, isManager: boolean },
  ) { }

  ngOnInit(): void {
    this.supportAmount = this.data.needy.supportAmount;
    this.ssn = this.data.needy.ssn;
    this.headerTitle = this.data.title;

    if (typeof (this.data.isManager) !== "undefined") {
      this.isManager = this.data.isManager;
    }

    this.subscriptions.push(this.userInfoService.$userInfo.subscribe(userInfo => {
      if (userInfo?.role != UserRole.coordinator) {
        this._isDuplicateSSN();
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  _isDuplicateSSN = () => {
    this.apiService.isDuplicateSSN(this.data.needy.ssn, this.data.needy.projectId).subscribe(res => {
      if (res.length) {
        this.duplicateSSN = res;
      }
    })
  }

  showDuplicateSSN = () => {
    this.needyDataServiceService.resetFilters();
    this.needyDataServiceService.filterTable("id", this.duplicateSSN.filter(id => !!id).join(","));
    this.dialogRef.close();
  }

  onReject() {
    let messages = "";

    if (this.selectedMessages.length) {
      messages = "הבקשה בהמתנה: " + this.selectedMessages.filter(m => m != "").join("; ") + ". יש להשלים מסמכים אלו בתיבת 'השלמת מסמכים'";
    } else {
      this.supportAmount = 0;
    }
    this.dialogRef.close({ supportAmount: this.supportAmount, messages });
  }

  onApprove() {
    this.dialogRef.close({ supportAmount: this.supportAmount, messages: "" });
  }

  updateSelectedMessages = (index: number, event: any) => {
    if (event.checked == false) {
      this.selectedMessages[index] = "";
    } else {
      this.selectedMessages[index] = this.messagesList[index];
    }
  }

}
