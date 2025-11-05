import { BelongsTo, Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ProjectObject } from '../../project/schemas/project.schema';
import { UserObject } from 'src/users/schemas/user.schema';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { Organization } from '../../../shared/interfaces/organization.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { OrganizationObject } from './organization.schema';
import { Project } from '../../../shared/interfaces/project.interface';
import { CommitteePersonObject } from './committee-person.schema';
import { CommitteePerson } from '../../../shared/interfaces/committee-person.interface';

@Table
export class CoordinatorObject extends Model<Coordinator> implements Coordinator {

    id: number;

    @Column
    ssn: string;

    @Column
    address: string;

    @Column
    city: string;

    @ForeignKey(() => OrganizationObject)
    organizationId: number;
    
    @BelongsTo(() => OrganizationObject)
    organization?: Organization;
    
    @ForeignKey(() => UserObject)
    userId: number;
    
    @BelongsTo(() => UserObject)
    user?: User;

    @HasMany(() => CommitteePersonObject)
    committeePersons?: CommitteePerson[];

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}