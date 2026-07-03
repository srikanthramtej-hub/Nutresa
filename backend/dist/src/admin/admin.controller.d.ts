import { AdminService } from './admin.service';
export declare class AdminController {
    private admin;
    constructor(admin: AdminService);
    getDashboard(): Promise<{
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string | null;
            googleId: string | null;
            role: string;
            phone: string | null;
        };
        items: ({
            product: {
                id: number;
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
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            orderId: string;
            productId: number;
            qty: number;
            price: number;
            weightLabel: string;
        })[];
    } & {
        total: number;
        subtotal: number;
        deliveryCharge: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        address: string;
    })[]>;
    updateOrderStatus(id: string, body: {
        status: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string | null;
            googleId: string | null;
            role: string;
            phone: string | null;
        };
        items: ({
            product: {
                id: number;
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
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            orderId: string;
            productId: number;
            qty: number;
            price: number;
            weightLabel: string;
        })[];
    } & {
        total: number;
        subtotal: number;
        deliveryCharge: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        address: string;
    }>;
    downloadInvoice(id: string, res: any): Promise<void>;
    downloadLabel(id: string, res: any): Promise<any>;
    getAllProducts(): Promise<({
        weightOptions: {
            id: number;
            productId: number;
            price: number;
            label: string;
            grams: number;
        }[];
    } & {
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createProduct(files: Express.Multer.File[], body: any): Promise<{
        weightOptions: {
            id: number;
            productId: number;
            price: number;
            label: string;
            grams: number;
        }[];
    } & {
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProduct(id: number, files: Express.Multer.File[], body: any): Promise<{
        weightOptions: {
            id: number;
            productId: number;
            price: number;
            label: string;
            grams: number;
        }[];
    } & {
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStock(id: number, body: {
        stock: number;
    }): Promise<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteProduct(id: number): Promise<{
        id: number;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllCustomers(): Promise<({
        _count: {
            orders: number;
        };
        orders: {
            total: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string | null;
        googleId: string | null;
        role: string;
        phone: string | null;
    })[]>;
    exportCSV(res: any): Promise<void>;
    getDeliverySettings(): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
    }>;
    updateDeliverySettings(body: {
        deliveryCharge: number;
        freeDeliveryAbove: number;
    }): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
    }>;
    downloadCustomerInvoice(id: string, res: any): Promise<void>;
    downloadAdminInvoice(id: string, res: any): Promise<void>;
}
