import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectService } from './project.service';


@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Public()
  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Post()
  @Roles(UserRole.manager)
  create(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    return this.projectService.create(createProjectDto);
  }


  @Patch(':id')
  @Roles(UserRole.manager)
  update(@Param('id') id: string, @Body() updateProjectDto: Partial<CreateProjectDto>) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.manager)
  delete(@Param('id') id: string) {
    return this.projectService.delete(+id);
  }
}

