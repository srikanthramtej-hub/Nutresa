import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string;
        createdAt: Date;
        addresses: {
            id: number;
            phone: string;
            label: string;
            state: string;
            userId: string;
            line1: string;
            city: string;
            pin: string;
        }[];
    }>;
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        googleId: string | null;
        name: string;
        password: string | null;
        role: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addAddress(userId: string, address: any): Promise<{
        id: number;
        phone: string;
        label: string;
        state: string;
        userId: string;
        line1: string;
        city: string;
        pin: string;
    }>;
    deleteAddress(userId: string, addressId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
