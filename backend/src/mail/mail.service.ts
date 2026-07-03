import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { generateOrderPDF } from './pdf.util'

function getDeliveryCharge(subtotal: number): number {
  if (subtotal >= 999) return 0
  if (subtotal >= 500) return 49
  return 79
}

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  // gst is optional — pass { enabled: true, rate: 5 } when GST is ON in admin settings
  async sendOrderConfirmation(to: string, order: any, gst?: { enabled: boolean; rate: number }) {
    const subtotal       = order.subtotal ?? order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const deliveryCharge = order.deliveryCharge ?? getDeliveryCharge(subtotal)
    const gstEnabled      = gst?.enabled || false
    const gstRate          = gst?.rate || 0
    const gstAmount        = gstEnabled ? Math.round(subtotal * gstRate / 100) : 0
    const total            = order.total ?? (subtotal + deliveryCharge + gstAmount)

    const itemsList = order.items.map((i: any) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #f0e6d3">
        <strong>${i.product?.name || 'Item'}</strong><br/>
        <span style="font-size:12px;color:#9c8080">${i.weightLabel || ''}</span>
      </td>
      <td style="padding:8px;border-bottom:1px solid #f0e6d3;text-align:center">${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #f0e6d3;text-align:right">₹${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('')

    // ── Generate the PDF and attach it ──
    const pdfBuffer = await generateOrderPDF(order, gst)

    await this.transporter.sendMail({
      from: '"Nutresa 🌿" <orders@nutresa.in>', to,
      subject: `Order Confirmed — ${order.id}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#2c1f1f">
          <div style="background:#7F2020;padding:28px;text-align:center;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:24px">🌿 Nutresa</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0">Order Confirmed!</p>
          </div>
          <div style="padding:28px;border:1px solid #f0e6d3;border-top:none;border-radius:0 0 12px 12px">
            <h2 style="color:#4a1212">Thank you, ${order.user?.name}! 🎉</h2>
            <p>Your order <strong>${order.id}</strong> has been placed successfully.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <thead><tr style="background:#F3E4C9">
                <th style="padding:10px;text-align:left">Product</th>
                <th style="padding:10px;text-align:center">Qty</th>
                <th style="padding:10px;text-align:right">Amount</th>
              </tr></thead>
              <tbody>${itemsList}</tbody>
            </table>
            <div style="background:#F3E4C9;border-radius:8px;padding:16px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#555">
                <span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:${gstEnabled && gstAmount > 0 ? '8px' : '12px'};color:#555">
                <span>Delivery Charges</span>
                <span style="color:${deliveryCharge === 0 ? 'green' : '#555'}">${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge.toFixed(2)}</span>
              </div>
              ${gstEnabled && gstAmount > 0 ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#7F2020;font-weight:600">
                <span>GST (${gstRate}%)</span><span>₹${gstAmount.toFixed(2)}</span>
              </div>` : ''}
              <div style="display:flex;justify-content:space-between;border-top:1px solid #d4b89a;padding-top:10px">
                <strong style="font-size:16px;color:#7F2020">Total</strong>
                <strong style="font-size:18px;color:#7F2020">₹${total.toFixed(2)}</strong>
              </div>
            </div>
            <p style="margin-top:20px;color:#9c8080">Expected delivery: 3–7 business days.</p>
            <p style="margin-top:8px;color:#9c8080;font-size:13px">📎 A detailed invoice is attached as a PDF to this email.</p>
          </div>
        </div>`,
      attachments: [
        {
          filename: `Nutresa_Order_${order.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
  }

  async sendAdminOrderNotification(order: any, gst?: { enabled: boolean; rate: number }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nutresa.in'
    const subtotal   = order.subtotal ?? order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
    const deliveryCharge = order.deliveryCharge ?? getDeliveryCharge(subtotal)
    const gstEnabled = gst?.enabled || false
    const gstRate     = gst?.rate || 0
    const gstAmount   = gstEnabled ? Math.round(subtotal * gstRate / 100) : 0

    const itemRows = order.items.map((i: any) => `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.product?.name || 'Item'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.weightLabel}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">₹${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('')

    await this.transporter.sendMail({
      from: '"Nutresa System" <system@nutresa.in>', to: adminEmail,
      subject: `🛒 New Order — ${order.id} — ₹${order.total}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#7F2020">New Order Received</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Customer:</strong> ${order.user?.name} (${order.user?.email})</p>
          <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">
            <thead><tr style="background:#F3E4C9">
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:left">Weight</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Amount</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="background:#f9f9f9;border-radius:6px;padding:12px;margin-top:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#666">
              <span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#666">
              <span>Delivery</span><span>${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge.toFixed(2)}</span>
            </div>
            ${gstEnabled && gstAmount > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#7F2020;font-weight:600">
              <span>GST (${gstRate}%)</span><span>₹${gstAmount.toFixed(2)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;border-top:2px solid #7F2020;padding-top:8px">
              <strong>Total</strong><strong style="color:#7F2020">₹${order.total.toFixed(2)}</strong>
            </div>
          </div>
          <p style="margin-top:16px">
            <a href="${process.env.FRONTEND_URL}/admin" style="display:inline-block;padding:10px 20px;background:#7F2020;color:white;border-radius:6px;text-decoration:none;font-size:14px">
              View in Admin Panel →
            </a>
          </p>
        </div>`,
    })
  }

  async sendReorderReminder(order: any) {
    const to = order.user.email, name = order.user.name
    const itemsList = order.items.map((i: any) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f0e6d3">
        <div style="flex:1">
          <div style="font-weight:600;color:#2c1f1f">${i.product?.name || 'Product'}</div>
          <div style="font-size:12px;color:#9c8080">${i.weightLabel} × ${i.qty}</div>
        </div>
        <div style="font-weight:700;color:#7F2020">₹${(i.price * i.qty).toFixed(2)}</div>
      </div>`).join('')
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    await this.transporter.sendMail({
      from: '"Nutresa 🌿" <hello@nutresa.in>', to,
      subject: `${name}, it's been a month! 🌿 Time to restock?`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#2c1f1f;background:#faf7f7;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#7F2020,#4a1212);padding:36px;text-align:center">
            <div style="font-size:48px;margin-bottom:12px">🌿</div>
            <h1 style="color:white;margin:0;font-size:26px;font-weight:700">It's been 1 month!</h1>
            <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:15px">Time to restock your Nutresa favourites?</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:16px;color:#2c1f1f;margin-bottom:8px">Hi <strong>${name}</strong>! 👋</p>
            <p style="color:#5c4040;line-height:1.7;margin-bottom:24px">
              It's been exactly <strong>30 days</strong> since your last Nutresa order. Don't let your stash run out! 🥜
            </p>
            <div style="background:white;border-radius:12px;padding:20px;border:1px solid #f0e6d3;margin-bottom:24px">
              <h3 style="color:#7F2020;margin:0 0 14px;font-size:15px">📦 Your last order included:</h3>
              ${itemsList}
            </div>
            <div style="text-align:center;margin-bottom:24px">
              <a href="${frontendUrl}/shop" style="display:inline-block;padding:16px 40px;background:#7F2020;color:white;border-radius:12px;text-decoration:none;font-size:16px;font-weight:700">
                🛒 Reorder Now
              </a>
            </div>
          </div>
          <div style="background:#F3E4C9;padding:18px;text-align:center">
            <p style="font-size:12px;color:#9c8080;margin:0">
              © ${new Date().getFullYear()} Nutresa · Vijayawada, Andhra Pradesh ·
              <a href="${frontendUrl}" style="color:#7F2020;text-decoration:none">nutresa.in</a>
            </p>
          </div>
        </div>`,
    })
  }
}