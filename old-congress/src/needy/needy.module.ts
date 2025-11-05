import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { NeedyController } from './needy.controller';
import { NeedyService } from './needy.service';
import { DocumentObject } from './schemas/document.schema';
import { NeedyObject } from './schemas/needy.schema';
import { PaymentObject } from './schemas/payment.schema';
import { SupportRecommendationObject } from './schemas/support-recommendation.schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentObject } from './schemas/student.schema';
import { UserObject } from 'src/users/schemas/user.schema';
import { CouponCardObject } from './schemas/coupon-card.schema';
import { StudentChildObject } from './schemas/student-child.schema';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      NeedyObject,
      PaymentObject,
      SupportRecommendationObject, 
      DocumentObject, 
      StudentObject, 
      UserObject, 
      CouponCardObject,
      StudentChildObject
    ]),
  ],
  controllers: [NeedyController],
  providers: [
    NeedyService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
   
  ]
})
export class NeedyModule { }
