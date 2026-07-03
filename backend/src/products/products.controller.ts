import { Controller, Get, Post, Param, Query, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common'
import { ProductsService } from './products.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.products.findAll(category)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(id)
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number; comment: string },
    @Req() req: any,
  ) {
    return this.products.addReview(id, req.user.id, body.rating, body.comment)
  }
}
