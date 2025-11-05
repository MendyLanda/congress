import { OrganizationType } from "../enums/organization-type.enum";
import { Coordinator } from "./coordinator.interface";

export interface Organization {
    id?: number;
    name: string;
    address: string;
    city: string;
    type: OrganizationType;
    organizationNo: string;
    coordinators?: Coordinator[];
    projectId: number;
}