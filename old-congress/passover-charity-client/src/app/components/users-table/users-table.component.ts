import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableFilterType } from 'src/app/enums/table-filter-type.enum';
import { TableColumnHeader } from 'src/app/interfaces/table-column-header.interface';
import { TableColumnFilter } from 'src/app/interfaces/table-filter.interface';
import { UserElement } from 'src/app/interfaces/user-element.interface';
import { FilterPaginatorTable } from 'src/app/models/filter-paginator-table';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent extends FilterPaginatorTable<UserElement> implements OnInit {

  @Input() override columns: TableColumnHeader<UserElement>[] = [];
  @Input() override data: UserElement[] = [];
  @Input() approveMode: boolean = false;

  override dataSource: MatTableDataSource<UserElement> = new MatTableDataSource<UserElement>([]);
  override filterSelectObj: TableColumnFilter[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() approveUser = new EventEmitter<UserElement>();
  @Output() declineUser = new EventEmitter<UserElement>();
  @Output() updateUserCanCreate = new EventEmitter<{userId: number, status: boolean}>();

  override get displayedColumns(): string[] {
    const tableCols: string[] = this.columns.map(c => c.key);

    if (tableCols.length) {
      tableCols.push("decline");

      if (this.approveMode) {
        tableCols.push("accept")
      }
    }

    return tableCols;
  }

  override get displayedColumnFilters() {
    const tableCols: string[] = this.filterSelectObj.map(c => c.columnProp + "-filter")
   
    if (tableCols.length) {
      tableCols.push("decline-filter");

      if (this.approveMode) {
        tableCols.push("accept-filter")
      }
    }

    return tableCols;
  }
  
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
  ) {
    super();
    this.dataSource = new MatTableDataSource<UserElement>(this.data);
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if ("data" in changes) {
      this.dataSource.data = this.data;
    }

    if ("columns" in changes && !this.filterSelectObj.length) {
      this.filterSelectObj = this.columns.map((column: TableColumnHeader<UserElement>) => ({
        name: column.displayName,
        columnProp: column.key,
        type: column.filterType,
        options: column.filterType == TableFilterType.options ? this.mapToColumn(this.data, column.key) : undefined,
        freeText: column.filterType == TableFilterType.freeText ? "" : undefined,
        filterBy: undefined
      }))
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  _approveUser = (detail: UserElement) => this.approveUser.emit(detail);

  _declineUser = (detail: UserElement) => this.declineUser.emit(detail);

  announceSortChange = (sortState: Sort) => {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  updateCanCreate = (userId: number, event: MatSlideToggleChange) => {
    this.updateUserCanCreate.emit({userId, status: event.checked});    
  }
}
