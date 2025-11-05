import { IsDataURI, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, ValidateIf } from 'class-validator';
import { PaymentMethod } from '../../../shared/enums/payment-method.enum';
import { Payment } from '../../../shared/interfaces/payment.interface';


export class CreatePaymentDto implements Payment {
    id: number;

    @IsNumber() @IsNotEmpty()
    needyId: number;

    @IsDateString() @IsNotEmpty()
    date: Date;

    @IsNumber() @IsNotEmpty()
    amount: number;

    @IsString() @IsNotEmpty() @IsEnum(PaymentMethod)
    type: PaymentMethod;

    @IsString() @IsOptional()
    receiver?: string;

    @IsDataURI() @IsOptional()
    receiverSignature?: any;

    @ValidateIf(o => o.type === PaymentMethod.Coupon)
    @IsString()
    @IsNotEmpty()
    serialNumber?: string;

    @ValidateIf(o => o.type === PaymentMethod.Card)
    @IsNumber()
    @IsNotEmpty()
    cardId?: number;
      
    @IsNumber() @IsNotEmpty()
    projectId: number;

    userEnterId: number;
}