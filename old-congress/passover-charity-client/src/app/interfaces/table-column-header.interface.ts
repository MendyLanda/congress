import { TableFilterType } from "../enums/table-filter-type.enum";

export interface TableColumnHeader<T> {
    key: keyof T;
    displayName: string;
    filterType: TableFilterType | null;
}