export interface ChatMessage {
    senderId: number;
    recipientId: number;
    messageContent: string;
    messageSent: Date;
}
