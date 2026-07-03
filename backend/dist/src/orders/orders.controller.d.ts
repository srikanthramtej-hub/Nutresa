import { OrdersService } from './orders.service';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    createOrder(body: {
        items: any[];
        address: any;
        subtotal: number;
        total?: number;
    }, req: any): Promise<{
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
    getDeliveryCharge(subtotal: number): Promise<{
        deliveryCharge: number;
        freeDeliveryAbove: number;
        total: number;
    }>;
    getMyOrders(req: any): Promise<({
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
    trackOrder(id: string): Promise<{
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
    downloadInvoice(id: string, req: any, res: any): Promise<void>;
    getOrder(id: string, req: any): Promise<{
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
}
