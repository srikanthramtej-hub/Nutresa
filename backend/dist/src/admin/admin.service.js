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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdf_service_1 = require("../pdf/pdf.service");
const DEFAULT_DELIVERY_CHARGE = 49;
const DEFAULT_FREE_DELIVERY_ABOVE = 500;
let AdminService = class AdminService {
    constructor(prisma, pdf) {
        this.prisma = prisma;
        this.pdf = pdf;
        this.DELIVERY_SETTINGS_KEY = '__delivery_settings';
    }
    async getDashboardStats() {
        const [totalOrders, totalUsers, pendingOrders] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.order.count({ where: { status: 'PLACED' } }),
        ]);
        const revenueResult = await this.prisma.order.aggregate({ _sum: { total: true } });
        const lowStockProducts = await this.prisma.product.findMany({
            where: { stock: { lte: 50 } },
            select: { id: true, name: true, stock: true, imageUrl: true, imageUrls: true },
        });
        return { totalOrders, totalUsers, pendingOrders, totalRevenue: revenueResult._sum.total || 0, lowStockProducts };
    }
    async getAllOrders() {
        return this.prisma.order.findMany({
            include: { user: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateOrderStatus(orderId, status) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { user: true, items: { include: { product: true } } },
        });
    }
    async getOrderInvoicePdf(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.InternalServerErrorException('Order not found');
        return this.pdf.generateInvoice(order);
    }
    async getAdminInvoicePdf(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.InternalServerErrorException('Order not found');
        }
        return this.pdf.generateAdminInvoice(order);
    }
    async getAllProducts() {
        return this.prisma.product.findMany({ include: { weightOptions: true }, orderBy: { createdAt: 'desc' } });
    }
    parseTags(tags) {
        if (Array.isArray(tags))
            return tags;
        if (typeof tags === 'string') {
            try {
                return JSON.parse(tags);
            }
            catch {
                return tags.split(',').map((t) => t.trim()).filter(Boolean);
            }
        }
        return [];
    }
    async createProduct(data, imageUrls = []) {
        const { weightOptions, tags, existingImages, ...productData } = data;
        const product = await this.prisma.product.create({
            data: {
                name: String(productData.name),
                category: String(productData.category),
                basePrice: parseFloat(productData.basePrice),
                description: String(productData.description),
                stock: parseInt(productData.stock),
                origin: productData.origin ? String(productData.origin) : null,
                shelfLife: productData.shelfLife ? String(productData.shelfLife) : null,
                isNew: productData.isNew === true || productData.isNew === 'true',
                isActive: productData.isActive !== 'false',
                tags: JSON.stringify(this.parseTags(tags)),
                imageUrl: imageUrls[0] || null,
                imageUrls: JSON.stringify(imageUrls),
            },
        });
        if (Array.isArray(weightOptions) && weightOptions.length > 0) {
            for (const wo of weightOptions) {
                const price = parseFloat(wo.price);
                const grams = parseInt(wo.grams);
                if (!isNaN(price) && !isNaN(grams))
                    await this.prisma.weightOption.create({ data: { label: String(wo.label), grams, price, productId: product.id } });
            }
        }
        return this.prisma.product.findUnique({ where: { id: product.id }, include: { weightOptions: true } });
    }
    async updateProduct(id, data, newImageUrls, existingImages = []) {
        const { weightOptions, tags, existingImages: _ei, ...productData } = data;
        const finalImages = [...existingImages, ...(newImageUrls || [])].slice(0, 5);
        const updateData = {};
        if (productData.name !== undefined)
            updateData.name = String(productData.name);
        if (productData.category !== undefined)
            updateData.category = String(productData.category);
        if (productData.description !== undefined)
            updateData.description = String(productData.description);
        if (productData.origin !== undefined)
            updateData.origin = productData.origin ? String(productData.origin) : null;
        if (productData.shelfLife !== undefined)
            updateData.shelfLife = productData.shelfLife ? String(productData.shelfLife) : null;
        if (productData.isNew !== undefined)
            updateData.isNew = productData.isNew === true || productData.isNew === 'true';
        if (productData.isActive !== undefined)
            updateData.isActive = productData.isActive !== 'false';
        if (productData.basePrice !== undefined) {
            const bp = parseFloat(productData.basePrice);
            if (!isNaN(bp))
                updateData.basePrice = bp;
        }
        if (productData.stock !== undefined) {
            const st = parseInt(productData.stock);
            if (!isNaN(st))
                updateData.stock = st;
        }
        if (tags !== undefined)
            updateData.tags = JSON.stringify(this.parseTags(tags));
        if (newImageUrls !== undefined || existingImages.length > 0) {
            updateData.imageUrl = finalImages[0] || null;
            updateData.imageUrls = JSON.stringify(finalImages);
        }
        await this.prisma.product.update({ where: { id }, data: updateData });
        if (Array.isArray(weightOptions) && weightOptions.length > 0) {
            await this.prisma.weightOption.deleteMany({ where: { productId: id } });
            for (const wo of weightOptions) {
                const price = parseFloat(wo.price);
                const grams = parseInt(wo.grams);
                if (!isNaN(price) && !isNaN(grams))
                    await this.prisma.weightOption.create({ data: { label: String(wo.label), grams, price, productId: id } });
            }
        }
        return this.prisma.product.findUnique({ where: { id }, include: { weightOptions: true } });
    }
    async updateStock(productId, stock) {
        return this.prisma.product.update({ where: { id: productId }, data: { stock } });
    }
    async deleteProduct(id) {
        await this.prisma.weightOption.deleteMany({ where: { productId: id } });
        return this.prisma.product.delete({ where: { id } });
    }
    async getAllCustomers() {
        return this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCustomersCSV() {
        const customers = await this.getAllCustomers();
        const rows = [
            ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined'],
            ...customers.map(c => [c.name, c.email, c.phone || '', c._count.orders, c.orders.reduce((s, o) => s + o.total, 0), c.createdAt.toLocaleDateString()]),
        ];
        return rows.map(r => r.join(',')).join('\n');
    }
    async getDeliverySettings() {
        const record = await this.prisma.policy.findUnique({
            where: { key: this.DELIVERY_SETTINGS_KEY },
        });
        if (!record) {
            return { deliveryCharge: 49, freeDeliveryAbove: 500 };
        }
        try {
            const parsed = JSON.parse(record.content);
            return {
                deliveryCharge: typeof parsed.deliveryCharge === 'number' ? parsed.deliveryCharge : 49,
                freeDeliveryAbove: typeof parsed.freeDeliveryAbove === 'number' ? parsed.freeDeliveryAbove : 500,
            };
        }
        catch {
            return { deliveryCharge: 49, freeDeliveryAbove: 500 };
        }
    }
    async updateDeliverySettings(deliveryCharge, freeDeliveryAbove) {
        const content = JSON.stringify({ deliveryCharge, freeDeliveryAbove });
        await this.prisma.policy.upsert({
            where: { key: this.DELIVERY_SETTINGS_KEY },
            update: { content },
            create: { key: this.DELIVERY_SETTINGS_KEY, title: 'Delivery Settings', content },
        });
        return { deliveryCharge, freeDeliveryAbove };
    }
    async computeDeliveryCharge(subtotal) {
        const { deliveryCharge, freeDeliveryAbove } = await this.getDeliverySettings();
        return subtotal >= freeDeliveryAbove ? 0 : deliveryCharge;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService])
], AdminService);
//# sourceMappingURL=admin.service.js.map