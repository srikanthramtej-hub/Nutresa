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
var ReorderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("./mail.service");
let ReorderService = ReorderService_1 = class ReorderService {
    constructor(prisma, mail) {
        this.prisma = prisma;
        this.mail = mail;
        this.logger = new common_1.Logger(ReorderService_1.name);
    }
    async sendReorderEmails() {
        this.logger.log('Running 30-day reorder email check...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: thirtyOneDaysAgo,
                    lte: thirtyDaysAgo,
                },
                status: 'DELIVERED',
            },
            include: {
                user: true,
                items: { include: { product: true } },
            },
        });
        this.logger.log(`Found ${orders.length} orders eligible for reorder email`);
        for (const order of orders) {
            try {
                await this.mail.sendReorderReminder(order);
                this.logger.log(`Reorder email sent to ${order.user.email}`);
            }
            catch (err) {
                this.logger.error(`Failed: ${order.user.email} — ${err.message}`);
            }
        }
    }
};
exports.ReorderService = ReorderService;
__decorate([
    (0, schedule_1.Cron)('0 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReorderService.prototype, "sendReorderEmails", null);
exports.ReorderService = ReorderService = ReorderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], ReorderService);
//# sourceMappingURL=reorder.service.js.map