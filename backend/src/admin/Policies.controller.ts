// backend/src/admin/policies.controller.ts
// Add this file to your backend

import {
  Controller, Get, Put, Body, Param, UseGuards,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../auth/admin.guard'

// Default policy content — seeded if not in DB
const DEFAULTS = {
  privacy: {
    title: 'Privacy Policy',
    content: `<p>At Nutresa, we value your privacy and are committed to protecting your personal information.</p>
<h3>Information We Collect</h3>
<p>We may collect your name, phone number, email address, shipping address, and payment details when you place an order or contact us.</p>
<h3>How We Use Your Information</h3>
<ul><li>To process orders and deliver products</li><li>To improve our website and services</li><li>To send updates, offers, and promotional messages</li></ul>
<h3>Data Protection</h3>
<p>We implement appropriate security measures to protect your personal information.</p>
<h3>Third-Party Sharing</h3>
<p>We do not sell or rent your personal data. Information may be shared with trusted partners (like payment gateways and delivery services) for order fulfillment.</p>
<h3>Cookies</h3>
<p>Our website may use cookies to enhance user experience.</p>
<h3>Your Rights</h3>
<p>You can request to access, update, or delete your personal data at any time.</p>
<h3>Contact Us</h3>
<p>For privacy-related concerns, contact us at: <a href="mailto:info@nutresa.in">info@nutresa.in</a></p>`,
  },
  terms: {
    title: 'Terms & Conditions',
    content: `<p>By using this website, you agree to the following terms:</p>
<h3>Products & Pricing</h3><p>All prices are subject to change without prior notice.</p>
<h3>Order Acceptance</h3><p>We reserve the right to cancel or refuse any order.</p>
<h3>User Responsibility</h3><p>You agree not to misuse the website or engage in illegal activities.</p>
<h3>Intellectual Property</h3><p>All content (images, text, logo) belongs to Nutresa and cannot be used without permission.</p>
<h3>Limitation of Liability</h3><p>We are not liable for any indirect damages arising from the use of our website.</p>
<h3>Changes to Terms</h3><p>We may update these terms at any time without notice.</p>`,
  },
  shipping: {
    title: 'Shipping Policy',
    content: `<h3>Processing Time</h3><p>Orders are processed within 1–2 business days.</p>
<h3>Delivery Time</h3><p>Delivery typically takes 3–7 business days depending on location.</p>
<h3>Shipping Charges</h3><p>Shipping charges will be calculated at checkout or may be free for certain orders.</p>
<h3>Delays</h3><p>We are not responsible for delays caused by courier partners or unforeseen events.</p>`,
  },
  refund: {
    title: 'Return & Refund Policy',
    content: `<p>Due to the nature of food products, we do not accept returns once the product is delivered.</p>
<h3>Damaged or Wrong Product</h3><p>If you receive a damaged or incorrect product, contact us within 24 hours with proof (photo/video).</p>
<h3>Refund Process</h3><p>Eligible refunds will be processed within 5–7 working days.</p>
<h3>Non-Refundable Items</h3><p>Opened or used products are not eligible for return or refund.</p>`,
  },
  disclaimer: {
    title: 'Disclaimer',
    content: `<p>The information provided on this website is for general informational purposes only.</p>
<p>Nutresa products are not intended to diagnose, treat, cure, or prevent any disease. Always consult a healthcare professional before making dietary changes.</p>
<p>We do not guarantee specific results from using our products.</p>`,
  },
}

@Controller('policies')
export class PoliciesController {
  constructor(private prisma: PrismaService) {}

  // ── PUBLIC: frontend fetches all policies ──
  @Get()
  async getAllPolicies() {
    const saved = await this.prisma.policy.findMany()

    // Build result — use DB value if exists, else use default
    const result: Record<string, any> = {}
    for (const key of Object.keys(DEFAULTS)) {
      const fromDB = saved.find(p => p.key === key)
      result[key] = fromDB
        ? { title: fromDB.title, content: fromDB.content }
        : DEFAULTS[key]
    }
    return result
  }

  @Get(':key')
  async getPolicy(@Param('key') key: string) {
    const fromDB = await this.prisma.policy.findUnique({ where: { key } })
    if (fromDB) return { title: fromDB.title, content: fromDB.content }
    return DEFAULTS[key] || null
  }

  // ── ADMIN ONLY: update a policy ──
  @Put(':key')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updatePolicy(
    @Param('key') key: string,
    @Body() body: { title: string; content: string },
  ) {
    return this.prisma.policy.upsert({
      where: { key },
      update: { title: body.title, content: body.content },
      create: { key, title: body.title, content: body.content },
    })
  }
}