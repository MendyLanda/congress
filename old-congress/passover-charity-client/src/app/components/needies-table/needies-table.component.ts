import { animate, state, style, transition, trigger } from '@angular/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UserRole } from '../../../../../shared/enums/user-role.enum';
import { isRolesInHigherHierarchy } from '../../../../../shared/logic/recommendation.helpers';
import { TableFilterType } from '../../enums/table-filter-type.enum';
import { NeedyElement } from '../../interfaces/needy-element.interface';
import { TableColumnHeader } from '../../interfaces/table-column-header.interface';
import { TableColumnFilter } from '../../interfaces/table-filter.interface';

@Component({
  selector: 'app-needies-table',
  templateUrl: './needies-table.component.html',
  styleUrls: ['./needies-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NeediesTableComponent implements OnInit, AfterViewInit, OnChanges {
  readonly TableFilterType = TableFilterType;

  @Input() columns: TableColumnHeader<NeedyElement>[] = [];
  @Input() data: NeedyElement[] = [];

  public dataSource: MatTableDataSource<NeedyElement> = new MatTableDataSource<NeedyElement>([]);
  filterSelectObj: TableColumnFilter[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() editRow = new EventEmitter<NeedyElement>();
  @Output() deleteRow = new EventEmitter<NeedyElement>();
  @Output() needyAction = new EventEmitter<{ element: NeedyElement, title: string }>();

  expandedElement: any;

  private subscription: Subscription[] = [];

  get displayedColumns(): string[] {
    const tableCols: string[] = this.columns.map(c => c.key)
    tableCols.length ? tableCols.push("edit", "delete") : [];
    return tableCols;
  }

  get displayedColumnFilters() {
    const tableCols: string[] = this.filterSelectObj.map(c => c.columnProp + "-filter")
    tableCols.length ? tableCols.push("edit-filter", "delete-filter") : [];
    return tableCols;
  }

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public userInfoService: UserInfoService,
    private needyDataServiceService :NeedyDataServiceService,
    public dialog: MatDialog,
  ) {
    this.dataSource = new MatTableDataSource<NeedyElement>(this.data);
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("data" in changes) {
      this.dataSource.data = this.data;
    }

    if ("columns" in changes) {
      this.filterSelectObj = this.columns.map((column: TableColumnHeader<NeedyElement>) => ({
        name: column.displayName,
        columnProp: column.key,
        type: column.filterType,
        options: column.filterType == TableFilterType.options ? this.mapToColumn(this.data, column.key) : undefined,
        freeText: column.filterType == TableFilterType.freeText ? "" : undefined,
        filterBy: undefined
      }))
    }
  }

  get isManager() {
    return this.userInfoService.userInfo?.role === UserRole.manager;
  }

  ngOnInit(): void {
    this.subscription.push(this.needyDataServiceService.tableFilters$.subscribe(filters => {
      if (!Object.keys(filters).length) {
        this.resetFilters();
        return;
      }
      
      Object.keys(filters).forEach(key => {
        const f = this.filterSelectObj.find(o => o.columnProp == key);
        f ? f.filterBy = filters[key] : f;
      })

      this.filterChange();
    }))
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  toggleExpanded = (row: any) => {
    if (this.isManager) {
      this.expandedElement = this.expandedElement == row ? null : row
    }
  }

  _editRow = (detail: NeedyElement) => this.editRow.emit(detail)

  _deleteRow = (detail: NeedyElement) => this.deleteRow.emit(detail)

  announceSortChange = (sortState: Sort) => {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  createFilter = () => (data: any, filter: string): boolean => {
    let searchTerms = JSON.parse(filter);
    let noFilters = true;
    let found = true;
  
    for (const col in searchTerms) {
      if (searchTerms[col].toString() !== '') {
        noFilters = false;
  
        const terms = searchTerms[col].toString().trim().toLowerCase().split(',');
  
        const columnMatch = terms.some((term: string) => {
          return term
            .trim()
            .split(' ')
            .every((word: string) => data[col]?.toString().toLowerCase().includes(word));
        });
  
        if (!columnMatch) {
          found = false;
        }
      }
    }
  
    return noFilters || found;
  };
  

  filterChange() {
    this.dataSource.filter = JSON.stringify(this.getFilterObject());
  }

  resetFilters() {
    this.filterSelectObj.forEach(filter => filter.filterBy = undefined);
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

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  isRecommendationUpdateAllowed = (element: NeedyElement) => {
    const userCType = this.userInfoService.userInfo!.role;

    return !(userCType && isRolesInHigherHierarchy(userCType, element.lastRecommender));
  }

  getActionTitle = (element: NeedyElement) => {
    const userCType = this.userInfoService.userInfo!.role;
    let prefix = '';

    if (element.lastRecommender == userCType) {
      prefix = "עדכון ";
    }

    prefix += userCType == UserRole.manager ? 'אישור' : 'המלצת'
    return prefix + " " + userCType;
  }

  _needyAction = (element: NeedyElement) => this.needyAction.emit({ element, title: this.getActionTitle(element) })

  isRejectNeedy = (element: NeedyElement) => element.lastRecommender == UserRole.manager && element.supportAmount === 0;
}
