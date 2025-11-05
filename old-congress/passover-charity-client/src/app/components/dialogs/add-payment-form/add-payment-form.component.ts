import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PaymentMethod } from '../../../../../../shared/enums/payment-method.enum';

@Component({
  selector: 'app-add-payment-form',
  templateUrl: './add-payment-form.component.html',
  styleUrls: ['./add-payment-form.component.scss'],
})
export class AddPaymentFormComponent implements OnInit, OnDestroy {
  newPaymentForm: FormGroup;
  subscriptions: Subscription[] = [];
  readonly PaymentMethod = PaymentMethod;
  withReceiver: boolean = false;

  get paymentMethod() {
    return Object.values(PaymentMethod);
  }

  get cardAmounts() {
    return [200, 250, 300, 500, 650, 750, 1000];
  }

  constructor(public dialogRef: MatDialogRef<AddPaymentFormComponent>) {
    this.newPaymentForm = new FormGroup({
      date: new FormControl(new Date(), [Validators.required]),
      amount: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
      type: new FormControl('', Validators.required),
      withReceiver: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.handleCardType();
    this.handleWithReceiver();
    this.CType.setValue(PaymentMethod.Card);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  closeDialog() {
    this.dialogRef.close();
  }

  handleCardType = () => {
    this.subscriptions.push(
      this.CType.valueChanges.subscribe((change: PaymentMethod) => {
        if (change == PaymentMethod.Card) {
          this.newPaymentForm.addControl(
            'cardId',
            new FormControl('', [
              Validators.required,
              Validators.pattern(/^\d+$/),
            ])
          );
          this.CAmount.setValue('');
        } else {
          this.newPaymentForm.removeControl('cardId');
          this.CAmount.setValue('');
        }

        if (change == PaymentMethod.Coupon || change == PaymentMethod.checks) {
          this.newPaymentForm.addControl(
            'couponNumber',
            new FormControl('', [
              Validators.required,
              Validators.pattern(/^\d+$/),
            ])
          );

          if (change == PaymentMethod.Coupon) {
            this.CAmount.setValue('650');
          }
        } else {
          this.newPaymentForm.removeControl('couponNumber');
          this.CAmount.setValue('');
        }

        if (this.newPaymentForm.controls['cardId'])
          this.newPaymentForm.controls['cardId'].updateValueAndValidity();
        if (this.newPaymentForm.controls['couponNumber'])
          this.newPaymentForm.controls['couponNumber'].updateValueAndValidity();
      })
    );
  };

  handleWithReceiver = () => {
    this.subscriptions.push(
      this.CWithReceiver.valueChanges.subscribe((change: PaymentMethod) => {
        if (change) {
          this.newPaymentForm.addControl(
            'receiver',
            new FormControl('', [
              Validators.required,
              Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/),
            ])
          );
          this.newPaymentForm.addControl(
            'receiverSignature',
            new FormControl('')
          );
          this.withReceiver = true;
        } else {
          this.newPaymentForm.removeControl('receiver');
          this.newPaymentForm.removeControl('receiverSignature');
          this.withReceiver = false;
        }
        if (this.newPaymentForm.controls['receiver'])
          this.newPaymentForm.controls['receiver'].updateValueAndValidity();
        if (this.newPaymentForm.controls['receiverSignature'])
          this.newPaymentForm.controls[
            'receiverSignature'
          ].updateValueAndValidity();
      })
    );
  };

  onSubmit() {
    if (this.newPaymentForm.valid) {
      this.dialogRef.close(this.newPaymentForm.value);
    }
  }

  get CDate(): AbstractControl {
    return this.newPaymentForm.controls['date'];
  }

  get CAmount(): AbstractControl {
    return this.newPaymentForm.controls['amount'];
  }

  get CType(): AbstractControl {
    return this.newPaymentForm.controls['type'];
  }

  get CWithReceiver(): AbstractControl {
    return this.newPaymentForm.controls['withReceiver'];
  }

  get CReceiverSignature(): AbstractControl {
    return this.newPaymentForm.controls['receiverSignature'];
  }
}
