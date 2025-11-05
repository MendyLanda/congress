import { NeedyObject } from './needy.schema';
import { Document } from '../../../shared/interfaces/document.interface';
import { Column, Model, Table, BelongsTo, AllowNull, PrimaryKey, AutoIncrement, ForeignKey } from 'sequelize-typescript';
import { ProjectObject } from '../../project/schemas/project.schema';
import { Project } from '../../../shared/interfaces/project.interface';

@Table
export class DocumentObject extends Model<Document> {
    // @PrimaryKey
    // @AutoIncrement
    // @Column
    id: number;

    @Column
    fileName: string;
    
    @Column 
    doc: string;

    @BelongsTo(() => NeedyObject)
    needy: NeedyObject

    @ForeignKey(() => NeedyObject)
    needyId?: number;
    
    @ForeignKey(() => ProjectObject)
    projectId: number;
    
    @BelongsTo(() => ProjectObject)
    project?: Project;
}
