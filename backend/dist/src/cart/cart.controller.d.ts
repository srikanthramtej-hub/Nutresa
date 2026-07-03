import { CartService } from './cart.service';
export declare class CartController {
    private cart;
    constructor(cart: CartService);
    getCart(req: any): import(".prisma/client").Prisma.PrismaPromise<({
        product: {
            weightOptions: {
                id: number;
                label: string;
                grams: number;
                price: number;
                productId: number;
            }[];
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            basePrice: number;
            stock: number;
            isNew: boolean;
            description: string;
            origin: string | null;
            shelfLife: string | null;
            tags: string;
            imageUrl: string | null;
            imageUrls: string;
            isActive: boolean;
        };
    } & {
        id: number;
        price: number;
        productId: number;
        userId: string;
        qty: number;
        weightLabel: string;
    })[]>;
    addItem(body: {
        productId: number;
        weightLabel: string;
        price: number;
        qty: number;
    }, req: any): Promise<{
        product: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            basePrice: number;
            stock: number;
            isNew: boolean;
            description: string;
            origin: string | null;
            shelfLife: string | null;
            tags: string;
            imageUrl: string | null;
            imageUrls: string;
            isActive: boolean;
        };
    } & {
        id: number;
        price: number;
        productId: number;
        userId: string;
        qty: number;
        weightLabel: string;
    }>;
    updateQty(id: number, body: {
        qty: number;
    }, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    removeItem(id: number, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    clearCart(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
