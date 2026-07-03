export declare class MailService {
    private transporter;
    sendOrderConfirmation(to: string, order: any, gst?: {
        enabled: boolean;
        rate: number;
    }): Promise<void>;
    sendAdminOrderNotification(order: any, gst?: {
        enabled: boolean;
        rate: number;
    }): Promise<void>;
    sendReorderReminder(order: any): Promise<void>;
}
