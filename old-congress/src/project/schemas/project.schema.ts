import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { NeedyObject } from '../../needy/schemas/needy.schema';
import { CouponCardObject } from '../../needy/schemas/coupon-card.schema';
import { DocumentObject } from '../../needy/schemas/document.schema';
import { PaymentObject } from '../../needy/schemas/payment.schema';
import { StudentObject } from '../../needy/schemas/student.schema';
import { SupportRecommendationObject } from '../../needy/schemas/support-recommendation.schema';
import { CoordinatorObject } from '../../organization/schemas/coordinator.schema';
import { OrganizationObject } from '../../organization/schemas/organization.schema';
import { UserObject } from '../../users/schemas/user.schema';
import { Project } from '../../../shared/interfaces/project.interface';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { Coordinator } from '../../../shared/interfaces/coordinator.interface';
import { CouponCard } from '../../../shared/interfaces/coupon-card.interface';
import { Document } from '../../../shared/interfaces/document.interface';
import { Organization } from '../../../shared/interfaces/organization.interface';
import { Payment } from '../../../shared/interfaces/payment.interface';
import { Student } from '../../../shared/interfaces/student.interface';
import { SupportRecommendation } from '../../../shared/interfaces/support-recommendation.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { CommitteePersonObject } from '../../organization/schemas/committee-person.schema';
import { CommitteePerson } from '../../../shared/interfaces/committee-person.interface';

@Table
export class ProjectObject extends Model<Project> implements Project { 
    id: number;

    @Column
    name: string;

    @Column
    isActive: number;

    @HasMany(() => NeedyObject)
    needies?: Needy[];
    
    @HasMany(() => CouponCardObject)
    couponCards?: CouponCard[];
    
    @HasMany(() => DocumentObject)
    documents?: Document[];
    
    @HasMany(() => PaymentObject)
    payments?: Payment[];
    
    @HasMany(() => StudentObject)
    students?: Student[];
    
    @HasMany(() => SupportRecommendationObject)
    supportRecommendations?: SupportRecommendation[];
    
    @HasMany(() => CoordinatorObject)
    coordinators?: Coordinator[];

    @HasMany(() => OrganizationObject)
    organizations?: Organization[];

    @HasMany(() => CommitteePersonObject)
    committeePersons?: CommitteePerson[];

    @HasMany(() => UserObject)
    users?: User[];
}