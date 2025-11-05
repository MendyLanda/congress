import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CouponCardObject } from 'src/needy/schemas/coupon-card.schema';
import { NeedyObject } from 'src/needy/schemas/needy.schema';
import { PaymentObject } from 'src/needy/schemas/payment.schema';
import { UserObject } from 'src/users/schemas/user.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      NeedyObject,
      PaymentObject,
      UserObject, 
      CouponCardObject
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
