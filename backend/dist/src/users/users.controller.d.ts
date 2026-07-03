import { UsersService } from './users.service';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, body: {
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
    addAddress(req: any, body: any): Promise<{
        id: number;
        phone: string;
        label: string;
        state: string;
        userId: string;
        line1: string;
        city: string;
        pin: string;
    }>;
    deleteAddress(req: any, id: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
