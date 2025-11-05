import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import _sequelize from 'sequelize';

@Injectable()
export class AppService {
    constructor(private sequelize: Sequelize) {
        // sequelize.sync({force: false}).then(e => console.log(e))
    }
}
