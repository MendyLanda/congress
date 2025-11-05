import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { UpdateBankDetailsRequest } from '../../../../../../shared/interfaces/update-bank-details-request.interface';
import { FileValidator } from 'ngx-material-file-input';
import { fileExtensionValidator } from 'src/app/utils/file-extension.validator';


@Component({
  selector: 'app-update-bank-details',
  templateUrl: './update-bank-details.component.html',
  styleUrls: ['./update-bank-details.component.scss']
})
export class UpdateBankDetailsComponent implements OnInit, OnDestroy {
  public updateBankDetailsForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<UpdateBankDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { withFiles: boolean },
  ) {
    this.updateBankDetailsForm = new FormGroup({
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "needyId": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "bankNo": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "bankBranchNo": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "bankAccountNo": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "document": new FormControl('', [Validators.required, FileValidator.maxContentSize(521549 * 4), fileExtensionValidator]),
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSubmit() {
    if (this.updateBankDetailsForm.valid) {
      this.dialogRef.close(this.updateBankDetailsForm.value as UpdateBankDetailsRequest);
    }
  }

  get CSsn(): AbstractControl {
    return this.updateBankDetailsForm.controls["ssn"];
  }

  get CNeedyId(): AbstractControl {
    return this.updateBankDetailsForm.controls["needyId"];
  }

  get CBankNo(): AbstractControl {
    return this.updateBankDetailsForm.controls["bankNo"];
  }

  get CBankBranchNo(): AbstractControl {
    return this.updateBankDetailsForm.controls["bankBranchNo"];
  }

  get CBankAccountNo(): AbstractControl {
    return this.updateBankDetailsForm.controls["bankAccountNo"];
  }

  get CDocument(): AbstractControl {
    return this.updateBankDetailsForm.controls["document"];
  }
}
