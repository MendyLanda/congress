import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { UpdateBankDetailsRequest } from '../../../shared/interfaces/update-bank-details-request.interface';

export class UpdateBankDetailsRequestDto implements UpdateBankDetailsRequest {
    @IsString() @IsNotEmpty() @Validate(IsraeliSSN)
    ssn: string;

    @IsNumber() @IsNotEmpty()
    needyId: number;

    @IsString() @IsNotEmpty()
    bankNo: number;

    @IsString() @IsNotEmpty()
    bankBranchNo: number;

    @IsString() @IsNotEmpty()
    bankAccountNo: number;
}