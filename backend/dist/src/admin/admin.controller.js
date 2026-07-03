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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const uploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'products');
if (!(0, fs_1.existsSync)(uploadDir))
    (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
const productImageStorage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${(0, path_1.extname)(file.originalname)}`); },
});
const imageFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/'))
        return cb(new Error('Only image files are allowed'), false);
    cb(null, true);
};
let AdminController = class AdminController {
    constructor(admin) {
        this.admin = admin;
    }
    getDashboard() { return this.admin.getDashboardStats(); }
    getAllOrders() { return this.admin.getAllOrders(); }
    updateOrderStatus(id, body) {
        return this.admin.updateOrderStatus(id, body.status);
    }
    async downloadInvoice(id, res) {
        try {
            const pdfBuffer = await this.admin.getOrderInvoicePdf(id);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${id}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            res.status(404).json({
                message: 'Order not found',
            });
        }
    }
    async downloadLabel(id, res) {
        const orders = await this.admin.getAllOrders();
        const order = orders.find(o => o.id === id);
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=label_${id}.txt`);
        res.send(`NUTRESA SHIPPING LABEL\nOrder: ${order.id}\nCustomer: ${order.user.name}\nTotal: ₹${order.total}`);
    }
    getAllProducts() { return this.admin.getAllProducts(); }
    async createProduct(files, body) {
        try {
            const imageUrls = (files || []).map(f => `/uploads/products/${f.filename}`);
            if (body.weightOptions && typeof body.weightOptions === 'string') {
                try {
                    body.weightOptions = JSON.parse(body.weightOptions);
                }
                catch {
                    body.weightOptions = [];
                }
            }
            if (body.tags && typeof body.tags === 'string') {
                try {
                    body.tags = JSON.parse(body.tags);
                }
                catch {
                    body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
                }
            }
            body.isNew = body.isNew === 'true' || body.isNew === true;
            body.isActive = body.isActive !== 'false';
            return await this.admin.createProduct(body, imageUrls);
        }
        catch (err) {
            console.error('Create product error:', err);
            throw err;
        }
    }
    async updateProduct(id, files, body) {
        try {
            const newImageUrls = files && files.length > 0 ? files.map(f => `/uploads/products/${f.filename}`) : undefined;
            if (body.weightOptions && typeof body.weightOptions === 'string') {
                try {
                    body.weightOptions = JSON.parse(body.weightOptions);
                }
                catch {
                    body.weightOptions = [];
                }
            }
            if (body.tags && typeof body.tags === 'string') {
                try {
                    body.tags = JSON.parse(body.tags);
                }
                catch {
                    body.tags = body.tags.split(',').map((t) => t.trim()).filter(Boolean);
                }
            }
            if (body.isNew !== undefined)
                body.isNew = body.isNew === 'true' || body.isNew === true;
            const existingImages = body.existingImages ? body.existingImages.split(',').filter(Boolean) : [];
            return await this.admin.updateProduct(id, body, newImageUrls, existingImages);
        }
        catch (err) {
            console.error('Update product error:', err);
            throw err;
        }
    }
    updateStock(id, body) {
        return this.admin.updateStock(id, body.stock);
    }
    deleteProduct(id) { return this.admin.deleteProduct(id); }
    getAllCustomers() { return this.admin.getAllCustomers(); }
    async exportCSV(res) {
        const csv = await this.admin.getCustomersCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=nutrinest_customers.csv');
        res.send(csv);
    }
    getDeliverySettings() { return this.admin.getDeliverySettings(); }
    updateDeliverySettings(body) {
        return this.admin.updateDeliverySettings(Number(body.deliveryCharge), Number(body.freeDeliveryAbove));
    }
    async downloadCustomerInvoice(id, res) {
        const pdf = await this.admin.getOrderInvoicePdf(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=customer_invoice_${id}.pdf`);
        res.send(pdf);
    }
    async downloadAdminInvoice(id, res) {
        const pdf = await this.admin.getAdminInvoicePdf(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=admin_invoice_${id}.pdf`);
        res.send(pdf);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('orders/:id/invoice'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Get)('orders/:id/label'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadLabel", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, { storage: productImageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, { storage: productImageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id/stock'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)('customers/export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportCSV", null);
__decorate([
    (0, common_1.Get)('settings/delivery'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDeliverySettings", null);
__decorate([
    (0, common_1.Put)('settings/delivery'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateDeliverySettings", null);
__decorate([
    (0, common_1.Get)('orders/:id/customer-invoice'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadCustomerInvoice", null);
__decorate([
    (0, common_1.Get)('orders/:id/admin-invoice'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadAdminInvoice", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map