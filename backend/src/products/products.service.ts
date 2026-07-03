import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = { isActive: true }
    if (category && category !== 'All') where.category = category

    const products = await this.prisma.product.findMany({
      where,
      include: { weightOptions: true, reviews: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return products.map(p => this.formatProduct(p))
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { weightOptions: true, reviews: { include: { user: true } } },
    })
    if (!product) throw new NotFoundException('Product not found')
    return this.formatProduct(product)
  }

  async addReview(productId: number, userId: string, rating: number, comment: string) {
    return this.prisma.review.create({
      data: { productId, userId, rating, comment },
      include: { user: true },
    })
  }

  formatProduct(p: any) {
    const ratings = p.reviews || []
    const avgRating = ratings.length
      ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length
      : 0

    // Parse imageUrls — stored as JSON string in SQLite
    let imageUrls: string[] = []
    try {
      imageUrls = JSON.parse(p.imageUrls || '[]')
    } catch {
      imageUrls = []
    }
    // Fallback: if imageUrls is empty but imageUrl exists, use it
    if (imageUrls.length === 0 && p.imageUrl) {
      imageUrls = [p.imageUrl]
    }

    return {
      id:          p.id,
      name:        p.name,
      category:    p.category,
      basePrice:   p.basePrice,
      description: p.description,
      stock:       p.stock,
      tags:        (() => { try { return JSON.parse(p.tags || '[]') } catch { return [] } })(),
      isNew:       p.isNew,
      imageUrl:    p.imageUrl,
      imageUrls:   imageUrls,       // ← array sent to frontend
      origin:      p.origin,
      shelfLife:   p.shelfLife,
      rating:      Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      reviews: ratings.map((r: any) => ({
        id:      r.id,
        name:    r.user.name,
        rating:  r.rating,
        comment: r.comment,
        date:    r.createdAt,
      })),
      weightOptions: p.weightOptions.map((w: any) => ({
        id:    w.id,
        label: w.label,
        grams: w.grams,
        price: w.price,
      })),
    }
  }
}