import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { CreateCoordinatorDto } from '../../organization/dto/create-coordinator.dto';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { User } from '../../../shared/interfaces/user.interface';

export class CreateUserDto implements User { 
    id: number;

    @IsString() @IsNotEmpty()
    username: string;

    @IsString() @IsNotEmpty()
    password: string;
    
    @IsString() @IsNotEmpty() @IsEnum(UserRole) @IsOptional()
    role: UserRole;

    @IsString() @IsNotEmpty()
    firstName: string;

    @IsString() @IsNotEmpty()
    lastName: string;

    @IsString() @IsOptional()
    phone: string;

    @ValidateNested() @IsOptional()
    @Type(() => CreateCoordinatorDto)
    coordinator?: CreateCoordinatorDto;

    @IsNumber()
    @ValidateIf(o => o.role != UserRole.manager)
    @IsNotEmpty()
    projectId: number;

    isActive: number;
    canCreate: number;
}