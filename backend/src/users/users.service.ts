import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, addresses: true },
    })
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data })
  }

  async addAddress(userId: string, address: any) {
    return this.prisma.address.create({ data: { ...address, userId } })
  }

  async deleteAddress(userId: string, addressId: number) {
    return this.prisma.address.deleteMany({ where: { id: addressId, userId } })
  }
}
