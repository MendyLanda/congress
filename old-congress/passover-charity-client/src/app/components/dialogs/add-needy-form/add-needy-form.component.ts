import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileValidator } from "ngx-material-file-input";
import { Subscription } from 'rxjs';
import { FormSpecialTypes } from 'src/app/enums/form-special-types.enum';
import { NeedyElement } from 'src/app/interfaces/needy-element.interface';
import { fileExtensionValidator } from 'src/app/utils/file-extension.validator';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { MaritalStatus } from '../../../../../../shared/enums/marital-status.enum';
import { NeedyType } from "../../../../../../shared/enums/needy-type.enum";
import { UpdateStudentDetailsComponent } from '../update-student-details/update-student-details.component';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UserRole } from '../../../../../../shared/enums/user-role.enum';

const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

@Component({
  selector: 'app-add-needy-form',
  templateUrl: './add-needy-form.component.html',
  styleUrls: ['./add-needy-form.component.scss']
})
export class AddNeedyFormComponent implements OnInit {
  readonly NeedyType = NeedyType;
  readonly numOfPersonsThatSsnDocumentRequired = 4;
  newNeedyForm: FormGroup;
  private subscriptions: Subscription[] = [];
  updateMode: boolean = false;
  previousNumOfPersons = 0;

  @ViewChild("studentForm", { static: false }) studentForm: UpdateStudentDetailsComponent | undefined;

  get formTypes() {
    if (this.data?.special === FormSpecialTypes.avrech) {
      return [NeedyType.Student];
    } else if (this.data?.special === FormSpecialTypes.synagogue) {
      return [NeedyType.Gabbai, NeedyType.Rabbi];
    } else if (this.data?.special === FormSpecialTypes.young) {
      return [NeedyType.Young];
    } else if (this.userInfoService.userInfo!.role !== UserRole.manager) {
      return [NeedyType.Welfare, NeedyType.Needy, NeedyType.BereavedFamily, NeedyType.Evacuee, NeedyType.Rabbi, NeedyType.Gabbai]
    } else {
      return Object.values(NeedyType);
    }
  }

  get maritalStatus() {
    return Object.values(MaritalStatus);
  }

