import { Injectable } from '@nestjs/common'

@Injectable()
export class PdfService {

  // ── Customer invoice — A4 (unchanged) ──
  async generateInvoice(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const PDFDocument = require('pdfkit')
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end',  () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageWidth  = doc.page.width - 100
      const brandColor = '#7F2020'

      // Header
      doc.fillColor(brandColor).fontSize(26).font('Helvetica-Bold').text('NUTRESA', 50, 50)
      doc.fillColor('#555').fontSize(9).font('Helvetica')
        .text('Premium Dry Fruits & Nuts', 50, 80)
        .text('Vijayawada, Andhra Pradesh', 50, 92)
        .text('info@nutresa.in  |  nutresa.in', 50, 104)

      doc.fillColor(brandColor).fontSize(22).font('Helvetica-Bold')
        .text('INVOICE', 400, 50, { align: 'right', width: 145 })
      doc.fillColor('#333').fontSize(9).font('Helvetica')
        .text(`Invoice No: ${order.id}`, 400, 80, { align: 'right', width: 145 })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 400, 92, { align: 'right', width: 145 })
        .text(`Status: ${order.status}`, 400, 104, { align: 'right', width: 145 })

      doc.moveTo(50, 125).lineTo(545, 125).strokeColor(brandColor).lineWidth(1.5).stroke()

      // Bill To
      const address = (() => { try { return JSON.parse(order.address) } catch { return {} } })()
      doc.y = 140
      doc.fillColor(brandColor).fontSize(10).font('Helvetica-Bold').text('BILL TO', 50, doc.y)
      doc.y += 14
      doc.fillColor('#333').fontSize(9).font('Helvetica').text(order.user?.name || '—', 50, doc.y)
      doc.y += 12
      if (address.line1)                   { doc.text(address.line1, 50, doc.y); doc.y += 12 }
      if (address.city || address.state)   { doc.text([address.city, address.state].filter(Boolean).join(', '), 50, doc.y); doc.y += 12 }
      if (address.pin)                     { doc.text(`PIN: ${address.pin}`, 50, doc.y); doc.y += 12 }
      if (address.phone || order.user?.phone) { doc.text(`Phone: ${address.phone || order.user?.phone}`, 50, doc.y); doc.y += 12 }
      if (order.user?.email)               { doc.text(`Email: ${order.user.email}`, 50, doc.y); doc.y += 12 }

      // Items Table
      const tableTop = Math.max(doc.y + 20, 240)
      doc.rect(50, tableTop, pageWidth, 22).fill(brandColor)
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      const col = { item: 50, weight: 260, qty: 340, rate: 400, amount: 460 }
      doc.text('PRODUCT',    col.item   + 4, tableTop + 7)
      doc.text('WEIGHT',     col.weight + 4, tableTop + 7)
      doc.text('QTY',        col.qty    + 4, tableTop + 7)
      doc.text('RATE (Rs.)', col.rate   + 4, tableTop + 7)
      doc.text('AMOUNT',     col.amount + 4, tableTop + 7, { width: 80, align: 'right' })

      let rowY = tableTop + 22
      doc.font('Helvetica').fontSize(9)
      for (let i = 0; i < order.items.length; i++) {
        const item   = order.items[i]
        const name   = item.product?.name || `Item #${item.productId}`
        const amount = item.price * item.qty
        if (i % 2 === 0) doc.rect(50, rowY, pageWidth, 20).fill('#FBF3EC')
        doc.fillColor('#222')
        doc.text(name,                          col.item   + 4, rowY + 6, { width: 200 })
        doc.text(item.weightLabel || '—',       col.weight + 4, rowY + 6)
        doc.text(String(item.qty),              col.qty    + 4, rowY + 6)
        doc.text(`Rs.${item.price.toFixed(2)}`, col.rate   + 4, rowY + 6)
        doc.text(`Rs.${amount.toFixed(2)}`,     col.amount + 4, rowY + 6, { width: 80, align: 'right' })
        rowY += 20
      }
      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#e0c9b5').lineWidth(0.5).stroke()

      // Totals
      rowY += 10
      const totalsX    = 360
      const subtotal   = order.subtotal   ?? order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
      const delivery   = order.deliveryCharge ?? 0
      const gstEnabled = order.gstEnabled ?? false
      const gstRate    = order.gstRate    ?? 0
      const gstAmount  = order.gstAmount  ?? 0
      const total      = order.total      ?? subtotal + delivery + gstAmount

