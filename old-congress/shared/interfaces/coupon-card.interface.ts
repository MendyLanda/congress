import { Payment } from "./payment.interface";

export interface CouponCard {
    id: number
    cardId: number;
    serialNumber: string;
    value: number;
    paymentId?: number;
    projectId: number;
} 