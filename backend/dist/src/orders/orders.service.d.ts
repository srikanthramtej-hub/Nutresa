import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';
import { AdminService } from '../admin/admin.service';
export declare class OrdersService {
    private prisma;
    private mail;
    private pdf;
    private adminService;
    constructor(prisma: PrismaService, mail: MailService, pdf: PdfService, adminService: AdminService);
    createOrder(userId: string, items: any[], address: any, subtotal: number): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
            password: string | null;
            googleId: string | null;
            role: string;
            phone: string | null;
        };
        items: ({
            product: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                category: string;
                basePrice: number;
                description: string;
                stock: number;
                tags: string;
                isNew: boolean;
                imageUrl: string | null;
                imageUrls: string;
                origin: string | null;
                shelfLife: string | null;
                isActive: boolean;
            };
        } & {
            id: number;
            qty: number;
            price: number;
            weightLabel: string;
            productId: number;
            orderId: string;
        })[];
    } & {
        id: string;
        subtotal: number;
        deliveryCharge: number;
        total: number;
        status: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getUserOrders(userId: string): Promise<({
        items: ({
            product: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                category: string;
                basePrice: number;
                description: string;
                stock: number;
                tags: string;
                isNew: boolean;
                imageUrl: string | null;
                imageUrls: string;
                origin: string | null;
                shelfLife: string | null;
                isActive: boolean;
            };
        } & {
            id: number;
            qty: number;
            price: number;
            weightLabel: string;
            productId: number;
            orderId: string;
        })[];
    } & {
        id: string;
        subtotal: number;
        deliveryCharge: number;
        total: number;
        status: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    getOrderById(id: string, userId: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string;
            password: string | null;
            googleId: string | null;
            role: string;
            phone: string | null;
        };
        items: ({
            product: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                category: string;
                basePrice: number;
                description: string;
                stock: number;
                tags: string;
                isNew: boolean;
                imageUrl: string | null;
                imageUrls: string;
                origin: string | null;
                shelfLife: string | null;
                isActive: boolean;
            };
        } & {
            id: number;
            qty: number;
            price: number;
            weightLabel: string;
            productId: number;
            orderId: string;
        })[];
    } & {
        id: string;
        subtotal: number;
        deliveryCharge: number;
        total: number;
        status: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    trackOrderById(id: string): Promise<{
        user: {
            name: string;
            email: string;
        };
        items: ({
            product: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                category: string;
                basePrice: number;
                description: string;
                stock: number;
                tags: string;
                isNew: boolean;
                imageUrl: string | null;
                imageUrls: string;
                origin: string | null;
                shelfLife: string | null;
                isActive: boolean;
            };
        } & {
            id: number;
            qty: number;
            price: number;
            weightLabel: string;
            productId: number;
            orderId: string;
        })[];
    } & {
        id: string;
        subtotal: number;
        deliveryCharge: number;
        total: number;
        status: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getInvoicePdf(id: string, userId: string): Promise<Buffer>;
    getDeliveryCharge(subtotal: number): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
        total: number;
    }>;
}
