import { BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ProjectObject } from '../../project/schemas/project.schema';
import { CouponCard } from '../../../shared/interfaces/coupon-card.interface';
import { PaymentObject } from './payment.schema';
import { Project } from '../../../shared/interfaces/project.interface';
@Table
export class CouponCardObject extends Model<CouponCard> implements CouponCard {
    @PrimaryKey
    @Column
    id: number;

    @Column
    cardId: number;

    @Column
    value: number;

    @Column
    serialNumber: string;

    @ForeignKey(() => PaymentObject)
    paymentId: number;
    
    @BelongsTo(() => PaymentObject)
    payment?: PaymentObject;

    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}
