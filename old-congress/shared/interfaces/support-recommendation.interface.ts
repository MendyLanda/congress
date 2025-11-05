import { UserRole } from "../enums/user-role.enum";
import { User } from "./user.interface";

export interface SupportRecommendation {
    id?: number;
    sum: number;
    needyId?: number;
    recommendDate: Date;
    recommenderType: UserRole;
    recommenderId: number;
    recommender?: User;
    projectId: number;
}