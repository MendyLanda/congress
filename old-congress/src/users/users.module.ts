import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserObject } from './schemas/user.schema';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { OrganizationService } from 'src/organization/organization.service';
import { CoordinatorObject } from 'src/organization/schemas/coordinator.schema';
import { OrganizationObject } from 'src/organization/schemas/organization.schema';
import { UserController } from './user.controller';
import { HttpModule } from  '@nestjs/axios';
import { CommitteePersonObject } from 'src/organization/schemas/committee-person.schema';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([UserObject, OrganizationObject, CoordinatorObject, CommitteePersonObject])
  ],
  providers: [
    UsersService,
    OrganizationService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [UserController],
  exports: [UsersService]
})
export class UsersModule { }
