import { CommitteePerson } from "./committee-person.interface";
import { Organization } from "./organization.interface";
import { User } from "./user.interface";

export interface Coordinator {
    id?: number;
    ssn: string;
    address: string;
    city: string;
    organizationId: number;
    organization?: Organization;
    userId: number;
    user?: User;
    projectId: number;
    committeePersons?: CommitteePerson[];
}