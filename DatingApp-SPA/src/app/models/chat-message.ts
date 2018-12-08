export interface ChatMessage {
    threadId: string;
    senderId: number;
    recipientId: number;
    messageContent: string;
    messageSent: Date;
}
