import { AllowNull, BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { MaritalStatus } from 'shared/enums/marital-status.enum';
import { Project } from 'shared/interfaces/project.interface';
import { OrganizationObject } from '../../organization/schemas/organization.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { UserObject } from '../../users/schemas/user.schema';
import { NeedyType } from '../../../shared/enums/needy-type.enum';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { Organization } from '../../../shared/interfaces/organization.interface';
import { Payment } from '../../../shared/interfaces/payment.interface';
import { SupportRecommendation } from '../../../shared/interfaces/support-recommendation.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { DocumentObject } from './document.schema';
import { PaymentObject } from './payment.schema';
import { StudentObject } from './student.schema';
import { SupportRecommendationObject } from './support-recommendation.schema';

@Table
export class NeedyObject extends Model<Needy> implements Needy {
    id: number;

    @Column
    ssn: string;

    @Column
    firstName: string;

    @Column
    lastName: string;

    @Column
    phone: string;

    @Column
    mobilePhone: string;

    @AllowNull
    @Column
    email: string;

    @Column
    address: string;

    @Column
    city: string;

    @Column
    numberOfPersons: number;

    @Column(DataType.ENUM(...Object.values(MaritalStatus)))
    maritalStatus: MaritalStatus;

    @ForeignKey(() => UserObject)
    creatorId: number;

    @BelongsTo(() => UserObject)
    creator?: User;

    @ForeignKey(() => OrganizationObject)
    organizationId: number;

    @BelongsTo(() => OrganizationObject)
    organization?: Organization;

    @Column(DataType.ENUM(...Object.values(NeedyType)))
    type: NeedyType;

    @Column
    description?: string;

    @Column
    messages?: string;

    @Column
    newDocs?: number;

    @Column
    bankNo?: number;

    @Column
    bankBranchNo?: number;

    @Column
    bankAccountNo?: number;

    @AllowNull
    @Column
    lastYearStatus: number;
    
    @HasMany(() => DocumentObject)
    documents: any[];

    @HasMany(() => SupportRecommendationObject)
    recommendations: SupportRecommendation[];

    @HasMany(() => PaymentObject)
    payments: Payment[];

    @HasOne(() => StudentObject)
    student?: StudentObject;

    @ForeignKey(() => ProjectObject)
    projectId: number;

    @BelongsTo(() => ProjectObject)
    project?: Project;
}