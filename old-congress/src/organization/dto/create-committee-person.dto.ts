import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { CommitteePerson } from '../../../shared/interfaces/committee-person.interface';

export class CreateCommitteePersonDto implements CommitteePerson {
    id: number;
    coordinatorId: number;

    @IsString() @IsOptional() @Validate(IsraeliSSN)
    ssn: string;

    @IsString() @IsNotEmpty()
    name: string;

    @IsString() @IsNotEmpty()
    phone: string;

    projectId: number;
}
