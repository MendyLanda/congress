import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ProjectObject } from '../../project/schemas/project.schema';
import { UserObject } from 'src/users/schemas/user.schema';
import { CommitteePerson } from '../../../shared/interfaces/committee-person.interface';
import { Organization } from '../../../shared/interfaces/organization.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { OrganizationObject } from './organization.schema';
import { Project } from '../../../shared/interfaces/project.interface';
import { Coordinator } from 'shared/interfaces/coordinator.interface';
import { CoordinatorObject } from './coordinator.schema';

@Table
export class CommitteePersonObject extends Model<CommitteePersonObject> implements CommitteePerson {
    id: number;

    @Column
    ssn: string;

    @Column
    name: string;

    @Column
    phone: string;
    
    @ForeignKey(() => CoordinatorObject)
    coordinatorId: number;
    
    @BelongsTo(() => CoordinatorObject)
    coordinator?: Coordinator;

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}