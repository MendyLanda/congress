import { PaymentMethod } from "../enums/payment-method.enum";
import { CouponCard } from "./coupon-card.interface";
import { Needy } from "./needy.interface";
import { User } from "./user.interface";

export interface Payment {
    id?: number;
    date: Date;
    amount: number;
    type: PaymentMethod;
    receiver?: string;
    receiverSignatureDocId?: any;
    needyId: number;
    serialNumber?: string;
    needy?: Needy;
    userEnterId: number;
    userEnter?: User;
    cardId?: number;
    card?: CouponCard;
    projectId: number;
}