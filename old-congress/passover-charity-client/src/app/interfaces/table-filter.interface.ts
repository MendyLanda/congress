import { TableFilterType } from "../enums/table-filter-type.enum";

export interface TableColumnFilter {
    type: TableFilterType | null;
    name: string;
    columnProp: string;
    options?: string[];
    freeText?: string;
    filterBy: undefined | string;
}