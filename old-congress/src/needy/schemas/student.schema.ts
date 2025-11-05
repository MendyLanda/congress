import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { KollelType } from '../../../shared/enums/kollel-type.enum';
import { Student } from '../../../shared/interfaces/student.interface';
import { NeedyObject } from './needy.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { Project } from '../../../shared/interfaces/project.interface';
import { StudentChildObject } from './student-child.schema';
import { StudentChild } from '../../../shared/interfaces/student-child.interface';

@Table
export class StudentObject extends Model<Student> implements Student {
    id: number;

    @Column
    kollelName: string;

    @Column
    headOfTheKollelName: string;

    @Column
    headOfTheKollelPhone: string;

    @Column(DataType.ENUM(...Object.values(KollelType)))
    kollelType: KollelType;

    @Column
    ssnWife: string;

    @Column
    firstNameWife: string;

    @Column
    lastNameWife: string;

    @HasMany(() => StudentChildObject)
    studentChildren: StudentChild[];
    
    @BelongsTo(() => NeedyObject)
    needy: NeedyObject

    @ForeignKey(() => NeedyObject)
    needyId?: number;

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}
