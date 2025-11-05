import { Coordinator } from "./coordinator.interface";

export interface CommitteePerson {
    id?: number;
    ssn: string;
    name: string;
    phone: string;
    coordinatorId: number;
    coordinator?: Coordinator;
    projectId: number;
}