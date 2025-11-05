import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { UsersDataService } from 'src/app/services/users-data.service';
import { Coordinator } from '../../../../../shared/interfaces/coordinator.interface';
import { User } from '../../../../../shared/interfaces/user.interface';
import { AddUserFromComponent } from '../dialogs/add-user-from/add-user-from.component';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { Project } from '../../../../../shared/interfaces/project.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private usersDataService: UsersDataService,
    private apiService: ApiService,
    private toastyService: ToastyService,
    public dialog: MatDialog,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password);
  }

  addUserForm = () => {
    const dialogRef = this.dialog.open(AddUserFromComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) {
        return;
      }

      const newUser = this.usersDataService.createUser(result);

      this.recaptchaV3Service.execute("register").subscribe({
        next: (token: string) => {
          this.apiService.registerUser(newUser, token).subscribe(res => {
            this.toastyService.success("הבקשה נרשמה ומחכה לאישור");
          });
        },
        error: (err) => {
          console.log(err);
        }
      })

    });
  }

  get username(): AbstractControl {
    return this.loginForm.controls["username"];
  }

  get password(): AbstractControl {
    return this.loginForm.controls["password"];
  }
}
