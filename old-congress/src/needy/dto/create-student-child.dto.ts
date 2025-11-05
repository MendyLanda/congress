import { IsString, IsNotEmpty, IsNumber, IsOptional, Validate } from 'class-validator';
import { IsraeliSSN } from '../../db-utils/ssn.validator';
import { StudentChild } from '../../../shared/interfaces/student-child.interface';


export class CreateStudentChildDto implements StudentChild {
    id: number;
    studentId?: number;

    @IsString() @IsNotEmpty()
    name: string;

    @IsString() @Validate(IsraeliSSN) @IsNotEmpty()
    ssn: string;

    @IsNumber() @IsNotEmpty()
    projectId: number;
}