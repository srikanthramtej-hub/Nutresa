import { PrismaService } from '../prisma/prisma.service';
export declare class PoliciesController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPolicies(): Promise<Record<string, any>>;
    getPolicy(key: string): Promise<any>;
    updatePolicy(key: string, body: {
        title: string;
        content: string;
    }): Promise<{
        id: number;
        updatedAt: Date;
        key: string;
        title: string;
        content: string;
    }>;
}
