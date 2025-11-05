import { AllowNull, BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { UserObject } from 'src/users/schemas/user.schema';
import { PaymentMethod } from '../../../shared/enums/payment-method.enum';
import { Needy } from '../../../shared/interfaces/needy.interface';
import { Payment } from '../../../shared/interfaces/payment.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { CouponCardObject } from './coupon-card.schema';
import { DocumentObject } from './document.schema';
import { NeedyObject } from './needy.schema';
import { ProjectObject } from '../../project/schemas/project.schema';
import { Project } from '../../../shared/interfaces/project.interface';


@Table
export class PaymentObject extends Model<Payment> implements Payment {
    id: number;

    @Column
    date: Date;

    @Column
    amount: number;

    @Column(DataType.ENUM(...Object.values(PaymentMethod)))
    type: PaymentMethod;

    @AllowNull
    @Column
    receiver: string;

    @ForeignKey(() => DocumentObject)
    receiverSignatureDocId: number;

    @BelongsTo(() => DocumentObject)
    receiverSignatureDoc: DocumentObject;

    @AllowNull
    @Column
    serialNumber: string;

    @BelongsTo(() => NeedyObject)
    needy: Needy;

    @ForeignKey(() => NeedyObject)
    needyId: number;

    @ForeignKey(() => UserObject)
    userEnterId: number;

    @BelongsTo(() => UserObject)
    userEnter: User;

    // @ForeignKey(() => CouponCardObject)
    // cardId?: number;

    @HasOne(() => CouponCardObject)
    card: CouponCardObject;

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}
