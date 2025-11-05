import { UserRole } from "../../shared/enums/user-role.enum";

export interface UserPayload {
    username: string,
    role: UserRole[],
    projectId: number,
    id: number,
}