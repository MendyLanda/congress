import { Transform } from 'class-transformer';
import { IsDataURI, IsNotEmpty, IsNumber, IsOptional, IsString,  } from 'class-validator';
import {Document} from "../../../shared/interfaces/document.interface";

export class CreateDocumentDto implements Document {
    id: number;

    @IsString() @IsNotEmpty()
    fileName: string;
  
    @IsString() @IsOptional()
    ssn: string;
    
    // @IsDataURI()
    doc: any;
    
    @Transform(({ value }) => parseInt(value))
    @IsNumber() @IsNotEmpty()
    needyId: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber() @IsOptional()
    paymentId: number;
      
    @Transform(({ value }) => parseInt(value))
    @IsNumber() @IsNotEmpty()
    projectId: number;
}