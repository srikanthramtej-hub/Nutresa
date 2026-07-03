export declare class PdfService {
    generateInvoice(order: any): Promise<Buffer>;
    generateAdminInvoice(order: any): Promise<Buffer>;
}
