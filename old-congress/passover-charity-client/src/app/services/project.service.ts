import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private _$project: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);

  get $project(): Observable<number | undefined> {
    return this._$project.asObservable();
  }

  get project(): number | undefined {
    return this._$project.value;
  }

  constructor() {
    if (!this.project) {
      const defaultProject = localStorage.getItem('projectId') || 1;
      this.updateProject(+defaultProject);
    }
  }

  updateProject(projectId: number) {
    if (projectId && projectId !== this.project) {
      localStorage.setItem('projectId', projectId.toString());
      this._$project.next(projectId);
    }
  }
}
