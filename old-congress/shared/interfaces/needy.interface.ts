import { NeedyType } from "../enums/needy-type.enum"
import { Person } from "./person.interface"
import { Payment } from "./payment.interface"
import { SupportRecommendation } from "./support-recommendation.interface"
import { Student } from "./student.interface"
import { User } from "./user.interface"
import { Organization } from "./organization.interface"
import { MaritalStatus } from "../enums/marital-status.enum"

export interface Needy extends Person {
    creatorId: number;
    organizationId?: number;
    type: NeedyType;
    description?: string;
    messages?: string;
    numberOfPersons: number;
    maritalStatus: MaritalStatus;
    newDocs?: number;
    lastYearStatus?: number;

    bankNo?: number;
    bankBranchNo?: number;
    bankAccountNo?: number;

    documents: any[];
    student?: Student;
    recommendations: SupportRecommendation[];
    payments?: Payment[];
    creator?: User;
    organization?: Organization;
    projectId: number;
}

