import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NeedyModule } from './needy/needy.module';
import { DocumentObject } from './needy/schemas/document.schema';
import { NeedyObject } from './needy/schemas/needy.schema';
import { PaymentObject } from './needy/schemas/payment.schema';
import { StudentObject } from './needy/schemas/student.schema';
import { SupportRecommendationObject } from './needy/schemas/support-recommendation.schema';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { CoordinatorObject } from './organization/schemas/coordinator.schema';
import { OrganizationObject } from './organization/schemas/organization.schema';
import { UserObject } from './users/schemas/user.schema';
import { CouponCardObject } from './needy/schemas/coupon-card.schema';
import { PaymentModule } from './payment/payment.module';
import { HttpModule } from  '@nestjs/axios';
import { ProjectObject } from './project/schemas/project.schema';
import { ProjectModule } from './project/project.module';
import { CommitteePersonObject } from './organization/schemas/committee-person.schema';
import { StudentChildObject } from './needy/schemas/student-child.schema';

@Module({
  imports: [
    NeedyModule,
    AuthModule,
    UsersModule,
    ProjectModule,
    HttpModule,
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, 'client', 'passover-charity-client'), }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      port: 5432,
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      models: [NeedyObject, PaymentObject, SupportRecommendationObject, DocumentObject, StudentObject, UserObject, CoordinatorObject, OrganizationObject, CouponCardObject, ProjectObject, CommitteePersonObject, StudentChildObject],
      // synchronize: true,
      logging: false,
      // query: { raw: true },
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        }
      }
    }),
    OrganizationModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
