import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidateIf, ValidateNested } from 'class-validator';
import { MaritalStatus } from 'shared/enums/marital-status.enum';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { NeedyType } from '../../../shared/enums/needy-type.enum';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { Student } from '../../../shared/interfaces/student.interface';
import { SupportRecommendation } from '../../../shared/interfaces/support-recommendation.interface';
import { CreateDocumentDto } from './create-document.dto';
import { CreatePaymentDto } from './create-payment.dto';
import { CreateStudentDto } from './create-student.dto';
import { CreateSupportRecommendationDto } from './create-support-recommendation.dto';


export class CreateNeedyDto implements Needy {
    id: number;

    @IsString() @IsNotEmpty() @Validate(IsraeliSSN)
    ssn: string;

    @IsString() @IsNotEmpty()
    firstName: string;

    @IsString() @IsNotEmpty()
    lastName: string;

    @IsString() @IsNotEmpty()
    phone: string;

    @IsString()
    mobilePhone: string;
    
    @ValidateIf(o => o.type === NeedyType.Young)
    @IsString()
    email: string;

    @IsNumber() @IsNotEmpty()
    numberOfPersons: number;

    @IsString() @IsNotEmpty() @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus;

    @IsString() @IsNotEmpty()
    address: string;

    @IsString() @IsNotEmpty()
    city: string;

    @IsNumber() @IsNotEmpty()
    creatorId: number;

    @IsNumber() @IsOptional()
    organizationId: number;

    @IsString() @IsNotEmpty() @IsEnum(NeedyType)
    type: NeedyType;
  
    @IsNumber() @IsNotEmpty()
    projectId: number;

    @IsString() @IsOptional()
    description?: string;

    @IsString() @IsOptional()
    messages?: string;

    @ValidateNested({ each: true })
    @Type(() => CreateDocumentDto)
    documents: any[];

    @ValidateNested({ each: true })
    @Type(() => CreateSupportRecommendationDto)
    recommendations: SupportRecommendation[];

    @ValidateNested({ each: true })
    @Type(() => CreatePaymentDto)
    payments: CreatePaymentDto[];

    @ValidateNested({ each: true })
    @Type(() => CreateStudentDto)
    student?: Student;

    newDocs: number;
}