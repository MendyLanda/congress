import { Injectable, CanActivate, ExecutionContext, ForbiddenException, } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { map, Observable } from "rxjs";

@Injectable()
export class RecaptchaGuard implements CanActivate {

    constructor(private readonly httpService: HttpService) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const { body, headers } = context.switchToHttp().getRequest();

        const captchaToken = body.captchaToken || headers.captchatoken;

        return this.httpService.post(
            `https://www.google.com/recaptcha/api/siteverify?response=${captchaToken}&secret=${process.env.RECAPTCHA_SECRET}`
        ).pipe(map(data => {
            if (!data.data.success) {
                console.log("recaptcha", data);
                throw new ForbiddenException();
            } else {
                return true;
            }
        }))
    }
}