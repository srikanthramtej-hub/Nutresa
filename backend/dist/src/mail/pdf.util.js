"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderPDF = generateOrderPDF;
const PDFDocument = require("pdfkit");
const MAROON = '#7F2020';
const MAROON_DARK = '#4a1212';
const CREAM = '#F3E4C9';
const GRAY = '#9c8080';
const TEXT = '#2c1f1f';
function getDeliveryCharge(subtotal) {
    if (subtotal >= 999)
        return 0;
    if (subtotal >= 500)
        return 49;
    return 79;
}
function generateOrderPDF(order, gst) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const address = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
        const items = order.items || [];
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const shipping = getDeliveryCharge(subtotal);
        const gstEnabled = gst?.enabled || false;
        const gstRate = gst?.rate || 0;
        const gstAmount = gstEnabled ? Math.round(subtotal * gstRate / 100) : 0;
        const total = order.total ?? (subtotal + shipping + gstAmount);
        doc.rect(0, 0, doc.page.width, 90).fill(MAROON);
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('Nutresa', 40, 28);
        doc.fontSize(9).font('Helvetica').fillColor('#f3e4c9')
            .text('PURE NUTRITION, DAILY POWER', 40, 56, { characterSpacing: 1.5 });
        doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
            .text(order.id, 40, 28, { align: 'right', width: doc.page.width - 80 });
        doc.fontSize(9).font('Helvetica').fillColor('#f3e4c9')
            .text(`Order Confirmation · ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 46, { align: 'right', width: doc.page.width - 80 });
        let y = 120;
        const boxW = (doc.page.width - 80 - 16) / 2;
        doc.roundedRect(40, y, boxW, 70, 6).fillAndStroke('#faf7f7', '#f0e6d3');
        doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text('CUSTOMER', 52, y + 12, { characterSpacing: 0.5 });
        doc.fillColor(TEXT).fontSize(10).font('Helvetica-Bold').text(order.user?.name || '', 52, y + 26);
        doc.font('Helvetica').fontSize(9).fillColor(TEXT).text(order.user?.email || '', 52, y + 42);
        doc.roundedRect(40 + boxW + 16, y, boxW, 70, 6).fillAndStroke('#faf7f7', '#f0e6d3');
        doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text('DELIVERY ADDRESS', 52 + boxW + 16, y + 12, { characterSpacing: 0.5 });
        doc.fillColor(TEXT).fontSize(9).font('Helvetica')
            .text(`${address?.line1 || ''}`, 52 + boxW + 16, y + 26, { width: boxW - 24 })
            .text(`${address?.city || ''}, ${address?.state || ''} — ${address?.pin || ''}`, 52 + boxW + 16, y + 50, { width: boxW - 24 });
        y += 100;
        doc.fillColor(MAROON).rect(40, y, doc.page.width - 80, 26).fill();
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
        doc.text('PRODUCT', 52, y + 8);
        doc.text('QTY', doc.page.width - 200, y + 8, { width: 50, align: 'center' });
        doc.text('AMOUNT', doc.page.width - 130, y + 8, { width: 78, align: 'right' });
        y += 26;
        items.forEach((item, idx) => {
            const rowH = 28;
            if (idx % 2 === 0)
                doc.rect(40, y, doc.page.width - 80, rowH).fill('#faf7f7');
            doc.fillColor(TEXT).fontSize(10).font('Helvetica-Bold')
                .text(item.product?.name || item.name || 'Product', 52, y + 6, { width: 280 });
            doc.fontSize(8).font('Helvetica').fillColor(GRAY)
                .text(item.weightLabel || '', 52, y + 18);
            doc.fillColor(TEXT).fontSize(10).font('Helvetica')
                .text(String(item.qty), doc.page.width - 200, y + 9, { width: 50, align: 'center' });
            doc.font('Helvetica-Bold')
                .text(`Rs.${(item.price * item.qty).toFixed(2)}`, doc.page.width - 130, y + 9, { width: 78, align: 'right' });
            y += rowH;
        });
        y += 14;
        const totalsX = doc.page.width - 240;
        doc.fontSize(10).font('Helvetica').fillColor(TEXT);
        doc.text('Subtotal', totalsX, y, { width: 120 });
        doc.text(`Rs.${subtotal.toFixed(2)}`, totalsX + 120, y, { width: 80, align: 'right' });
        y += 18;
        doc.text('Delivery Charges', totalsX, y, { width: 120 });
        doc.fillColor(shipping === 0 ? '#16a34a' : TEXT)
            .text(shipping === 0 ? 'FREE' : `Rs.${shipping.toFixed(2)}`, totalsX + 120, y, { width: 80, align: 'right' });
        doc.fillColor(TEXT);
        y += 18;
        if (gstEnabled && gstAmount > 0) {
            doc.fillColor(MAROON).font('Helvetica-Bold');
            doc.text(`GST (${gstRate}%)`, totalsX, y, { width: 120 });
            doc.text(`Rs.${gstAmount.toFixed(2)}`, totalsX + 120, y, { width: 80, align: 'right' });
            doc.fillColor(TEXT).font('Helvetica');
            y += 18;
        }
        doc.moveTo(totalsX, y + 4).lineTo(doc.page.width - 40, y + 4).strokeColor(MAROON).lineWidth(1.5).stroke();
        y += 14;
        doc.fillColor(MAROON).fontSize(13).font('Helvetica-Bold');
        doc.text('Total Paid', totalsX, y, { width: 120 });
        doc.text(`Rs.${total.toFixed(2)}`, totalsX + 120, y, { width: 80, align: 'right' });
        y += 50;
        doc.roundedRect(40, y, doc.page.width - 80, 70, 6).fillAndStroke('#faf7f7', '#f0e6d3');
        doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text('DELIVERY INFORMATION', 52, y + 12, { characterSpacing: 0.5 });
        doc.fillColor(TEXT).fontSize(9).font('Helvetica')
            .text('Processing time: 1-2 business days', 52, y + 28)
            .text('Expected delivery: 3-7 business days', 52, y + 42)
            .text('Tracking updates will be sent to your email', 52, y + 56);
        const footerY = doc.page.height - 60;
        doc.moveTo(40, footerY).lineTo(doc.page.width - 40, footerY).strokeColor('#f0e6d3').lineWidth(1).stroke();
        doc.fillColor(GRAY).fontSize(8).font('Helvetica')
            .text('Thank you for shopping with Nutresa! | info@nutresa.com | Vijayawada, Andhra Pradesh', 40, footerY + 12, { align: 'center', width: doc.page.width - 80 });
        doc.end();
    });
}
//# sourceMappingURL=pdf.util.js.map