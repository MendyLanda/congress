import { Person } from "../../../../shared/interfaces/person.interface";
import { UserRole } from "../../../../shared/enums/user-role.enum";
import { NeedyType } from "../../../../shared/enums/needy-type.enum"
import { MaritalStatus } from "../../../../shared/enums/marital-status.enum";
import { Payment } from "../../../../shared/interfaces/payment.interface";
import { PaymentMethod } from "../../../../shared/enums/payment-method.enum";

export interface PaymentElement {
    id: number;
    cardId: number
    cardSerialNumber: string;
    date: string;
    amount: number;
    type: PaymentMethod;
    needySsn: string;
    needyFirstName: string;
    needyLastName: string;
    needyCity: string;
    coordinatorName: string;
}