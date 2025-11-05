import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable, share } from 'rxjs';
import { ToastyService } from './toasty.service';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { LoaderService } from './loader.service';

@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(
    private toastyService: ToastyService,
    private cookieService: CookieService,
    public loaderService: LoaderService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    this.loaderService.startLoader();
    const _req = next.handle(req).pipe(share());

    _req.subscribe({
      complete: () => this.loaderService.stopLoader(),
      error: (err) => {
        this.loaderService.stopLoader();
        let errorMessage = "";

        if (req.url.split("/")[req.url.split("/").length - 1] == "login") {
          return;
        }

        const hebrewRegex = /[א-ת]/g;

        if (err.message.includes("0 Unknown Error")) {
          errorMessage = "יש בעיה כעת עם השירות, יש לנסות שוב מאוחר יותר";
        } else if (err.error.message?.match?.(hebrewRegex) != null) {
          errorMessage = err.error.message;
        } else if (err.error.message == 'Bad Request') {
          errorMessage = "בקשה לא תקינה, יש לבדוק שוב את הנתונים שהוזנו";
        } else if (err.error.message == 'Unauthorized') {
          errorMessage = "האימות נכשל, יש להתחבר מחדש למערכת";

          this.cookieService.delete(environment.cookies.authToken.title);
          location.reload();

        } else if (err.statusText == 'Not Found') {
          errorMessage = "המשאב או הקובץ אינו קיים";
        } else if (err.error.message == 'Forbidden') {
          errorMessage = "אין לך הרשאה לפעולה זו";
        } else {
          errorMessage = "שגיאה לא ידועה, יש לנסות שוב";
        }

        this.toastyService.error(errorMessage);
      }
    })

    return _req;
  }
}