      doc.fillColor('#555').font('Helvetica').fontSize(9)
      doc.text('Subtotal:',        totalsX, rowY); doc.text(`Rs.${subtotal.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' }); rowY += 16
      doc.text('Delivery Charge:', totalsX, rowY)
      doc.fillColor(delivery === 0 ? 'green' : '#555')
      doc.text(delivery === 0 ? 'FREE' : `Rs.${delivery.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' })
      doc.fillColor('#555'); rowY += 16
      if (gstEnabled && gstAmount > 0) {
        doc.fillColor(brandColor).font('Helvetica-Bold')
        doc.text(`GST (${gstRate}%):`, totalsX, rowY); doc.text(`Rs.${gstAmount.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' })
        doc.fillColor('#555').font('Helvetica'); rowY += 16
      }
      rowY += 6
      doc.moveTo(totalsX, rowY).lineTo(545, rowY).strokeColor(brandColor).lineWidth(0.8).stroke(); rowY += 8
      doc.fillColor(brandColor).font('Helvetica-Bold').fontSize(11)
      doc.text('TOTAL:', totalsX, rowY); doc.text(`Rs.${total.toFixed(2)}`, totalsX + 100, rowY, { width: 85, align: 'right' })

      // Footer
      rowY += 36
      doc.fillColor('#888').font('Helvetica').fontSize(8).text('Payment Method: Cash on Delivery / Online', 50, rowY); rowY += 12
      doc.text('Expected delivery: 3-7 business days.', 50, rowY)
      const footerY = doc.page.height - 70
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#ddd').lineWidth(0.5).stroke()
      doc.fillColor('#aaa').fontSize(8).font('Helvetica')
        .text('Thank you for choosing Nutresa! For support, email info@nutresa.in', 50, footerY + 10, { align: 'center', width: pageWidth })

      doc.end()
    })
  }

  // ── Admin shipping label — 4×6 inches (288×432 pt) ──
  // Compact format like Flipkart / Amazon box labels
  async generateAdminInvoice(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const PDFDocument = require('pdfkit')

      // 4 inches × 6 inches in points (1 inch = 72 pt)
      const W = 288   // 4 inches
      const H = 432   // 6 inches
      const M = 10    // margin

      const doc = new PDFDocument({ size: [W, H], margin: M })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end',  () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      const address    = (() => { try { return JSON.parse(order.address) } catch { return {} } })()
      const subtotal   = order.subtotal   ?? order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
      const delivery   = order.deliveryCharge ?? 0
      const gstEnabled = order.gstEnabled ?? false
      const gstRate    = order.gstRate    ?? 0
      const gstAmount  = order.gstAmount  ?? 0
      const total      = order.total      ?? subtotal + delivery + gstAmount

      const brandColor = '#7F2020'
      const usableW    = W - M * 2

      let y = M

      // ── HEADER BAND ──
      doc.rect(0, 0, W, 36).fill(brandColor)
      doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
        .text('NUTRESA', M, 8, { width: usableW / 2 })
      doc.fontSize(6).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
        .text('PURE NUTRITION, DAILY POWER', M, 22, { width: usableW / 2 })
      doc.fillColor('white').fontSize(7).font('Helvetica-Bold')
        .text('SHIPPING LABEL', M, 8, { align: 'right', width: usableW })
      doc.fontSize(6).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
        .text(`Order: ${order.id.slice(0, 16)}...`, M, 22, { align: 'right', width: usableW })
      y = 40

      // ── SHIP TO ──
      doc.rect(M, y, usableW, 11).fill('#f0e6d3')
      doc.fillColor(brandColor).fontSize(6).font('Helvetica-Bold')
        .text('SHIP TO', M + 3, y + 2, { characterSpacing: 0.8 })
      y += 13

      doc.fillColor('#111').fontSize(8).font('Helvetica-Bold')
        .text(address.name || order.user?.name || '—', M, y, { width: usableW })
      y += 11
      if (address.phone) {
        doc.fontSize(7).font('Helvetica').fillColor('#333')
          .text(`📞 ${address.phone}`, M, y); y += 10
      }
      if (address.line1) {
        doc.fontSize(7).font('Helvetica').fillColor('#333')
          .text(address.line1, M, y, { width: usableW }); y += 10
      }
      if (address.city || address.state) {
        doc.text(`${address.city || ''}, ${address.state || ''}`, M, y); y += 10
      }
      if (address.pin) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#111')
          .text(`PIN: ${address.pin}`, M, y); y += 11
      }

      // ── DIVIDER ──
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#d4b89a').lineWidth(0.5).stroke()
      y += 5

      // ── SHIP FROM ──
      doc.rect(M, y, usableW, 11).fill('#f0e6d3')
      doc.fillColor(brandColor).fontSize(6).font('Helvetica-Bold')
        .text('SHIP FROM', M + 3, y + 2, { characterSpacing: 0.8 })
      y += 13

      doc.fillColor('#111').fontSize(7.5).font('Helvetica-Bold').text('Nutresa Foods Pvt. Ltd.', M, y); y += 10
      doc.fontSize(7).font('Helvetica').fillColor('#333')
        .text('Vijayawada, Andhra Pradesh — 520001', M, y); y += 10
      doc.text('info@nutresa.in  |  nutresa.in', M, y); y += 11

      // ── DIVIDER ──
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#d4b89a').lineWidth(0.5).stroke()
      y += 5

      // ── ORDER INFO ──
      doc.rect(M, y, usableW, 11).fill('#f0e6d3')
      doc.fillColor(brandColor).fontSize(6).font('Helvetica-Bold')
        .text('ORDER DETAILS', M + 3, y + 2, { characterSpacing: 0.8 })
      y += 13

      // Date + status in one row
      doc.fontSize(7).font('Helvetica').fillColor('#333')
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, M, y)
      doc.fontSize(7).font('Helvetica-Bold').fillColor(brandColor)
        .text(order.status?.replace(/_/g, ' ') || 'PLACED', M, y, { align: 'right', width: usableW })
      y += 11

      // ── ITEMS ──
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#e0c9b5').lineWidth(0.3).stroke(); y += 4

      for (const item of order.items) {
        const name   = item.product?.name || 'Product'
        const amount = item.price * item.qty

        doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#111')
          .text(name, M, y, { width: usableW * 0.62 })
        doc.fontSize(7).font('Helvetica').fillColor('#555')
          .text(`${item.weightLabel} × ${item.qty}`, M, y + 10, { width: usableW * 0.62 })
        doc.fontSize(8).font('Helvetica-Bold').fillColor(brandColor)
          .text(`Rs.${amount.toFixed(2)}`, M, y + 5, { align: 'right', width: usableW })

        y += 22
        doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#f0e6d3').lineWidth(0.3).stroke()
        y += 3
      }

      y += 4

      // ── TOTALS ──
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#d4b89a').lineWidth(0.5).stroke(); y += 5

      const totRow = (label: string, val: string, bold = false, color = '#333') => {
        doc.fontSize(7).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color)
          .text(label, M, y)
          .text(val, M, y, { align: 'right', width: usableW })
        y += 10
      }

      totRow('Subtotal', `Rs.${subtotal.toFixed(2)}`)
      totRow('Delivery', delivery === 0 ? 'FREE' : `Rs.${delivery.toFixed(2)}`, false, delivery === 0 ? 'green' : '#333')
      if (gstEnabled && gstAmount > 0) totRow(`GST (${gstRate}%)`, `Rs.${gstAmount.toFixed(2)}`, false, brandColor)

      // Grand total bar
      doc.rect(M, y, usableW, 18).fill(brandColor)
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
        .text('TOTAL PAID', M + 4, y + 5)
        .text(`Rs.${total.toFixed(2)}`, M, y + 5, { align: 'right', width: usableW - 4 })
      y += 22

      // ── FOOTER ──
      if (y < H - 22) {
        doc.moveTo(M, H - 18).lineTo(W - M, H - 18).strokeColor('#e0c9b5').lineWidth(0.3).stroke()
        doc.fillColor('#aaa').fontSize(6).font('Helvetica')
          .text('Thank you for shopping with Nutresa!', M, H - 14, { align: 'center', width: usableW })
      }

      doc.end()
    })
  }
}