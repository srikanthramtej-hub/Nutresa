import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { CartModule } from './cart/cart.module'
import { AdminModule } from './admin/admin.module'
import { UsersModule } from './users/users.module'
import { PoliciesModule } from './admin/policies.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    AdminModule,
    UsersModule,
    PoliciesModule,
  ],
})
export class AppModule {}
