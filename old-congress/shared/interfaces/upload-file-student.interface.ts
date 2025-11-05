import { Coordinator } from "./coordinator.interface";

export interface UploadFilesStudent {
    ssn: string;
    needyId: number;
    document: any;
    fileName?: string;
}