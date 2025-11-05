import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CouponCardObject } from 'src/needy/schemas/coupon-card.schema';
import { NeedyObject } from 'src/needy/schemas/needy.schema';
import { PaymentObject } from 'src/needy/schemas/payment.schema';
import { UserObject } from 'src/users/schemas/user.schema';

@Injectable()
export class PaymentService {

  constructor(
    @InjectModel(PaymentObject)
    private paymentRepository: typeof PaymentObject,
  ) { }

  async findAllWithAssociations(projectId: number) {
    return await this.paymentRepository.findAll({
      where: { projectId },
      include: [
        { model: NeedyObject, as: "needy" },
        { model: UserObject, as: "userEnter", attributes: ["id", "firstName", "lastName"] },
        { model: CouponCardObject, as: "card" },
      ]
    })
  }

}
