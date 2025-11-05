import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastyService {

  constructor(
    private toastr: ToastrService,
  ) {
  }

  info = (message?: string | undefined, title?: string | undefined, override?: Partial<IndividualConfig> | undefined) => this.toastr.info(message, title, override);
  warning = (message?: string | undefined, title?: string | undefined, override?: Partial<IndividualConfig> | undefined) => this.toastr.warning(message, title, override);
  success = (message?: string | undefined, title?: string | undefined, override?: Partial<IndividualConfig> | undefined) => this.toastr.success(message, title, override);
  error = (message?: string | undefined, title?: string | undefined, override?: Partial<IndividualConfig> | undefined) => this.toastr.error(message, title, override);
}