  constructor(
    public dialogRef: MatDialogRef<AddNeedyFormComponent>,
    public userInfoService: UserInfoService,
    @Inject(MAT_DIALOG_DATA) public data: { needy: NeedyElement, special: FormSpecialTypes },
  ) {
    this.newNeedyForm = new FormGroup({
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "firstName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "lastName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "phone": new FormControl('', [Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]),
      "mobilePhone": new FormControl('', [Validators.pattern(/^[\d+-]{8,}$/)]),
      "address": new FormControl('', [Validators.required, Validators.pattern(/^[א-תa-zA-Z-'",./\ 0-9]{2,}$/)]),
      "city": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "needyType": new FormControl('', [Validators.required]),
      "confirmationDocument": new FormControl('', [FileValidator.maxContentSize(521549 * 4), fileExtensionValidator]),
      "exceptionsCommittee": new FormControl('', [FileValidator.maxContentSize(521549 * 4), fileExtensionValidator]),
      "numberOfPersons": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "numberOfPersonsUnder18": new FormControl('', [Validators.pattern(/^\d+$/)]),
      "maritalStatus": new FormControl('', [Validators.required]),
      "statement1": new FormControl(false, [Validators.requiredTrue]),
      "statement2": new FormControl(false, [Validators.requiredTrue]),
      "statement3": new FormControl(false, []),
    });

    if (data?.needy) {
      const needy = data.needy;
      this.updateMode = true;

      this.previousNumOfPersons = needy.numberOfPersons;

      this.CSsn.setValue(needy.ssn);
      this.CFirstName.setValue(needy.firstName);
      this.CLastName.setValue(needy.lastName);
      this.CPhone.setValue(needy.phone);
      this.CMobilePhone.setValue(needy.mobilePhone);
      this.CAddress.setValue(needy.address);
      this.CCity.setValue(needy.city);
      this.CNeedyType.setValue(needy.needyType);
      this.CNumberOfPersons.setValue(needy.numberOfPersons);
      this.CMaritalStatus.setValue(needy.maritalStatus);

      this.CConfirmationDocument?.removeValidators(Validators.required);;

      this.CWelfareDepartmentRecommendation_sum?.disable();
      this.CLlocalCommunityRecommendation_sum?.disable();

      this.CStatement1.setValue(true);
      this.CStatement2.setValue(true);
      this.CStatement3.setValue(true);
    }
  }

  ngOnInit(): void {
    this.handleSsnDocument();
    this.handleFormType();

    if (this.data?.special === FormSpecialTypes.avrech) {
      this.CNeedyType.disable();
      this.CNeedyType.setValue(NeedyType.Student);
    }

    if (this.data?.special === FormSpecialTypes.young) {
      this.CNeedyType.disable();
      this.CNeedyType.setValue(NeedyType.Young);
      this.CMaritalStatus.setValue(MaritalStatus.single);
      this.CNumberOfPersons.setValue(0);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleFormType = () => {
    this.subscriptions.push(this.CNeedyType.valueChanges.subscribe((change: NeedyType) => {
      switch (change) {
        case (NeedyType.Welfare): {
          this.newNeedyForm.addControl("description", new FormControl(''));
          this.newNeedyForm.addControl("welfareDepartmentRecommendationSum", new FormControl('', [Validators.required, Validators.pattern(/^\d+.$/)]));
          if (this.CLlocalCommunityRecommendation_sum) this.newNeedyForm.removeControl("localCommunityRecommendationSum");
          this.CConfirmationDocument.removeValidators(Validators.required);
          this.CStatement1.removeValidators(Validators.requiredTrue);
          this.CStatement2.removeValidators(Validators.requiredTrue);

          break;
        }
        case (NeedyType.Evacuee):
        case (NeedyType.BereavedFamily):
        case (NeedyType.Needy): {
          this.newNeedyForm.addControl("description", new FormControl(''));
          if (this.CWelfareDepartmentRecommendation_sum) this.newNeedyForm.removeControl("welfareDepartmentRecommendationSum");
          this.newNeedyForm.addControl("localCommunityRecommendationSum", new FormControl('', [Validators.required, Validators.pattern(/^\d+.$/)]));
          this.CConfirmationDocument.removeValidators(Validators.required);
          this.CStatement1.removeValidators(Validators.requiredTrue);
          this.CStatement2.removeValidators(Validators.requiredTrue);

          break;
        }
        case (NeedyType.Student):
        case (NeedyType.Young):
        case (NeedyType.Rabbi): {
          if (this.CDescription) this.newNeedyForm.removeControl("description");
          if (this.CWelfareDepartmentRecommendation_sum) this.newNeedyForm.removeControl("welfareDepartmentRecommendationSum");
          if (this.CLlocalCommunityRecommendation_sum) this.newNeedyForm.removeControl("localCommunityRecommendationSum");
          this.newNeedyForm.addControl("ssnDocument", new FormControl('', [Validators.required, FileValidator.maxContentSize(521549 * 4)]));
          this.CConfirmationDocument.addValidators(Validators.required);
          this.CStatement1.addValidators(Validators.requiredTrue);
          this.CStatement2.addValidators(Validators.requiredTrue);

          break;
        }
      }

      if (change === NeedyType.Student || change === NeedyType.Young) {
        this.CStatement3.addValidators(Validators.requiredTrue);
      } else {
        this.CStatement3.removeValidators(Validators.requiredTrue);
      }

      if (change === NeedyType.Young) {
        this.newNeedyForm.addControl("email", new FormControl('', [Validators.required, Validators.pattern(emailPattern)]));
        this.CMaritalStatus.setValue(MaritalStatus.single);
        this.CNumberOfPersons.setValue(0);
      } else {
        this.newNeedyForm.removeControl("email");
        this.CMaritalStatus.setValue(null);
        this.CNumberOfPersons.setValue(null);
      }


      if (this.CNeedyType.value === NeedyType.Gabbai) {
        this.CNumberOfPersons.setValue(0);
        this.CMaritalStatus.setValue(MaritalStatus.married);
        this.CNumberOfPersons.removeValidators(Validators.required);
        this.CMaritalStatus.removeValidators(Validators.required);
        this.CConfirmationDocument.removeValidators(Validators.required);
      } else {
        this.CNumberOfPersons.addValidators(Validators.required);
        this.CMaritalStatus.addValidators(Validators.required);
      }

      if (this.CEmail) this.CEmail.updateValueAndValidity();
      if (this.CDescription) this.CDescription.updateValueAndValidity();
      if (this.CWelfareDepartmentRecommendation_sum) this.CWelfareDepartmentRecommendation_sum.updateValueAndValidity();
      if (this.CLlocalCommunityRecommendation_sum) this.CLlocalCommunityRecommendation_sum.updateValueAndValidity();
      this.CConfirmationDocument.updateValueAndValidity();
      this.CStatement1.updateValueAndValidity();
      this.CStatement2.updateValueAndValidity();
      this.CNumberOfPersons.updateValueAndValidity();
      this.CMaritalStatus.updateValueAndValidity();
      if (this.CSSNDocument) this.CSSNDocument.updateValueAndValidity();
    }));
  }

  onSubmit() {
    if (this.isFormValid()) {
      const value = !this.updateMode ? this.getFormValue() : { ...this.getFormValue(), id: this.data?.needy?.id };
      this.dialogRef.close(value);
    }
  }

  getFormValue = () => {
    // Fix the disabled behavior of the form
    if (!this.newNeedyForm.value.needyType) {
      this.newNeedyForm.value.needyType = this.newNeedyForm.controls["needyType"].value;
    }

    if (!this.isStudentFrom()) {
      return { ...this.newNeedyForm.value };
    } else {
      return { ...this.newNeedyForm.value, ...this.studentForm?.studentForm.value };
    }
  }

  isFormValid = (): boolean => {
    if (!this.isStudentFrom() || this.updateMode) {
      return this.newNeedyForm.valid;
    } else {
      return this.newNeedyForm.valid && this.studentForm!.studentForm.valid;
    }
  }

  handleSsnDocument = () => {
    this.subscriptions.push(this.CNumberOfPersons.valueChanges.subscribe((change: number) => {
      if (this.idSsnDocRequired(change)) {
        this.newNeedyForm.addControl("ssnDocument", new FormControl('', [Validators.required, FileValidator.maxContentSize(521549 * 4)]));
      } else if (this.CSSNDocument) {
        this.newNeedyForm.removeControl("ssnDocument");
      }
      if (this.CSSNDocument) this.CSSNDocument.updateValueAndValidity();
    }));
  }

  idSsnDocRequired = (newPersons?: number) => {
    const newValue = newPersons || this.CNumberOfPersons.value;
    return this.CNeedyType.value == NeedyType.Student ||
      this.CNeedyType.value == NeedyType.Rabbi ||
      this.CNeedyType.value == NeedyType.Young ||
      (newValue != this.previousNumOfPersons && newValue >= this.numOfPersonsThatSsnDocumentRequired)
  }

  closeDialog() {
    this.dialogRef.close();
  }

  public isStudentFrom() {
    return this.CNeedyType.value == NeedyType.Student ||
      this.CNeedyType.value == NeedyType.Rabbi ||
      this.CNeedyType.value == NeedyType.Young ||
      this.CNeedyType.value == NeedyType.Needy ||
      this.CNeedyType.value == NeedyType.Welfare;
  }

  public isWelfareForm() {
    return this.CNeedyType.value == NeedyType.Welfare || this.CNeedyType.value == NeedyType.Needy;
  }

  getFileName = (type: NeedyType) => {
    const dict = {
      [NeedyType.Needy]: "אישור וועדת רווחה ",
      [NeedyType.Welfare]: "אישור וועדת רווחה ",
      [NeedyType.BereavedFamily]: "אישור וועדת רווחה ",
      [NeedyType.Evacuee]: "אישור וועדת רווחה ",
      [NeedyType.Student]: "אישור תים ללימוד בכולל",
      [NeedyType.Young]: "אישור לימודים בישיבה",
      [NeedyType.Rabbi]: "אישור רבנות מבית הכנסת",
      [NeedyType.Gabbai]: ""
    }

    return dict[type];
  }

  getStatement1 = (type: NeedyType) => {
    const dict = {
      [NeedyType.Needy]: "",
      [NeedyType.Welfare]: "",
      [NeedyType.BereavedFamily]: "",
      [NeedyType.Evacuee]: "",
      [NeedyType.Student]: "בסימון זה אני מאשר שאני אברך המשתייך לעדה הבוכרית הלומד יום שלם (8 שעות) בכולל מוכר במשרד הדתות.",
      [NeedyType.Young]: "בסימון זה אני מאשר שאני בחור ישיבה המשתייך לעדה הבוכרית הלומד יום שלם.",
      [NeedyType.Rabbi]: "אני מצהיר שאני רב של בית כנסת ששיך לקהילה הבוכרית",
      [NeedyType.Gabbai]: "אני מצהיר שאני גבאי בית כנסת ששיך לקהילה הבוכרית"
    }

    return dict[type];
  }

  getStatement2 = (type: NeedyType) => {
    const dict = {
      [NeedyType.Needy]: "",
      [NeedyType.Welfare]: "",
      [NeedyType.BereavedFamily]: "",
      [NeedyType.Evacuee]: "",
      [NeedyType.Student]: `בסימון זה אני מאשר שאני מודע לכך שאקבל את מתנת החג רק אם אשתתף בעצמי בכינוס "כתר תורה" לכבודה של תורה.`,
      [NeedyType.Young]: `בסימון זה אני מאשר שאני מודע לכך שאקבל את מתנת החג רק אם אשתתף בעצמי בכינוס "כתר תורה" לכבודה של תורה.`,
      [NeedyType.Rabbi]: "אני יודע שהאישור יכנס לתוקף רק לאחר שהרב יצחק שמלוב מזכל איגוד הרבנים של העדה הבוכרית",
      [NeedyType.Gabbai]: "אני יודע שהאישור יכנס לתוקף רק לאחר שהרב יצחק שמלוב מזכל איגוד הרבנים של העדה הבוכרית"
    }

    return dict[type];
  }

  getStatement3 = (type: NeedyType) => {
    const dict = {
      [NeedyType.Needy]: "",
      [NeedyType.Welfare]: "",
      [NeedyType.BereavedFamily]: "",
      [NeedyType.Evacuee]: "",
      [NeedyType.Student]: "רעהו יעזורו: אני מקבל על עצמי לחזק רוחנית וללוות אדם בקהילה לפחות 12 שעות למשך השנה הקרובה",
      [NeedyType.Young]: "רעהו יעזורו: אני מקבל על עצמי לחזק רוחנית וללוות אדם בקהילה לפחות 12 שעות למשך השנה הקרובה",
      [NeedyType.Rabbi]: "",
      [NeedyType.Gabbai]: ""
    }

    return dict[type];
  }

  isNeedyTypeCase(type: NeedyType) {
    return type === NeedyType.Needy || type === NeedyType.BereavedFamily || type === NeedyType.Evacuee ? type : "";
  }

  get CSsn(): AbstractControl {
    return this.newNeedyForm.controls["ssn"];
  }

  get CFirstName(): AbstractControl {
    return this.newNeedyForm.controls["firstName"];
  }

  get CLastName(): AbstractControl {
    return this.newNeedyForm.controls["lastName"];
  }

  get CPhone(): AbstractControl {
    return this.newNeedyForm.controls["phone"];
  }

  get CMobilePhone(): AbstractControl {
    return this.newNeedyForm.controls["mobilePhone"];
  }

  get CMaritalStatus(): AbstractControl {
    return this.newNeedyForm.controls["maritalStatus"];
  }

  get CAddress(): AbstractControl {
    return this.newNeedyForm.controls["address"];
  }

  get CCity(): AbstractControl {
    return this.newNeedyForm.controls["city"];
  }

  get CNeedyType(): AbstractControl {
    return this.newNeedyForm.controls["needyType"];
  }

  get CNumberOfPersons(): AbstractControl {
    return this.newNeedyForm.controls["numberOfPersons"];
  }

  get CNumberOfPersonsUnder18(): AbstractControl {
    return this.newNeedyForm.controls["numberOfPersonsUnder18"];
  }

  get CConfirmationDocument(): AbstractControl {
    return this.newNeedyForm.controls["confirmationDocument"];
  }

  get CExceptionsCommittee(): AbstractControl {
    return this.newNeedyForm.controls["exceptionsCommittee"];
  }

  get CSSNDocument(): AbstractControl {
    return this.newNeedyForm.controls["ssnDocument"];
  }

  get CDescription(): AbstractControl {
    return this.newNeedyForm.controls["description"];
  }

  get CWelfareDepartmentRecommendation_sum(): AbstractControl {
    return this.newNeedyForm.controls["welfareDepartmentRecommendationSum"];
  }

  get CLlocalCommunityRecommendation_sum(): AbstractControl {
    return this.newNeedyForm.controls["localCommunityRecommendationSum"];
  }
  get CStatement1(): AbstractControl {
    return this.newNeedyForm.controls["statement1"];
  }
  get CStatement2(): AbstractControl {
    return this.newNeedyForm.controls["statement2"];
  }
  get CStatement3(): AbstractControl {
    return this.newNeedyForm.controls["statement3"];
  }
  get CEmail(): AbstractControl {
    return this.newNeedyForm.controls["email"];
  }
}
