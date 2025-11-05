import { Injectable } from '@nestjs/common';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InjectModel } from '@nestjs/sequelize';
import { OrganizationObject } from './schemas/organization.schema';
import { CoordinatorObject } from './schemas/coordinator.schema';
import { CommitteePerson } from '../../shared/interfaces/committee-person.interface';
import { CommitteePersonObject } from './schemas/committee-person.schema';

@Injectable()
export class OrganizationService {

  constructor(
    @InjectModel(OrganizationObject)
    private organizationRepository: typeof OrganizationObject,
    @InjectModel(CoordinatorObject)
    private coordinatorRepository: typeof CoordinatorObject,
    @InjectModel(CommitteePersonObject)
    private committeePersonRepository: typeof CommitteePersonObject,
  ) { }

  async findOrganization(id: number) {
    return await this.organizationRepository.findOne({
      where: { id }, include: [
        { model: CoordinatorObject, as: "coordinators", include: [{ model: CommitteePersonObject, as: "committeePersons" }] }
      ]
    });
  }

  async createOrganization(createOrganizationDto: CreateOrganizationDto) {
    return await this.organizationRepository.create(createOrganizationDto);
  }

  async updateOrganization(id: number, updateOrganizationDto: CreateOrganizationDto) {
    return await this.organizationRepository.update(updateOrganizationDto, { where: { id } });
  }

  async deleteOrganization(id: number) {
    return await this.organizationRepository.destroy({ where: { id } });
  }

  //-- Coordinator --//

  async findCoordinator(id: number) {
    return await this.organizationRepository.findOne({ where: { id }, include: [{ model: CommitteePersonObject, as: "committeePersons" }] });
  }

  async createCoordinator(createCoordinatorDto: CreateCoordinatorDto) {
     const coordinator = await this.coordinatorRepository.create(createCoordinatorDto);

     for (let committeePerson of createCoordinatorDto.committeePersons) {
       committeePerson.coordinatorId = coordinator.id;
       committeePerson.projectId = coordinator.projectId;
       await this.committeePersonRepository.create(committeePerson);
     }

     return coordinator;
  }

  async updateCoordinator(id: number, updateCoordinatorDto: CreateCoordinatorDto) {
    return await this.coordinatorRepository.update(updateCoordinatorDto, { where: { id } });
  }

  async deleteCoordinator(id: number) {
    return await this.coordinatorRepository.destroy({ where: { id } });
  }

  // -- Committee Person -- //

  async create(committeePerson: CommitteePerson) {
    return await this.committeePersonRepository.create(committeePerson);    
  }
}
