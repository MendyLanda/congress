import { Component, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IsraeliSSb } from '../../../utils/IsraeliSSb.vaildator';
import { KollelType } from '../../../../../../shared/enums/kollel-type.enum';
import { Student } from '../../../../../../shared/interfaces/student.interface';
import { Subscription } from 'rxjs';
import { StudentChild } from '../../../../../../shared/interfaces/student-child.interface';
import { NeedyType } from '../../../../../../shared/enums/needy-type.enum';
import { MaritalStatus } from '../../../../../../shared/enums/marital-status.enum';

@Component({
  selector: 'app-update-student-details',
  templateUrl: './update-student-details.component.html',
  styleUrls: ['./update-student-details.component.scss']
})
export class UpdateStudentDetailsComponent implements OnInit {
  studentForm: FormGroup;
  updateMode: boolean = false;
  private subscriptions: Subscription[] = [];
  readonly MaritalStatus = MaritalStatus;

  @Input() CMartialStatus: AbstractControl | undefined;
  @Input() CNumberOfChildren: AbstractControl | undefined;
  @Input() type: NeedyType | undefined;
  @Input() CChildrenUnder18: AbstractControl | undefined;

  get formTypes() {
    return NeedyType;
  }

  get kollelTypes() {
    return [KollelType.allDay, KollelType.halfDay];
  }

  get YeshivaType() {
    return [KollelType.YeshivaG, KollelType.YeshivaK];
  }

  constructor(
    public dialogRef: MatDialogRef<UpdateStudentDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Student,
  ) {
    this.studentForm = new FormGroup({
      "ssnWife": new FormControl('', [Validators.required, IsraeliSSb]),
      "firstNameWife": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "lastNameWife": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "studentChildren": new FormArray([]),
      "kollelName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "headOfTheKollelName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "headOfTheKollelPhone": new FormControl('', [Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]),
      "kollelType": new FormControl('', Validators.required),
    });


    this.CKollelType.setValue(KollelType.allDay);

    if (data?.kollelType) {
      this.updateMode = true;

      this.CSsnWife.setValue(data.ssnWife);
      this.CFirstNameWife.setValue(data.firstNameWife);
      this.CLastNameWife.setValue(data.lastNameWife);

      for (let child of data.studentChildren || []) {
        this.CStudentChildren.push(this.createStudentChildrenFromGroup(child));
      }

      this.CKollelName.setValue(data.kollelType);
      this.CHeadOfTheKollelName.setValue(data.headOfTheKollelName);
      this.CHeadOfTheKollelPhone.setValue(data.headOfTheKollelPhone);
      this.CKollelType.setValue(data.kollelType);
    }

  }

