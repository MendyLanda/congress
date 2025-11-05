import { IsString, IsNotEmpty, IsEnum, IsNumber } from "class-validator";
import { OrganizationType } from "../../../shared/enums/organization-type.enum";
import { Organization } from "../../../shared/interfaces/organization.interface";

export class CreateOrganizationDto implements Organization {
    id: number;

    @IsString() @IsNotEmpty()
    name: string
    
    @IsString() @IsNotEmpty()
    address: string
    
    @IsString() @IsNotEmpty()
    city: string
    
    @IsString() @IsNotEmpty() @IsEnum(OrganizationType)
    type: OrganizationType
    
    @IsString() @IsNotEmpty()
    organizationNo: string;

    @IsNumber() @IsNotEmpty()
    projectId: number;
}
