import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { IsraeliSSb } from 'src/app/utils/IsraeliSSb.vaildator';
import { UsernameValidator } from 'src/app/utils/username.validator';
import { OrganizationType } from '../../../../../../shared/enums/organization-type.enum';
import { UserRole } from '../../../../../../shared/enums/user-role.enum';
import { Project } from '../../../../../../shared/interfaces/project.interface';
import { Coordinator } from '../../../../../../shared/interfaces/coordinator.interface';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-user-from',
  templateUrl: './add-user-from.component.html',
  styleUrls: ['./add-user-from.component.scss']
})
export class AddUserFromComponent implements OnInit {
  newUserForm: FormGroup;
  readonly UserRole = UserRole;
  private subscriptions: Subscription[] = [];
  _signInMode: boolean = true;

  get signInMode() {
    return this._signInMode;
  }

  set signInMode(status: boolean) {
    if (status) {
      this.CType?.setValue(UserRole.coordinator);
    } else {
      this.CType.setValue("");
    }

    this._signInMode = status;
  }

  get userTypes() {
    return Object.values(UserRole)
  }

  get organizationTypes() {
    return Object.values(OrganizationType)
  }

  projects: Project[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddUserFromComponent>,
    private apiService: ApiService,
    private usernameValidator: UsernameValidator,
  ) {
    this.newUserForm = new FormGroup({
      "username": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{8,12}$/)], [usernameValidator.validate]),
      "password": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{8,12}$/)]),
      "passwordApprove": new FormControl('', [Validators.required, this.validatePassword]),
      "ssn": new FormControl('', [Validators.required, IsraeliSSb]),
      "firstName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "lastName": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "phone": new FormControl('', [Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]),
      "address": new FormControl('', [Validators.required, Validators.pattern(/^[א-תa-zA-Z-'"/\,. 0-9]{2,}$/)]),
      "city": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "type": new FormControl('', [Validators.required]),
      "committeePersons": new FormArray([]),
      "organizationName": new FormControl('', [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]),
      "organizationAddress": new FormControl('', [Validators.required, Validators.pattern(/^[א-תa-zA-Z-'/\",. 0-9]{2,}$/)]),
      "organizationCity": new FormControl('', [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]),
      "organizationType": new FormControl('', [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]),
      "organizationNo": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
      "projectId": new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    });

    for (let i = 0; i < 3; i++) {
      this.CCommitteePersons.push(this.createCommitteePersonFromGroup());
    }

    if (this.signInMode) {
      this.CType.setValue(UserRole.coordinator);
    }
  }

  ngOnInit(): void {
    this.subscriptions.push(this.apiService.getProjects().subscribe((res: Project[]) => {
      this.projects = res;
    }));
    this.handleTypeChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit() {
    if (this.newUserForm.valid) {
      const value = this.newUserForm.value;
      this.dialogRef.close(value);
    }
  }

  createCommitteePersonFromGroup() {
    return new FormGroup({
      "ssn": new FormControl('', [IsraeliSSb]),
      "name": new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]),
      "phone": new FormControl('', [Validators.required, Validators.pattern(/^[\d+-]{8,}$/)]),
    });
  }
  
  closeDialog() {
    this.dialogRef.close();
  }

  validatePassword = (control: AbstractControl) => {
    if (!this.CPassword?.value || control.value != this.CPassword.value) {
      return { passwordDoesNotMatch: true }
    }

    return null;
  }

  handleTypeChanges = () => {
    this.subscriptions.push(this.CType.valueChanges.subscribe((change: UserRole) => {
      if (change == UserRole.coordinator) {
        this.newUserForm.addControl("ssn", new FormControl("", [Validators.required, IsraeliSSb]));
        this.newUserForm.addControl("address", new FormControl("", [Validators.required, Validators.pattern(/^[א-ת-'",. a-zA-Z0-9]{2,}$/)]));
        this.newUserForm.addControl("city", new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. ]{2,}$/)]));
        this.newUserForm.addControl("organizationName", new FormControl("", [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]));
        this.newUserForm.addControl("organizationAddress", new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Zא-ת-'",. 0-9]{2,}$/)]));
        this.newUserForm.addControl("organizationCity", new FormControl("", [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]));
        this.newUserForm.addControl("organizationType", new FormControl("", [Validators.required, Validators.pattern(/^[א-ת-'",. 0-9]{2,}$/)]));
        this.newUserForm.addControl("organizationNo", new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]));

        this.CSsn.updateValueAndValidity();
        this.CAddress.updateValueAndValidity();
        this.CCity.updateValueAndValidity();
        this.COrganizationName.updateValueAndValidity();
        this.COrganizationAddress.updateValueAndValidity();
        this.COrganizationCity.updateValueAndValidity();
        this.COrganizationType.updateValueAndValidity();
        this.COrganizationNo.updateValueAndValidity();
      } else {
        this.newUserForm.removeControl("ssn");
        this.newUserForm.removeControl("address");
        this.newUserForm.removeControl("city");
        this.newUserForm.removeControl("organizationName");
        this.newUserForm.removeControl("organizationAddress");
        this.newUserForm.removeControl("organizationCity");
        this.newUserForm.removeControl("organizationType");
        this.newUserForm.removeControl("organizationNo");
      }
    }));
  }

  get CUsername(): AbstractControl {
    return this.newUserForm.controls["username"];
  }

  get CPassword(): AbstractControl {
    return this.newUserForm?.controls?.["password"];
  }

  get CPasswordApprove(): AbstractControl {
    return this.newUserForm.controls["passwordApprove"];
  }

  get CSsn(): AbstractControl {
    return this.newUserForm.controls["ssn"];
  }

  get CFirstName(): AbstractControl {
    return this.newUserForm.controls["firstName"];
  }

  get CLastName(): AbstractControl {
    return this.newUserForm.controls["lastName"];
  }

  get CPhone(): AbstractControl {
    return this.newUserForm.controls["phone"];
  }

  get CAddress(): AbstractControl {
    return this.newUserForm.controls["address"];
  }

  get CCity(): AbstractControl {
    return this.newUserForm.controls["city"];
  }

  get CType(): AbstractControl {
    return this.newUserForm.controls["type"];
  }

  get CCommitteePersons(): FormArray {
    return this.newUserForm.controls["committeePersons"] as FormArray;
  }

  get COrganizationName(): AbstractControl {
    return this.newUserForm.controls["organizationName"];
  }

  get COrganizationAddress(): AbstractControl {
    return this.newUserForm.controls["organizationAddress"];
  }

  get COrganizationCity(): AbstractControl {
    return this.newUserForm.controls["organizationCity"];
  }

  get COrganizationType(): AbstractControl {
    return this.newUserForm.controls["organizationType"];
  }

  get COrganizationNo(): AbstractControl {
    return this.newUserForm.controls["organizationNo"];
  }

  get CProjectId(): AbstractControl {
    return this.newUserForm.controls["projectId"];
  }

}
