export declare function generateOrderPDF(order: any, gst?: {
    enabled: boolean;
    rate: number;
}): Promise<Buffer>;
