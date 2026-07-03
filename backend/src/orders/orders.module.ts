import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { MailModule } from '../mail/mail.module'
import { PdfModule } from '../pdf/pdf.module'
import { AdminModule } from '../admin/admin.module'

@Module({
  imports:     [MailModule, PdfModule, AdminModule],
  controllers: [OrdersController],
  providers:   [OrdersService],
  exports:     [OrdersService],
})
export class OrdersModule {}