  ngOnInit(): void {
    this.handleChildrenChanges()
    this.handleMartialStatusChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit() {
    if (this.type === NeedyType.Young || this.CMartialStatus?.value !== MaritalStatus.married) {
      this.CSsnWife.removeValidators([Validators.required, IsraeliSSb]);
      this.CFirstNameWife.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CLastNameWife.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
    } else {
      this.CSsnWife.setValidators([Validators.required, IsraeliSSb]);
      this.CFirstNameWife.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CLastNameWife.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
    }

    if (this.type === NeedyType.Needy || this.type === NeedyType.Welfare) {
      this.CKollelName.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CHeadOfTheKollelName.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CHeadOfTheKollelPhone.removeValidators([Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]);
      this.CKollelType.removeValidators(Validators.required);
      this.CKollelType.setValue(undefined);
    } else {
      this.CKollelName.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CHeadOfTheKollelName.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
      this.CHeadOfTheKollelPhone.setValidators([Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]);
      this.CKollelType.setValidators(Validators.required);
      this.CKollelType.setValue(KollelType.allDay);
    }

    this.CSsnWife.updateValueAndValidity();
    this.CFirstNameWife.updateValueAndValidity();
    this.CLastNameWife.updateValueAndValidity();
    this.CKollelName.updateValueAndValidity();
    this.CHeadOfTheKollelName.updateValueAndValidity();
    this.CHeadOfTheKollelPhone.updateValueAndValidity();
    this.CKollelType.updateValueAndValidity();
  }

  handleChildrenChanges = () => {
    if (this.CNumberOfChildren) {
      this.subscriptions.push(this.CNumberOfChildren.valueChanges.subscribe((change: string) => { // TODO: from needy page
        this.updateChildren(change);
      }));
    }
    if (this.CChildrenUnder18) {
      this.subscriptions.push(this.CChildrenUnder18.valueChanges.subscribe((change: string) => { // TODO: from needy page
        this.updateChildren();
      }));
    }
  }

  updateChildren = (_change?: string) => {
    let change: string = _change || this.CNumberOfChildren?.value || "0";

    if (this.CChildrenUnder18) {
      change = (+change - +(this.CChildrenUnder18.value || 0)).toString();
    }

    const currLen = this.CStudentChildren.length;
    if (change === "") {
      return;
    }

    if (+change > currLen) {
      for (let i = 0; i < +change - currLen; i++) {
        this.CStudentChildren.push(this.createStudentChildrenFromGroup());
      }
    } else if (+change < currLen) {
      for (let i = 0; i < currLen - +change; i++) {
        this.CStudentChildren.removeAt(this.CStudentChildren.length - 1);
      }
    }
  }

  handleMartialStatusChanges = () => {
    if (this.CMartialStatus) {
      this.subscriptions.push(this.CMartialStatus.valueChanges.subscribe((change: string) => {
        if (this.type === NeedyType.Young) {
          return
        }

        if (change === MaritalStatus.married) {
          this.CSsnWife.setValidators([Validators.required, IsraeliSSb]);
          this.CFirstNameWife.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
          this.CLastNameWife.setValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
        } else {
          this.CSsnWife.removeValidators([Validators.required, IsraeliSSb]);
          this.CFirstNameWife.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
          this.CLastNameWife.removeValidators([Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]);
        }

        this.CSsnWife.updateValueAndValidity();
        this.CFirstNameWife.updateValueAndValidity();
        this.CLastNameWife.updateValueAndValidity();
      }));
    }
  }

  isWelfareForm = () => {
    return this.type === NeedyType.Welfare || this.type === NeedyType.Needy;
  }
  
  onSubmit() {
    if (this.studentForm.valid) {
      const value = !this.updateMode ? this.studentForm.value : { ...this.studentForm.value, id: this.data.id };
      this.dialogRef.close(value);
    }
  }

  createStudentChildrenFromGroup(child?: StudentChild) {
    return new FormGroup({
      "ssn": new FormControl(child ? child.ssn : '', [Validators.required, IsraeliSSb]),
      "name": new FormControl(child ? child.name : '', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
    });
  }

  closeDialog = () => {
    if (this.updateMode) {
      this.dialogRef.close();
    }
  }

  get CSsnWife(): AbstractControl {
    return this.studentForm.controls["ssnWife"];
  }

  get CFirstNameWife(): AbstractControl {
    return this.studentForm.controls["firstNameWife"];
  }

  get CLastNameWife(): AbstractControl {
    return this.studentForm.controls["lastNameWife"];
  }

  get CStudentChildren(): FormArray {
    return this.studentForm.controls["studentChildren"] as FormArray;
  }

  get CKollelName(): AbstractControl {
    return this.studentForm.controls["kollelName"];
  }

  get CHeadOfTheKollelName(): AbstractControl {
    return this.studentForm.controls["headOfTheKollelName"];
  }

  get CHeadOfTheKollelPhone(): AbstractControl {
    return this.studentForm.controls["headOfTheKollelPhone"];
  }

  get CKollelType(): AbstractControl {
    return this.studentForm.controls["kollelType"];
  }
}
