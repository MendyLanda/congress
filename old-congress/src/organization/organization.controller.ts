import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }


  @Get(':id')
  @Roles(UserRole.manager)
  findOrganization(@Param('id') id: string) {
    return this.organizationService.findOrganization(+id);
  }

  @Post()
  @Roles(UserRole.manager)
  createOrganization(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(createOrganizationDto);
  }

  @Patch(':id')
  @Roles(UserRole.manager)
  updateOrganization(@Param('id') id: string, @Body() updateOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.updateOrganization(+id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.manager)
  deleteOrganization(@Param('id') id: string) {
    return this.organizationService.deleteOrganization(+id);
  }

  @Get('coordinator/:id')
  @Roles(UserRole.manager)
  findCoordinator(@Param('id') id: string) {
    return this.organizationService.findCoordinator(+id);
  }

  @Post('coordinator')
  @Roles(UserRole.manager)
  createCoordinator(@Body() createCoordinatorDto: CreateCoordinatorDto) {
    return this.organizationService.createCoordinator(createCoordinatorDto);
  }

  @Patch('coordinator/:id')
  @Roles(UserRole.manager)
  updateCoordinator(@Param('id') id: string, @Body() updateCoordinatorDto: CreateCoordinatorDto) {
    return this.organizationService.updateCoordinator(+id, updateCoordinatorDto);
  }

  @Delete('coordinator/:id')
  @Roles(UserRole.manager)
  deleteCoordinator(@Param('id') id: string) {
    return this.organizationService.deleteCoordinator(+id);
  }
}
