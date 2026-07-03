import { PrismaService } from '../prisma/prisma.service';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    upsertItem(userId: string, productId: number, weightLabel: string, price: number, qty: number): Promise<{
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
    updateQty(userId: string, cartItemId: number, qty: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    removeItem(userId: string, cartItemId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    clearCart(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
