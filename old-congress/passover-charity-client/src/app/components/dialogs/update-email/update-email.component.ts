import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { UpdateEmailRequest } from '../../../../../../shared/interfaces/update-email-request.interface';

const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.scss']
})
export class UpdateEmailComponent implements OnInit, OnDestroy {
  public updateEmailForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<UpdateEmailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { withFiles: boolean },
  ) { 
    this.updateEmailForm = new FormGroup({
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "needyId": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "email": new FormControl('', [Validators.required, Validators.pattern(emailPattern)])
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onSubmit() {
    if (this.updateEmailForm.valid) {
      this.dialogRef.close(this.updateEmailForm.value as UpdateEmailRequest);
    }
  }
  
  get CSsn(): AbstractControl {
    return this.updateEmailForm.controls["ssn"];
  }

  get CNeedyId(): AbstractControl {
    return this.updateEmailForm.controls["needyId"];
  }

  get CEmail(): AbstractControl {
    return this.updateEmailForm.controls["email"];
  }
}
