import { UserRole } from "../enums/user-role.enum";
import { Coordinator } from "./coordinator.interface";

export interface User {
    id?: number;
    username: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: number;
    canCreate: number;
    coordinator?: Coordinator;
    projectId: number;
}