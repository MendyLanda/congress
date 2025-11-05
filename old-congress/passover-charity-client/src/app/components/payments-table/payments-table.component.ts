import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableFilterType } from 'src/app/enums/table-filter-type.enum';
import { PaymentElement } from 'src/app/interfaces/payment-element.interface';
import { TableColumnHeader } from 'src/app/interfaces/table-column-header.interface';
import { TableColumnFilter } from 'src/app/interfaces/table-filter.interface';
import { FilterPaginatorTable } from 'src/app/models/filter-paginator-table';

@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss']
})
export class PaymentsTableComponent extends FilterPaginatorTable<PaymentElement>  implements OnInit {

  @Input() override columns: TableColumnHeader<PaymentElement>[] = [];
  @Input() override data: PaymentElement[] = [];

  override dataSource: MatTableDataSource<PaymentElement> = new MatTableDataSource<PaymentElement>([]);
  override filterSelectObj: TableColumnFilter[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
  ) {
    super();
    this.dataSource = new MatTableDataSource<PaymentElement>(this.data);
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if ("data" in changes) {
      this.dataSource.data = this.data;
    }

    if ("columns" in changes && !this.filterSelectObj.length) {
      this.filterSelectObj = this.columns.map((column: TableColumnHeader<PaymentElement>) => ({
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

  announceSortChange = (sortState: Sort) => {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

}
