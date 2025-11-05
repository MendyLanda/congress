import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './auth/decorators/public.decorator';
import { LocalAuthGuard } from './auth/local/local-auth.guard';
import { UsersService } from './users/users.service';
import { sleepForMilliseconds } from './utils/helpers';

@Controller()
export class AppController {

  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) { }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('auth/login')
  async login(@Request() req) {
    await sleepForMilliseconds(2000);
    return this.authService.managerLogin(req.user);
  }

  @Get('auth/login')
  async checkLogin(@Request() req) {
    return req.user.id;
  }
}
