import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validateSSN } from "../../shared/logic/ssn.validator";

@ValidatorConstraint({ name: 'IsraeliSSN', async: false })
export class IsraeliSSN implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return validateSSN(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'SSN ($value) is not valid!';
  }
}