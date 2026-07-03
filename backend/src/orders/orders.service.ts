import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { PdfService } from '../pdf/pdf.service'
import { AdminService } from '../admin/admin.service'

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private pdf: PdfService,
    private adminService: AdminService,
  ) {}

  async createOrder(userId: string, items: any[], address: any, subtotal: number) {
    const deliveryCharge = await this.adminService.computeDeliveryCharge(subtotal)
    const total          = subtotal + deliveryCharge

    const order = await this.prisma.order.create({
      data: {
        userId, subtotal, deliveryCharge, total,
        address: JSON.stringify(address),
        items: {
          create: items.map(i => ({
            productId: i.productId, qty: i.qty, price: i.price, weightLabel: i.weightLabel,
          })),
        },
      },
      include: { user: true, items: { include: { product: true } } },
    })

    try {
      await this.mail.sendOrderConfirmation(order.user.email, order)
      await this.mail.sendAdminOrderNotification(order)
    } catch (e) {
      console.error('Mail error:', e.message)
    }

    return order
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' },
    })
  }

  async getOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId }, include: { user: true, items: { include: { product: true } } },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async trackOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    })
    if (!order) throw new NotFoundException('Order not found. Please check your Order ID and try again.')
    return order
  }

  async getInvoicePdf(id: string, userId: string): Promise<Buffer> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId }, include: { user: true, items: { include: { product: true } } },
    })
    if (!order) throw new NotFoundException('Order not found')
    return this.pdf.generateInvoice(order)
  }

  async getDeliveryCharge(subtotal: number) {
    const { freeDeliveryAbove } = await this.adminService.getDeliverySettings()
    const deliveryCharge        = await this.adminService.computeDeliveryCharge(subtotal)
    return { deliveryCharge, freeDeliveryAbove, total: subtotal + deliveryCharge }
  }
}