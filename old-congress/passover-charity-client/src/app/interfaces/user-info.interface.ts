import { UserRole } from "../../../../shared/enums/user-role.enum";
import { Coordinator } from "../../../../shared/interfaces/coordinator.interface";

export interface UserInfo {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    coordinator?: Coordinator;
    canCreate: number;
    projectId: number;
}