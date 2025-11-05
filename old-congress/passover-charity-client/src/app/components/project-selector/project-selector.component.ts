import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/interfaces/user-info.interface';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Project } from '../../../../../shared/interfaces/project.interface';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  projects: Project[] = [];
  projectSelected: number | undefined;

  constructor(
    public authService: AuthService,
    public apiService: ApiService,
    public projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.apiService.getProjects().subscribe(projects => {
      this.projects = projects;
    }))
    this.subscriptions.push(this.projectService.$project.subscribe(projectId => {
      this.projectSelected = projectId;
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onProjectChanged = (projectId: number) => {
    this.projectSelected = projectId;
    this.projectService.updateProject(projectId);
  }
}
