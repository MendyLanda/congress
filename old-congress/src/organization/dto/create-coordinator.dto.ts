import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidateNested } from 'class-validator';
import { IsraeliSSN } from 'src/db-utils/ssn.validator';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { CreateCommitteePersonDto } from './create-committee-person.dto';
import { CreateOrganizationDto } from './create-organization.dto';

export class CreateCoordinatorDto implements Coordinator {
    id: number;

    @IsString() @IsNotEmpty() @Validate(IsraeliSSN)
    ssn: string;

    @IsString() @IsNotEmpty()
    address: string;

    @IsString() @IsNotEmpty()
    city: string;

    @IsNumber() @IsOptional()
    organizationId: number;

    @IsNumber() @IsOptional()
    userId: number;

    @ValidateNested() @IsOptional()
    @Type(() => CreateOrganizationDto)
    organization?: CreateOrganizationDto;

    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => CreateCommitteePersonDto)
    committeePersons: CreateCommitteePersonDto[];

    @IsNumber()
    projectId: number;
}
