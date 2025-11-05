import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { sha512 } from 'src/utils/sha512';
import { User } from '../../shared/interfaces/user.interface';
import { UserPayload } from 'src/interfaces/user-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && user.password === sha512(pass)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async managerLogin(user: User) {
        const payload: UserPayload = { 
            username: user.username,
            role: [user.role],
            id: user.id,
            projectId: user.projectId 
        };

        return {
            access_token: this.jwtService.sign(payload),
            username: user.username, 
            role: user.role, 
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            coordinator: user.coordinator,
            projectId: user.projectId 
        };
    }
}