import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
export declare class ReorderService {
    private prisma;
    private mail;
    private readonly logger;
    constructor(prisma: PrismaService, mail: MailService);
    sendReorderEmails(): Promise<void>;
}
