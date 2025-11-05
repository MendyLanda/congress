import { MaritalStatus } from "../../../../shared/enums/marital-status.enum";
import { Student } from "../../../../shared/interfaces/student.interface";
import { NeedyElement } from "./needy-element.interface";

export interface NeedyForm extends NeedyElement, Partial<Student> {
    confirmationDocument: any,
    description?: string,
    numberOfPersons: number;
    maritalStatus: MaritalStatus;
    localCommunityRecommendationSum?: number,
    welfareDepartmentRecommendationSum?: number,
    projectId: number;
}
