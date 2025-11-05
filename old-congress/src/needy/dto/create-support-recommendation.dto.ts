import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { SupportRecommendation } from '../../../shared/interfaces/support-recommendation.interface';


export class CreateSupportRecommendationDto implements Partial<SupportRecommendation> {
    id: number;
    
    @IsNumber() @IsNotEmpty() @IsOptional() 
    needyId: number;
    
    @IsNumber() @IsNotEmpty()
    sum: number;

    @IsNumber() @IsNotEmpty()
    projectId: number;
}