import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(category?: string): Promise<{
        id: any;
        name: any;
        category: any;
        basePrice: any;
        description: any;
        stock: any;
        tags: any;
        isNew: any;
        imageUrl: any;
        imageUrls: string[];
        origin: any;
        shelfLife: any;
        rating: number;
        reviewCount: any;
        reviews: any;
        weightOptions: any;
    }[]>;
    findOne(id: number): Promise<{
        id: any;
        name: any;
        category: any;
        basePrice: any;
        description: any;
        stock: any;
        tags: any;
        isNew: any;
        imageUrl: any;
        imageUrls: string[];
        origin: any;
        shelfLife: any;
        rating: number;
        reviewCount: any;
        reviews: any;
        weightOptions: any;
    }>;
    addReview(productId: number, userId: string, rating: number, comment: string): Promise<{
        user: {
            id: string;
            email: string;
            googleId: string | null;
            name: string;
            password: string | null;
            role: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        productId: number;
        userId: string;
        rating: number;
        comment: string;
    }>;
    formatProduct(p: any): {
        id: any;
        name: any;
        category: any;
        basePrice: any;
        description: any;
        stock: any;
        tags: any;
        isNew: any;
        imageUrl: any;
        imageUrls: string[];
        origin: any;
        shelfLife: any;
        rating: number;
        reviewCount: any;
        reviews: any;
        weightOptions: any;
    };
}
