import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Project } from '../../../shared/interfaces/project.interface';
import { StudentChild } from '../../../shared/interfaces/student-child.interface';
import { Student } from '../../../shared/interfaces/student.interface';
import { ProjectObject } from '../../project/schemas/project.schema';
import { StudentObject } from './student.schema';

@Table
export class StudentChildObject extends Model<StudentChild> implements StudentChild {
    id: number;

    @Column
    name: string;
    
    @Column
    ssn: string;
    
    @BelongsTo(() => StudentObject)
    student: Student;

    @ForeignKey(() => StudentObject)
    studentId?: number;

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}
