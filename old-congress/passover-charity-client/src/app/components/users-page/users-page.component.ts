import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableColumnHeader } from 'src/app/interfaces/table-column-header.interface';
import { UserElement } from 'src/app/interfaces/user-element.interface';
import { ApiService } from 'src/app/services/api.service';
import { ProjectService } from 'src/app/services/project.service';
import { ToastyService } from 'src/app/services/toasty.service';
import { UsersDataService, UserTableColumn } from 'src/app/services/users-data.service';
import { AddUserFromComponent } from '../dialogs/add-user-from/add-user-from.component';
import { UsersTableComponent } from '../users-table/users-table.component';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit {

  pendingTableColumns: UserTableColumn[] = [];
  activeTableColumns: UserTableColumn[] = [];
  pendingTableData: UserElement[] = [];
  activeTableData: UserElement[] = [];
  projectId: number | undefined;

  @ViewChild("allUsersTable") allUsersTable!: UsersTableComponent;

  constructor(
    private usersDataService: UsersDataService,
    public dialog: MatDialog,
    private apiService: ApiService,
    private toastyService: ToastyService,
    private projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.projectService.$project.subscribe(projectId => {
      this.projectId = projectId;
      this.getUsersData();
    });
  }

  addUser = () => {
    const dialogRef = this.dialog.open(AddUserFromComponent, {
      maxHeight: '70vh'
    });
    let instance = dialogRef.componentInstance;
    instance.signInMode = false;

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) {
        return;
      }
      
      const newUser = this.usersDataService.createUser(result);
      
      this.apiService.createUser(newUser).subscribe(res => {
        this.toastyService.success("המשתמש נוצר בהצלחה");
        this.getUsersData();
      });
    });
  }

  approveUser = (detail: UserElement) => {
    this.apiService.approveUser(detail.id!).subscribe(res => {
      this.toastyService.success("המשתמש אושר");
      this.getUsersData();
    })
  }

  declineUser = (detail: UserElement) => {
    if (confirm(`הרם אתה בטוח שברצונך למחוק את המשתמש ${detail.username}?`)) {
      this.apiService.declineUser(detail.id!).subscribe(res => {
        this.toastyService.success("המשתמש נדחה");
        this.getUsersData();
      })
    }
  }

  getUsersData = () => this.usersDataService.getUserTableData(this.projectId!).subscribe(res => {
    this.pendingTableColumns = [];
    this.activeTableColumns = [];
    this.pendingTableData = [];
    this.activeTableData = [];

    res.columns.forEach(c => {
      this.pendingTableColumns.push(c);

      if (c.forActives) {
        this.activeTableColumns.push(c);
      }
    });

    res.data.forEach(u => {
      u.isActive ? this.activeTableData.push(u) : this.pendingTableData.push(u);
    });
  });

  exportTable = () => {
    this.usersDataService.exportData(this.allUsersTable.dataSource.filteredData);
  }

  updateUserCanCreate = (event: {userId: number, status: boolean}) => {
    this.apiService.updateUser(event.userId, {canCreate: Number(event.status)}).subscribe(res => {
      this.toastyService.success("הרשאות עודכנו");
      this.getUsersData();
    })
  }
}
