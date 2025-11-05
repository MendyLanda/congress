import { Injectable } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, AsyncValidatorFn } from "@angular/forms";
import { Observable, map, catchError, of } from "rxjs";
import { ApiService } from "../services/api.service";


@Injectable({ providedIn: 'root' })
export class UsernameValidator implements AsyncValidator {

    constructor(
        private apiService: ApiService
    ) { }

    public validate = (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        return this.apiService.isUsernameValid(control.value).pipe(
            map(isUsernameValid => (isUsernameValid ? null : { usernameTaken: true })),
            catchError(() => of({ serverError: true }))
        );
    }
}