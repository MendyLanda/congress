import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '../../shared/interfaces/project.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectObject } from './schemas/project.schema';


@Injectable()
export class ProjectService {

    constructor(
        @InjectModel(ProjectObject)
        private projectRepository: typeof ProjectObject,
    ) { }

    async findAll(): Promise<Project[]> {
        return await this.projectRepository.findAll();
    }

    async findOneById(id: number) {
        return await this.projectRepository.findByPk(id)
    }

    async create(newProject: CreateProjectDto) {
        return await this.projectRepository.create({ ...newProject, isActive: 1 });
    }

    async update(id: number, projectToUpdate: Partial<CreateProjectDto>) {
        return await this.projectRepository.update(projectToUpdate, { where: { id } });
    }

    async delete(id: number) {
        return await this.projectRepository.destroy({ where: { id } });
    }
}