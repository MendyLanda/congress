import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { UpdateEmailRequest } from '../../../shared/interfaces/update-email-request.interface';

export class UpdateEmailRequestDto implements UpdateEmailRequest {
    @IsString() @IsNotEmpty() @Validate(IsraeliSSN)
    ssn: string;

    @IsNumber() @IsNotEmpty()
    needyId: number;

    @IsString() @IsNotEmpty()
    email: string;
}