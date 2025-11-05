import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Project } from '../../../shared/interfaces/project.interface';
import { NeedyObject } from '../../needy/schemas/needy.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { OrganizationType } from '../../../shared/enums/organization-type.enum';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { Organization } from '../../../shared/interfaces/organization.interface';
import { CoordinatorObject } from './coordinator.schema';

@Table
export class OrganizationObject extends Model<Organization> implements Organization {
    // @PrimaryKey
    // @AutoIncrement
    // @Column
    id: number;

    @Column
    name: string
    
    @Column
    address: string
    
    @Column
    city: string
    
    @Column(DataType.ENUM(...Object.values(OrganizationType)))
    type: OrganizationType
    
    @Column
    organizationNo: string
    
    @HasMany(() => CoordinatorObject)
    coordinators?: Coordinator[];

    @HasMany(() => NeedyObject)
    needies: Needy[];
    
    @ForeignKey(() => ProjectObject)
    projectId: number;

    @BelongsTo(() => ProjectObject)
    project?: Project;
}