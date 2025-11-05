import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { Project } from '../../../shared/interfaces/project.interface';
import { NeedyObject } from '../../needy/schemas/needy.schema';
import { CoordinatorObject } from '../../organization/schemas/coordinator.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { User } from '../../../shared/interfaces/user.interface';

@Table
export class UserObject extends Model<User> implements User { 
    id: number;

    @Column
    username: string;

    @Column
    password: string;
    
    @Column(DataType.ENUM(...Object.values(UserRole)))
    role: UserRole;
    
    @Column
    firstName: string;

    @Column
    lastName: string;

    @Column
    phone: string;

    @Column
    isActive: number;

    @Column
    canCreate: number;

    @HasOne(() => CoordinatorObject)
    coordinator?: Coordinator;

    @HasMany(() => NeedyObject)
    needies: Needy[];

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}