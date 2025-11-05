import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectObject } from './schemas/project.schema';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([ProjectObject])
  ],
  providers: [
    ProjectService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [ProjectController],
  exports: [ProjectService]
})
export class ProjectModule { }
