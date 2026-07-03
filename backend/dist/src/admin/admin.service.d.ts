import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
export declare class AdminService {
    private prisma;
    private pdf;
    constructor(prisma: PrismaService, pdf: PdfService);
    getDashboardStats(): Promise<{
        totalOrders: number;
        totalUsers: number;
        pendingOrders: number;
        totalRevenue: number;
        lowStockProducts: {
            id: number;
            name: string;
            stock: number;
            imageUrl: string;
            imageUrls: string;
        }[];
    }>;
    getAllOrders(): Promise<({
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
    })[]>;
    updateOrderStatus(orderId: string, status: string): Promise<{
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
    getOrderInvoicePdf(orderId: string): Promise<Buffer>;
    getAdminInvoicePdf(orderId: string): Promise<Buffer>;
    getAllProducts(): Promise<({
        weightOptions: {
            id: number;
            price: number;
            productId: number;
            label: string;
            grams: number;
        }[];
    } & {
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
    })[]>;
    private parseTags;
    createProduct(data: any, imageUrls?: string[]): Promise<{
        weightOptions: {
            id: number;
            price: number;
            productId: number;
            label: string;
            grams: number;
        }[];
    } & {
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
    }>;
    updateProduct(id: number, data: any, newImageUrls?: string[], existingImages?: string[]): Promise<{
        weightOptions: {
            id: number;
            price: number;
            productId: number;
            label: string;
            grams: number;
        }[];
    } & {
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
    }>;
    updateStock(productId: number, stock: number): Promise<{
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
    }>;
    deleteProduct(id: number): Promise<{
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
    }>;
    getAllCustomers(): Promise<({
        orders: {
            total: number;
        }[];
        _count: {
            orders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        password: string | null;
        googleId: string | null;
        role: string;
        phone: string | null;
    })[]>;
    getCustomersCSV(): Promise<string>;
    private readonly DELIVERY_SETTINGS_KEY;
    getDeliverySettings(): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
    }>;
    updateDeliverySettings(deliveryCharge: number, freeDeliveryAbove: number): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
    }>;
    computeDeliveryCharge(subtotal: number): Promise<number>;
}
