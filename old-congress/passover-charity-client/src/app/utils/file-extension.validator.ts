import { AbstractControl, ValidationErrors } from "@angular/forms";

export const fileExtensionValidator = (control: AbstractControl): ValidationErrors | null => {
    
    if (!control.value) {
        return null;
    }
    
    return fileExtensionValidate(control.value?._files[0]?.name) ? null : { extensionNotValid: true };
}

export const fileExtensionValidate = (fileName: string) => {
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];

    const fileNameArray = fileName.split(".") || [];
    return validExtensions.includes(fileNameArray[fileNameArray.length - 1])
}