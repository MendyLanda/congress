import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PaymentElement } from 'src/app/interfaces/payment-element.interface';
import { TableColumnHeader } from 'src/app/interfaces/table-column-header.interface';
import { ApiService } from 'src/app/services/api.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { PaymentsTableComponent } from '../payments-table/payments-table.component';

@Component({
  selector: 'app-payments-page',
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.scss']
})
export class PaymentsPageComponent implements OnInit {

  tableColumns: TableColumnHeader<PaymentElement>[] = [];
  tableData: PaymentElement[] = [];
  private subscriptions: Subscription[] = [];

  @ViewChild("table") table!: PaymentsTableComponent;

  constructor(
    public dialog: MatDialog,
    private paymentService: PaymentService,
    private apiService: ApiService,
    private toastyService: ToastyService,
    public userInfoService: UserInfoService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.paymentService._tableData$.subscribe(res => {
      this.tableColumns = res.columns;
      this.tableData = res.data;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getDataTable = () => this.paymentService.updateTableData();

  exportTable = () => {
    this.paymentService.exportData(this.table.dataSource.filteredData);
  }
}
