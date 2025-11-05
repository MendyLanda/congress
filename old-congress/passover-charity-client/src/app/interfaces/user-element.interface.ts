import { OrganizationType } from "../../../../shared/enums/organization-type.enum";
import { UserRole } from "../../../../shared/enums/user-role.enum";
import { Person } from "../../../../shared/interfaces/person.interface";

export interface UserElement extends Partial<Person> {
    username: string;
    type: UserRole;
    committeePersons: string | null;
    organizationName: string | null;
    organizationAddress: string | null;
    organizationCity: string | null;
    organizationType: OrganizationType | null;
    organizationNo: string | null;
    isActive: number;
    canCreate: number;
}