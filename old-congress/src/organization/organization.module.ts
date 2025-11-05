import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationObject } from './schemas/organization.schema';
import { CoordinatorObject } from './schemas/coordinator.schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommitteePersonObject } from './schemas/committee-person.schema';

@Module({
  imports: [
    SequelizeModule.forFeature([OrganizationObject, CoordinatorObject, CommitteePersonObject])
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService]
})
export class OrganizationModule {}
