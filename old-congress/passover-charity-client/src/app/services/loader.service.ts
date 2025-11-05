import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _$isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  get $isLoading(): Observable<boolean> {
    return this._$isLoading.asObservable();
  }

  constructor() { }

  startLoader() {
    this._$isLoading.next(true);
  }

  stopLoader() {
    this._$isLoading.next(false);
  }
}
