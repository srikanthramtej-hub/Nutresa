import { ProductsService } from './products.service';
export declare class ProductsController {
    private products;
    constructor(products: ProductsService);
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
    addReview(id: number, body: {
        rating: number;
        comment: string;
    }, req: any): Promise<{
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
}
