import { KollelType } from "../enums/kollel-type.enum"
import { StudentChild } from "./student-child.interface"

export interface Student {
    id?: number;
    kollelName: string;
    headOfTheKollelName: string;
    headOfTheKollelPhone: string;
    kollelType: KollelType;
    ssnWife: string;
    firstNameWife: string;
    lastNameWife: string;
    studentChildren?: StudentChild[];
    needyId?: number;
    projectId: number;
}


 