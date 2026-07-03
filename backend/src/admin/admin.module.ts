import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { MailModule } from '../mail/mail.module'
import { PdfModule } from '../pdf/pdf.module'

@Module({
  imports:     [MailModule, PdfModule],
  controllers: [AdminController],
  providers:   [AdminService],
  exports:     [AdminService],
})
export class AdminModule {}