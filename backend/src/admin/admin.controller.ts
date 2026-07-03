import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, UseGuards, Res,
  UseInterceptors, UploadedFiles, ParseIntPipe,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../auth/admin.guard'

const uploadDir = join(process.cwd(), 'uploads', 'products')
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

const productImageStorage = diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir) },
  filename:    (req, file, cb) => { cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`) },
})
const imageFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'), false)
  cb(null, true)
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  getDashboard() { return this.admin.getDashboardStats() }

  // ── Orders ──

  @Get('orders')
  getAllOrders() { return this.admin.getAllOrders() }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.admin.updateOrderStatus(id, body.status)
  }

  

  // Duplicate bill — admin downloads the same PDF invoice as the customer
 @Get('orders/:id/invoice')
async downloadInvoice(
  @Param('id') id: string,
  @Res() res: any,
) {
  try {
    const pdfBuffer = await this.admin.getOrderInvoicePdf(id)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice_${id}.pdf`,
    )

    res.send(pdfBuffer)
  } catch (error) {
    res.status(404).json({
      message: 'Order not found',
    })
  }
}

  @Get('orders/:id/label')
  async downloadLabel(@Param('id') id: string, @Res() res: any) {
    const orders = await this.admin.getAllOrders()
    const order  = orders.find(o => o.id === id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `attachment; filename=label_${id}.txt`)
    res.send(`NUTRESA SHIPPING LABEL\nOrder: ${order.id}\nCustomer: ${order.user.name}\nTotal: ₹${order.total}`)
  }

  // ── Products ──

  @Get('products')
  getAllProducts() { return this.admin.getAllProducts() }

  @Post('products')
  @UseInterceptors(FilesInterceptor('images', 5, { storage: productImageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async createProduct(@UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    try {
      const imageUrls = (files || []).map(f => `/uploads/products/${f.filename}`)
      if (body.weightOptions && typeof body.weightOptions === 'string') {
        try { body.weightOptions = JSON.parse(body.weightOptions) } catch { body.weightOptions = [] }
      }
      if (body.tags && typeof body.tags === 'string') {
        try { body.tags = JSON.parse(body.tags) } catch { body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }
      }
      body.isNew = body.isNew === 'true' || body.isNew === true
      body.isActive = body.isActive !== 'false'
      return await this.admin.createProduct(body, imageUrls)
    } catch (err) { console.error('Create product error:', err); throw err }
  }

  @Put('products/:id')
  @UseInterceptors(FilesInterceptor('images', 5, { storage: productImageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async updateProduct(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    try {
      const newImageUrls = files && files.length > 0 ? files.map(f => `/uploads/products/${f.filename}`) : undefined
      if (body.weightOptions && typeof body.weightOptions === 'string') {
        try { body.weightOptions = JSON.parse(body.weightOptions) } catch { body.weightOptions = [] }
      }
      if (body.tags && typeof body.tags === 'string') {
        try { body.tags = JSON.parse(body.tags) } catch { body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }
      }
      if (body.isNew !== undefined) body.isNew = body.isNew === 'true' || body.isNew === true
      const existingImages = body.existingImages ? body.existingImages.split(',').filter(Boolean) : []
      return await this.admin.updateProduct(id, body, newImageUrls, existingImages)
    } catch (err) { console.error('Update product error:', err); throw err }
  }

  @Patch('products/:id/stock')
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() body: { stock: number }) {
    return this.admin.updateStock(id, body.stock)
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) { return this.admin.deleteProduct(id) }

  // ── Customers ──

  @Get('customers')
  getAllCustomers() { return this.admin.getAllCustomers() }

  @Get('customers/export')
  async exportCSV(@Res() res: any) {
    const csv = await this.admin.getCustomersCSV()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=nutrinest_customers.csv')
    res.send(csv)
  }

  // ── Delivery charge settings ──

  @Get('settings/delivery')
  getDeliverySettings() { return this.admin.getDeliverySettings() }

  @Put('settings/delivery')
  updateDeliverySettings(@Body() body: { deliveryCharge: number; freeDeliveryAbove: number }) {
    return this.admin.updateDeliverySettings(Number(body.deliveryCharge), Number(body.freeDeliveryAbove))
  }

  @Get('orders/:id/customer-invoice')
async downloadCustomerInvoice(
  @Param('id') id: string,
  @Res() res: any,
) {
  const pdf = await this.admin.getOrderInvoicePdf(id)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=customer_invoice_${id}.pdf`,
  )

  res.send(pdf)
}

@Get('orders/:id/admin-invoice')
async downloadAdminInvoice(
  @Param('id') id: string,
  @Res() res: any,
) {
  const pdf = await this.admin.getAdminInvoicePdf(id)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=admin_invoice_${id}.pdf`,
  )

  res.send(pdf)
}

}