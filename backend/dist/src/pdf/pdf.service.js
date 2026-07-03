"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
let PdfService = class PdfService {
    async generateInvoice(order) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const pageWidth = doc.page.width - 100;
            const brandColor = '#7F2020';
            doc.fillColor(brandColor).fontSize(26).font('Helvetica-Bold').text('NUTRESA', 50, 50);
            doc.fillColor('#555').fontSize(9).font('Helvetica')
                .text('Premium Dry Fruits & Nuts', 50, 80)
                .text('Vijayawada, Andhra Pradesh', 50, 92)
                .text('info@nutresa.in  |  nutresa.in', 50, 104);
            doc.fillColor(brandColor).fontSize(22).font('Helvetica-Bold')
                .text('INVOICE', 400, 50, { align: 'right', width: 145 });
            doc.fillColor('#333').fontSize(9).font('Helvetica')
                .text(`Invoice No: ${order.id}`, 400, 80, { align: 'right', width: 145 })
                .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 400, 92, { align: 'right', width: 145 })
                .text(`Status: ${order.status}`, 400, 104, { align: 'right', width: 145 });
            doc.moveTo(50, 125).lineTo(545, 125).strokeColor(brandColor).lineWidth(1.5).stroke();
            const address = (() => { try {
                return JSON.parse(order.address);
            }
            catch {
                return {};
            } })();
            doc.y = 140;
            doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('BILL TO', 50, doc.y);
            doc.y += 14;
            doc.fillColor('#333').fontSize(9).font('Helvetica').text(order.user?.name || '—', 50, doc.y);
            doc.y += 12;
            if (address.line1) {
                doc.text(address.line1, 50, doc.y);
                doc.y += 12;
            }
            if (address.city || address.state) {
                doc.text([address.city, address.state].filter(Boolean).join(', '), 50, doc.y);
                doc.y += 12;
            }
            if (address.pin) {
                doc.text(`PIN: ${address.pin}`, 50, doc.y);
                doc.y += 12;
            }
            if (address.phone || order.user?.phone) {
                doc.text(`Phone: ${address.phone || order.user?.phone}`, 50, doc.y);
                doc.y += 12;
            }
            if (order.user?.email) {
                doc.text(`Email: ${order.user.email}`, 50, doc.y);
                doc.y += 12;
            }
            const tableTop = Math.max(doc.y + 20, 240);
            doc.rect(50, tableTop, pageWidth, 22).fill(brandColor);
            doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
            const col = { item: 50, weight: 260, qty: 340, rate: 400, amount: 460 };
            doc.text('PRODUCT', col.item + 4, tableTop + 7);
            doc.text('WEIGHT', col.weight + 4, tableTop + 7);
            doc.text('QTY', col.qty + 4, tableTop + 7);
            doc.text('RATE (₹)', col.rate + 4, tableTop + 7);
            doc.text('AMOUNT (₹)', col.amount + 4, tableTop + 7, { width: 80, align: 'right' });
            let rowY = tableTop + 22;
            doc.font('Helvetica').fontSize(9);
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                const name = item.product?.name || `Item #${item.productId}`;
                const amount = item.price * item.qty;
                if (i % 2 === 0)
                    doc.rect(50, rowY, pageWidth, 20).fill('#FBF3EC');
                doc.fillColor('#222');
                doc.text(name, col.item + 4, rowY + 6, { width: 200 });
                doc.text(item.weightLabel || '—', col.weight + 4, rowY + 6);
                doc.text(String(item.qty), col.qty + 4, rowY + 6);
                doc.text(`₹${item.price.toFixed(2)}`, col.rate + 4, rowY + 6);
                doc.text(`₹${amount.toFixed(2)}`, col.amount + 4, rowY + 6, { width: 80, align: 'right' });
                rowY += 20;
            }
            doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#e0c9b5').lineWidth(0.5).stroke();
            rowY += 10;
            const totalsX = 360;
            const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.qty, 0);
            const delivery = order.deliveryCharge ?? 0;
            const total = order.total ?? subtotal + delivery;
            doc.fillColor('#555').font('Helvetica').fontSize(9);
            doc.text('Subtotal:', totalsX, rowY);
            doc.text(`₹${subtotal.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' });
            rowY += 16;
            doc.text('Delivery Charge:', totalsX, rowY);
            doc.fillColor(delivery === 0 ? 'green' : '#555');
            doc.text(delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' });
            rowY += 6;
            doc.moveTo(totalsX, rowY).lineTo(545, rowY).strokeColor(brandColor).lineWidth(0.8).stroke();
            rowY += 8;
            doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(11);
            doc.text('TOTAL:', totalsX, rowY);
            doc.text(`₹${total.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' });
            rowY += 36;
            doc.fillColor('#888').font('Helvetica').fontSize(8)
                .text('Payment Method: Cash on Delivery / Online', 50, rowY);
            rowY += 12;
            doc.text('Expected delivery: 3–7 business days.', 50, rowY);
            const footerY = doc.page.height - 70;
            doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#ddd').lineWidth(0.5).stroke();
            doc.fillColor('#aaa').fontSize(8).font('Helvetica')
                .text('Thank you for choosing Nutresa! For support, email info@nutresa.in', 50, footerY + 10, { align: 'center', width: pageWidth });
            doc.end();
        });
    }
    async generateAdminInvoice(order) {
        const PDFDocument = require('pdfkit');
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 40,
                size: 'A4',
            });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            doc.on('error', reject);
            doc.fontSize(22)
                .text('ADMIN COPY', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Order ID: ${order.id}`);
            doc.text(`Order Status: ${order.status}`);
            doc.text(`Customer Name: ${order.user?.name || '-'}`);
            doc.text(`Customer Email: ${order.user?.email || '-'}`);
            doc.text(`Customer Phone: ${order.user?.phone || '-'}`);
            doc.moveDown();
            doc.fontSize(16);
            doc.text('Products');
            doc.moveDown(0.5);
            order.items.forEach((item) => {
                const name = item.product?.name ||
                    item.productName ||
                    'Product';
                const qty = item.quantity || 0;
                const price = Number(item.price || 0);
                doc.fontSize(11);
                doc.text(`${name}  |  Qty: ${qty}  |  ₹${price}`);
            });
            doc.moveDown();
            doc.fontSize(14)
                .text(`Grand Total: ₹${order.total}`);
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map