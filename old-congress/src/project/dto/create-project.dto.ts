import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Project } from "../../../shared/interfaces/project.interface";

export class CreateProjectDto implements Project { 
    id: number;

    @IsString() @IsNotEmpty()
    name: string;

    @IsBoolean()
    isActive: number;
}