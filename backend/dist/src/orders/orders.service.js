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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const pdf_service_1 = require("../pdf/pdf.service");
const admin_service_1 = require("../admin/admin.service");
let OrdersService = class OrdersService {
    constructor(prisma, mail, pdf, adminService) {
        this.prisma = prisma;
        this.mail = mail;
        this.pdf = pdf;
        this.adminService = adminService;
    }
    async createOrder(userId, items, address, subtotal) {
        const deliveryCharge = await this.adminService.computeDeliveryCharge(subtotal);
        const total = subtotal + deliveryCharge;
        const order = await this.prisma.order.create({
            data: {
                userId, subtotal, deliveryCharge, total,
                address: JSON.stringify(address),
                items: {
                    create: items.map(i => ({
                        productId: i.productId, qty: i.qty, price: i.price, weightLabel: i.weightLabel,
                    })),
                },
            },
            include: { user: true, items: { include: { product: true } } },
        });
        try {
            await this.mail.sendOrderConfirmation(order.user.email, order);
            await this.mail.sendAdminOrderNotification(order);
        }
        catch (e) {
            console.error('Mail error:', e.message);
        }
        return order;
    }
    async getUserOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' },
        });
    }
    async getOrderById(id, userId) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId }, include: { user: true, items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async trackOrderById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found. Please check your Order ID and try again.');
        return order;
    }
    async getInvoicePdf(id, userId) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId }, include: { user: true, items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.pdf.generateInvoice(order);
    }
    async getDeliveryCharge(subtotal) {
        const { freeDeliveryAbove } = await this.adminService.getDeliverySettings();
        const deliveryCharge = await this.adminService.computeDeliveryCharge(subtotal);
        return { deliveryCharge, freeDeliveryAbove, total: subtotal + deliveryCharge };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        pdf_service_1.PdfService,
        admin_service_1.AdminService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map