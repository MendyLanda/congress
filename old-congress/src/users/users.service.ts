import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UserPayload } from 'src/interfaces/user-payload.interface';
import { OrganizationService } from 'src/organization/organization.service';
import { CommitteePersonObject } from 'src/organization/schemas/committee-person.schema';
import { CoordinatorObject } from 'src/organization/schemas/coordinator.schema';
import { OrganizationObject } from 'src/organization/schemas/organization.schema';
import { sha512 } from 'src/utils/sha512';
import { UserRole } from '../../shared/enums/user-role.enum';
import { User } from '../../shared/interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserObject } from './schemas/user.schema';

@Injectable()
export class UsersService {

    constructor(
        private organizationService: OrganizationService,
        @InjectModel(UserObject)
        private userRepository: typeof UserObject,
    ) { }

    async findAll(projectId: number): Promise<User[]> {
        return await this.userRepository.findAll({
            where: { projectId, id: { [Op.ne]: process.env.AVRECH_USER_ID } },
            include: [
                {
                    model: CoordinatorObject, as: "coordinator", include: [
                        { model: OrganizationObject, as: "organization" },
                        { model: CommitteePersonObject, as: "committeePersons" }
                    ]
                },
            ], attributes: ["id", "username", "role", "firstName", "lastName", "phone", "canCreate", "isActive"]
        });
    }

    async findOne(username: string): Promise<User | undefined> {
        return await this.userRepository.findOne({
            where: { username, isActive: 1 }, include: [
                { model: CoordinatorObject, as: "coordinator" }
            ]
        });
    }

    async findOneById(id: number, user: UserPayload) {
        if (user.role[0] != UserRole.manager && id != user.id) {
            throw new ForbiddenException();
        } else {
            return await this.userRepository.findByPk(id, {
                include: [
                    { model: CoordinatorObject, as: "coordinator", include: [{ model: CommitteePersonObject, as: "committeePersons" }] },
                ], attributes: ["id", "username", "role", "firstName", "lastName", "phone", "canCreate", "isActive"]
            })
        }
    }

    async registerUser(newUser: CreateUserDto) {
        await this.validateUserName(newUser.username);

        newUser.password = sha512(newUser.password);

        if (newUser.projectId != newUser.coordinator?.projectId ||
            newUser.projectId != newUser.coordinator?.organization?.projectId) {
            throw new BadRequestException("Project id's don't match");
        }

        const user = await this.userRepository.create({
            username: newUser.username,
            password: newUser.password,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            isActive: 0,
            projectId: newUser.projectId,
            role: UserRole.coordinator
        });

        const organization = await this.organizationService.createOrganization({
            ...newUser.coordinator.organization,
            projectId: newUser.projectId
        });
        const coordinator = await this.organizationService.createCoordinator({
            ...newUser.coordinator,
            organizationId: organization.id,
            userId: user.id,
            projectId: newUser.projectId
        })

        return true;
    }

    async createUser(newUser: CreateUserDto) {
        await this.validateUserName(newUser.username);
        newUser.password = sha512(newUser.password);
        return await this.userRepository.create({ ...newUser, isActive: 1 });
    }

    async updateUser(id: number, userToUpdate: Partial<CreateUserDto>) {
        return await this.userRepository.update(userToUpdate, { where: { id } });
    }

    async approveUser(id: number) {
        return await this.userRepository.update({ isActive: 1, canCreate: 1 }, { where: { id } });
    }

    async deleteUser(id: number) {
        return await this.userRepository.destroy({ where: { id } });
    }

    async isUsernameValid(username: string) {
        const user = await this.userRepository.findOne({ where: { username } });
        return !user;
    }

    validateUserName = async (username: string) => {
        if (!(await this.isUsernameValid(username))) {
            throw new BadRequestException(null, "שם היוזר כבר תפוס");
        }
    }
}