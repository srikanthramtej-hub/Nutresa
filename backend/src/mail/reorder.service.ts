import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from './mail.service'

@Injectable()
export class ReorderService {
  private readonly logger = new Logger(ReorderService.name)

  constructor(
    private prisma: PrismaService,
    private mail:   MailService,
  ) {}

  // Runs every day at 10:00 AM
  @Cron('0 10 * * *')
  async sendReorderEmails() {
    this.logger.log('Running 30-day reorder email check...')

    const thirtyDaysAgo  = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const thirtyOneDaysAgo = new Date()
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyOneDaysAgo,
          lte: thirtyDaysAgo,
        },
        status: 'DELIVERED',
      },
      include: {
        user:  true,
        items: { include: { product: true } },
      },
    })

    this.logger.log(`Found ${orders.length} orders eligible for reorder email`)

    for (const order of orders) {
      try {
        await this.mail.sendReorderReminder(order)
        this.logger.log(`Reorder email sent to ${order.user.email}`)
      } catch (err) {
        this.logger.error(`Failed: ${order.user.email} — ${err.message}`)
      }
    }
  }
}