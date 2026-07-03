import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Res, ParseFloatPipe } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() body: { items: any[]; address: any; subtotal: number; total?: number },
    @Req() req: any,
  ) {
    const subtotal = body.subtotal ?? body.total ?? 0
    return this.orders.createOrder(req.user.id, body.items, body.address, subtotal)
  }

  // Public — checkout page calls this to show delivery fee before placing order
  // GET /orders/delivery-charge?subtotal=450
  @Get('delivery-charge')
  getDeliveryCharge(@Query('subtotal', ParseFloatPipe) subtotal: number) {
    return this.orders.getDeliveryCharge(subtotal)
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Req() req: any) { return this.orders.getUserOrders(req.user.id) }

  @Get('track/:id')
  trackOrder(@Param('id') id: string) { return this.orders.trackOrderById(id) }

  // Customer downloads their own invoice PDF
  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    try {
      const pdf = await this.orders.getInvoicePdf(id, req.user.id)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=nutresa_invoice_${id}.pdf`)
      res.send(pdf)
    } catch {
      res.status(404).json({ message: 'Order not found' })
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string, @Req() req: any) {
    return this.orders.getOrderById(id, req.user.id)
  }
}