import { ChatMessage } from './chat-message';
import { User } from './user';

export interface MessageThread {
    id: string;
    participant: User;
    latestMessage?: ChatMessage;
    unreadMessageCount: number;
}
