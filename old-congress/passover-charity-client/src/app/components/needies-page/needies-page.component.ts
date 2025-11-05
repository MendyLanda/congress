import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NeedyElement } from 'src/app/interfaces/needy-element.interface';
import { TableColumnHeader } from 'src/app/interfaces/table-column-header.interface';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { NeedyDataServiceService } from 'src/app/services/needy-data-service.service';
import { ProjectService } from 'src/app/services/project.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UserRole } from '../../../../../shared/enums/user-role.enum';
import { AddNeedyFormComponent } from '../dialogs/add-needy-form/add-needy-form.component';
import { SupportRecommendationComponent } from '../dialogs/support-recommendation/support-recommendation.component';
import { NeediesTableComponent } from '../needies-table/needies-table.component';

@Component({
  selector: 'app-needies-page',
  templateUrl: './needies-page.component.html',
  styleUrls: ['./needies-page.component.scss']
})
export class NeediesPageComponent implements OnInit {

  tableColumns: TableColumnHeader<NeedyElement>[] = [];
  tableData: NeedyElement[] = [];
  projectId: number | undefined;
  private subscriptions: Subscription[] = [];

  @ViewChild("table") table!: NeediesTableComponent;

  constructor(
    public dialog: MatDialog,
    private needyDataService: NeedyDataServiceService,
    private apiService: ApiService,
    private toastyService: ToastyService,
    public userInfoService: UserInfoService,
    public projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.needyDataService._tableData$.subscribe(res => {
      this.tableColumns = res.columns;
      this.tableData = res.data;
    }));

    this.subscriptions.push(this.projectService.$project.subscribe(projectId => {
      this.projectId = projectId;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  addForm = () => {
    const dialogRef = this.dialog.open(AddNeedyFormComponent, {
      maxHeight: '70vh'
    });

    dialogRef.afterClosed().subscribe(async needyElement => {
      if (!needyElement) {
        return;
      }

      needyElement.projectId = this.projectId!;
      const newNeedy = await this.needyDataService.createNeedyForm(needyElement);

      this.apiService.createNeedy(newNeedy).subscribe(res => {
        this.toastyService.success("הרשומה נוספה בהצלחה");

        if (needyElement.confirmationDocument?._files?.[0]) {
          this.apiService.addDocument(needyElement.confirmationDocument._files[0], res.id, newNeedy.projectId).subscribe({
            next: () => {
              this.toastyService.success("מסמכים נוספו בהצלחה");
            },
            error: () => {
              this.toastyService.error("לא הצלחנו לשמור את המסמכים, יש להעלות אותם בנפרד");
            }
          })
        }

        if (needyElement.ssnDocument?._files?.[0]) {
          this.apiService.addDocument(needyElement.ssnDocument._files[0], res.id, newNeedy.projectId).subscribe({
            next: () => {
              this.toastyService.success("ספח תעודת זהות נוסף בהצלחה");
            },
            error: () => {
              this.toastyService.error("לא הצלחנו לשמור את ספח תעודת הזהות, יש להעלות אותו בנפרד ע''י 'העלה מסמך חדש'");
            }
          })
        }

        this.getDataTable();
      })
    });
  }

  editNeedy = (detail: NeedyElement) => {
    const dialogRef = this.dialog.open(AddNeedyFormComponent, {
      data: { needy: detail },
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe(toUpdate => {
      if (!toUpdate) {
        return;
      }

      this.apiService.updateNeedy(toUpdate.id, { ...toUpdate, numberOfPersons: +toUpdate.numberOfPersons }).subscribe(res => {
        this.toastyService.success("הפרטים עודכנו בהצלחה");
        this.getDataTable();
      })
    });
  }

  deleteNeedy = (detail: NeedyElement) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את ${detail.firstName} ${detail.lastName}?`) == true) {
      this.apiService.deleteNeedy(detail.id!).subscribe(res => {
        this.toastyService.success("הרשומה הוסרה בהצלחה");
        this.getDataTable();
      })
    }
  }

  needyAction = (data: { element: NeedyElement, title: string }) => {
    const dialogRef = this.dialog.open(SupportRecommendationComponent, {
      data: { title: data.title, needy: data.element, isManager: this.userInfoService.userInfo!.role === UserRole.manager },
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe((result: { supportAmount: Number, messages: string }) => {
      if (typeof (result) === "undefined" || typeof (result.supportAmount) === "undefined") {
        return;
      }

      if (typeof (result.messages) !== "undefined") {
        this.apiService.updateNeedy(data.element.id!, { messages: result.messages, description: result.messages }).subscribe(res => {
          this.toastyService.success("ההודעות נרשמו בהצלחה");
        }, err => {
          this.toastyService.error("לא הצלחנו לשמור את ההודעות יש לעדכן שוב");
        })
      }

      this.apiService.addSupportRecommendation(+result.supportAmount, data.element.id!, this.projectId!).subscribe(res => {
        this.toastyService.success("ההמלצה עודכנה בהצלחה");
        this.needyDataService.updateSupportRecommendation(res, result.messages);
      })
    });
  }

  getDataTable = () => this.needyDataService.updateTableData();

  exportTable = () => {
    this.needyDataService.exportData(this.table.dataSource.filteredData);
  }
}
