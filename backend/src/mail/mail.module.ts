
import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { ReorderService } from './reorder.service'

@Module({
  providers: [MailService, ReorderService],
  exports:   [MailService],
})
export class MailModule {}