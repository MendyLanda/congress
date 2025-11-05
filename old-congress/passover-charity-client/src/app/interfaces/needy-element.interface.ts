import { Person } from "../../../../shared/interfaces/person.interface";
import { UserRole } from "../../../../shared/enums/user-role.enum";
import { NeedyType } from "../../../../shared/enums/needy-type.enum"
import { MaritalStatus } from "../../../../shared/enums/marital-status.enum";
import { Payment } from "../../../../shared/interfaces/payment.interface";
import { RequestStatus } from "../enums/request-status.enum";
import { LastYearStatus } from "../enums/last-year-status.enum";

export interface NeedyElement extends Person {
    needyType: NeedyType;
    numberOfPersons: number;
    maritalStatus: MaritalStatus;
    creatorString: string | null;
    ssnDocument?: any;
    confirmationDocument?: any;
    supportAmount: number;
    lastRecommender: UserRole;
    action: any;
    payments?: Payment[];
    newDocs?: number;
    requestStatus: RequestStatus;
    lastYearStatus?: LastYearStatus;
    bankNo?: number;
    bankBranchNo?: number;
    bankAccountNo?: number;
    ssnWife?: string;

    // temp for 2025
    isBankAccountExist?: "כן" | "לא";
}