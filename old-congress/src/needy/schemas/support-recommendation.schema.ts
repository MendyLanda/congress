import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserObject } from 'src/users/schemas/user.schema';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { SupportRecommendation } from '../../../shared/interfaces/support-recommendation.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { NeedyObject } from './needy.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { Project } from '../../../shared/interfaces/project.interface';


@Table
export class SupportRecommendationObject extends Model<SupportRecommendation> implements SupportRecommendation {
    id: number;

    @Column
    sum: number;

    @Column
    recommendDate: Date;

    @Column(DataType.ENUM(...Object.values(UserRole)))
    recommenderType: UserRole;

    @ForeignKey(() => UserObject)
    recommenderId: number;

    @BelongsTo(() => UserObject)
    recommender: User;

    @BelongsTo(() => NeedyObject)
    needy?: Needy

    @ForeignKey(() => NeedyObject)
    needyId: number;
    
    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}