import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(name: string, email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } })
    if (exists) throw new ConflictException('Email already registered')
    const hashed = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { name, email, password: hashed },
    })
    return this.buildResponse(user)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')
    return this.buildResponse(user)
  }

  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({ where: { email: googleUser.email } })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
        },
      })
    }
    return this.buildResponse(user)
  }

  buildResponse(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  }
}
