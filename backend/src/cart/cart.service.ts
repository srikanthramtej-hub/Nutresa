import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { weightOptions: true } } },
    })
  }

  async upsertItem(userId: string, productId: number, weightLabel: string, price: number, qty: number) {
    return this.prisma.cartItem.upsert({
      where: { userId_productId_weightLabel: { userId, productId, weightLabel } },
      update: { qty, price },
      create: { userId, productId, weightLabel, price, qty },
      include: { product: true },
    })
  }

  async updateQty(userId: string, cartItemId: number, qty: number) {
    return this.prisma.cartItem.updateMany({
      where: { id: cartItemId, userId },
      data: { qty },
    })
  }

  async removeItem(userId: string, cartItemId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId },
    })
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } })
  }
}
