"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(category) {
        const where = { isActive: true };
        if (category && category !== 'All')
            where.category = category;
        const products = await this.prisma.product.findMany({
            where,
            include: { weightOptions: true, reviews: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return products.map(p => this.formatProduct(p));
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { weightOptions: true, reviews: { include: { user: true } } },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.formatProduct(product);
    }
    async addReview(productId, userId, rating, comment) {
        return this.prisma.review.create({
            data: { productId, userId, rating, comment },
            include: { user: true },
        });
    }
    formatProduct(p) {
        const ratings = p.reviews || [];
        const avgRating = ratings.length
            ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
            : 0;
        let imageUrls = [];
        try {
            imageUrls = JSON.parse(p.imageUrls || '[]');
        }
        catch {
            imageUrls = [];
        }
        if (imageUrls.length === 0 && p.imageUrl) {
            imageUrls = [p.imageUrl];
        }
        return {
            id: p.id,
            name: p.name,
            category: p.category,
            basePrice: p.basePrice,
            description: p.description,
            stock: p.stock,
            tags: (() => { try {
                return JSON.parse(p.tags || '[]');
            }
            catch {
                return [];
            } })(),
            isNew: p.isNew,
            imageUrl: p.imageUrl,
            imageUrls: imageUrls,
            origin: p.origin,
            shelfLife: p.shelfLife,
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: ratings.length,
            reviews: ratings.map((r) => ({
                id: r.id,
                name: r.user.name,
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt,
            })),
            weightOptions: p.weightOptions.map((w) => ({
                id: w.id,
                label: w.label,
                grams: w.grams,
                price: w.price,
            })),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map