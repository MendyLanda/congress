import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { TableFilterType } from "../enums/table-filter-type.enum";
import { TableColumnHeader } from "../interfaces/table-column-header.interface";
import { TableColumnFilter } from "../interfaces/table-filter.interface";

export class FilterPaginatorTable<T> {
    readonly TableFilterType = TableFilterType;

    columns: TableColumnHeader<T>[] = [];
    data: T[] = [];

    dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
    filterSelectObj: TableColumnFilter[] = [];

    get displayedColumns(): string[] {
        return this.columns.map(c => c.key) as string[];
    }

    get displayedColumnFilters() {
        return this.filterSelectObj.map(c => c.columnProp + "-filter");
    }

    constructor() {
        this.dataSource = new MatTableDataSource<T>(this.data);
        this.dataSource.filterPredicate = this.createFilter();
    }

    createFilter = () => (data: any, filter: string): boolean => {
        let searchTerms = JSON.parse(filter);
        let noFilters = true;
        let found = true;

        for (const col in searchTerms) {
            if (searchTerms[col].toString() !== '') {
                noFilters = false;

                for (const col in searchTerms) {
                    searchTerms[col].toString().trim().toLowerCase().split(' ').forEach((word: string) => {
                        if (data[col].toString().toLowerCase().indexOf(word) == -1) {
                            found = false;
                        }
                    });
                }
            }
        }

        return noFilters || found;
    }

    filterChange() {
        this.dataSource.filter = JSON.stringify(this.getFilterObject());
    }

    resetFilters() {
        this.dataSource.filter = "";
    }

    resetFilter = (filter: TableColumnFilter) => {
        filter.filterBy = undefined;
        this.dataSource.filter = JSON.stringify(this.getFilterObject());
    }

    mapToColumn = (dataSource: any, columnKey: string): any[] => [...new Set(dataSource.map((e: any) => e[columnKey]))]

    getFilterObject = () => this.filterSelectObj.reduce((obj: any, curr: TableColumnFilter) => {
        obj[curr.columnProp] = curr.filterBy;
        return obj;
    }, {} as Record<string, string>)
}