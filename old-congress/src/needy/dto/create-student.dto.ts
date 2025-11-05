import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, ValidateNested, ArrayMaxSize, Validate } from 'class-validator';
import { KollelType } from 'shared/enums/kollel-type.enum';
import { StudentChild } from 'shared/interfaces/student-child.interface';
import { Student } from '../../../shared/interfaces/student.interface';
import { CreateDocumentDto } from './create-document.dto';
import { CreateStudentChildDto } from './create-student-child.dto';


export class CreateStudentDto implements Student{
    id: number;

    @IsEnum(KollelType) @IsOptional()
    kollelType: KollelType;
    
    @IsString() @IsOptional()
    ssnWife: string;
    
    @IsString() @IsOptional()
    firstNameWife: string;
    
    @IsString() @IsOptional()
    lastNameWife: string;
    
    @ValidateNested({ each: true }) // TODO: size by number of children
    @Type(() => CreateStudentChildDto)
    studentChildren?: StudentChild[];

    @IsString() 
    kollelName: string;

    @IsString() 
    headOfTheKollelName: string;

    @IsString() 
    headOfTheKollelPhone: string;

    @IsNumber() @IsNotEmpty() @IsOptional()
    needyId: number;
      
    @IsNumber() @IsNotEmpty()
    projectId: number;
}