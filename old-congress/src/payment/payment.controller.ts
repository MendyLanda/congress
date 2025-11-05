import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserRole } from 'shared/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(":projectId")
  @Roles(UserRole.manager)
  findAll(@Param('projectId') projectId: string) {
    return this.paymentService.findAllWithAssociations(+projectId);
  }
}
