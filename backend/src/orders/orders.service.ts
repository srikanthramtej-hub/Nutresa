import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
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

    // ── Step 1: Validate stock for every item BEFORE creating the order ──
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true },
      })

      if (!product) {
        throw new BadRequestException(`Product #${item.productId} not found`)
      }
      if (product.stock < item.qty) {
        throw new BadRequestException(
          `"${product.name}" only has ${product.stock} units in stock but you ordered ${item.qty}`
        )
      }
    }

    // ── Step 2: Compute delivery + GST ──
    const deliveryCharge = await this.adminService.computeDeliveryCharge(subtotal)
    const gst            = await this.adminService.computeGstAmount(subtotal)
    const total          = subtotal + deliveryCharge + gst.amount

    // ── Step 3: Create the order ──
    const order = await this.prisma.order.create({
      data: {
        userId,
        subtotal,
        deliveryCharge,
        gstEnabled: gst.enabled,
        gstRate:    gst.rate,
        gstAmount:  gst.amount,
        total,
        address: JSON.stringify(address),
        items: {
          create: items.map(i => ({
            productId:   i.productId,
            qty:         i.qty,
            price:       i.price,
            weightLabel: i.weightLabel,
          })),
        },
      },
      include: { user: true, items: { include: { product: true } } },
    })

    // ── Step 4: Decrement stock for each ordered product ──
    for (const item of items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.qty } },
      })
    }

    // ── Step 5: Send confirmation emails ──
    try {
      await this.mail.sendOrderConfirmation(order.user.email, order, gst)
      await this.mail.sendAdminOrderNotification(order, gst)
    } catch (e: any) {
      console.error('Mail error:', e.message)
    }

    return order
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where:   { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where:   { id, userId },
      include: { user: true, items: { include: { product: true } } },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async trackOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where:   { id },
      include: {
        user:  { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    })
    if (!order) throw new NotFoundException('Order not found. Please check your Order ID and try again.')
    return order
  }

  async getInvoicePdf(id: string, userId: string): Promise<Buffer> {
    const order = await this.prisma.order.findFirst({
      where:   { id, userId },
      include: { user: true, items: { include: { product: true } } },
    })
    if (!order) throw new NotFoundException('Order not found')
    return this.pdf.generateInvoice(order)
  }

  async getDeliveryCharge(subtotal: number) {
    const { freeDeliveryAbove } = await this.adminService.getDeliverySettings()
    const deliveryCharge        = await this.adminService.computeDeliveryCharge(subtotal)
    const gst                   = await this.adminService.computeGstAmount(subtotal)
    return {
      deliveryCharge,
      freeDeliveryAbove,
      gstEnabled: gst.enabled,
      gstRate:    gst.rate,
      gstAmount:  gst.amount,
      total:      subtotal + deliveryCharge + gst.amount,
    }
  }
}