import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RecaptchaGuard } from 'src/auth/recaptcha/recaptcha.guard';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) { }

  @Public()
  @Get('username-valid/:username')
  isUsernameValid(@Param('username') username: string) {
    // TODO: avoid ddos(how?)
    return this.userService.isUsernameValid(username);
  }
  
  @Public()
  @UseGuards(RecaptchaGuard)
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }

  @Get("all/:projectId")
  @Roles(UserRole.manager)
  findAll(@Param('projectId') projectId: string) {
    return this.userService.findAll(+projectId);
  }
  
  @Get(':id')
  @Roles(UserRole.manager, UserRole.coordinator, UserRole.welfareCommittee, UserRole.welfareDepartment)
  findOneById(@Param('id') id, @Req() req) {
    return this.userService.findOneById(+id, req.user);
  }

  @Get('username/:username')
  @Roles(UserRole.manager)
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username); 
  }

  @Get('approve/:id')
  @Roles(UserRole.manager)
  approveUser(@Param('id') id: string, @Req() req) {
    return this.userService.approveUser(+id);
  }

  @Get('decline/:id')
  @Roles(UserRole.manager)
  declineUser(@Param('id') id: string, @Req() req) {
    return this.userService.deleteUser(+id);
  }

  @Post()
  @Roles(UserRole.manager)
  createUser(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.manager)
  updateUser(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.manager)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(+id);
  }
}

