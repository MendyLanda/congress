import { AbstractControl, ValidationErrors } from "@angular/forms";
import { validateSSN } from "../../../../shared/logic/ssn.validator";

export const IsraeliSSb = (idControl: AbstractControl): ValidationErrors | null => {
    if (!validateSSN(idControl.value)) {
        return { illegalId: idControl.value }
    } else {
        return null;
    }
}
