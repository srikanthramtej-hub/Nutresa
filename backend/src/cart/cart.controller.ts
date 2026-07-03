import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common'
import { CartService } from './cart.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cart.getCart(req.user.id)
  }

  @Post()
  addItem(
    @Body() body: { productId: number; weightLabel: string; price: number; qty: number },
    @Req() req: any,
  ) {
    return this.cart.upsertItem(req.user.id, body.productId, body.weightLabel, body.price, body.qty)
  }

  @Put(':id')
  updateQty(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { qty: number },
    @Req() req: any,
  ) {
    return this.cart.updateQty(req.user.id, id, body.qty)
  }

  @Delete(':id')
  removeItem(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cart.removeItem(req.user.id, id)
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cart.clearCart(req.user.id)
  }
}
