import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { GetAvrechRequestStatus } from '../../../shared/interfaces/get-avrech-request-status.interface';

export class GetAvrechRequestStatusDto implements GetAvrechRequestStatus {
    @IsString() @IsNotEmpty() @Validate(IsraeliSSN)
    ssn: string;

    @IsNumber() @IsNotEmpty()
    needyId: number;
}